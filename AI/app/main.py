"""FastAPI application demonstrating ADK Bidi-streaming with WebSocket."""

import asyncio
import json
import logging
import os
import time
import warnings
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from google.adk.runners import Runner
from google.adk.agents.run_config import RunConfig, StreamingMode
from google.adk.agents.live_request_queue import LiveRequestQueue
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google_research.agent import agent

logging.basicConfig(level=logging.DEBUG,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')

logger = logging.getLogger(__name__)

warnings.filterwarnings("ignore", category=UserWarning, module="pydantic")

load_dotenv(Path(__file__).parent.parent / '.env')

APP_NAME="Rizzen Bidi-Stream"

app=FastAPI(title=APP_NAME, description="A FastAPI application for ADK Bidi-streaming with WebSocket.")



session_service = InMemorySessionService()

runner = Runner(agent=agent,
                session_service=session_service,
                app_name=APP_NAME,)


@app.websocket("/ws/{user_id}/{session_id}")
async def websocket_endpoint(websocket: WebSocket, user_id:str, session_id: str) -> None:
    logger.debug(f"WebSocket connection request: user_id={user_id}, session_id={session_id}")
    await websocket.accept()
    logger.debug(f"WebSocket connection accepted")

    # --- CONTEXT INJECTION & SETUP ---
    system_instruction = None
    first_message_handled = False
    first_audio_blob = None
    first_text_content = None

    try:
        # Wait up to 3 seconds for an initial setup message
        message = await asyncio.wait_for(websocket.receive(), timeout=3.0)
        if "text" in message:
            text_data = message["text"]
            json_message = json.loads(text_data)
            if json_message.get("type") == "setup":
                draft_context = json_message.get("context", "")
                logger.debug(f"Received setup message. Context length: {len(draft_context)}")
                
                instruction_text = (
                    f"The user is writing a blog post. Here is the current draft:\n\n{draft_context}\n\n"
                    "Help them brainstorm, correct grammar, and act as a co-author. "
                    "CRITICAL: You are an audio-first agent. Do NOT use ANY markdown formatting like asterisks (**) or hashes (#). "
                    "When the user asks for a list or multiple options, you MUST provide all of them in full conversational sentences. "
                    "Do NOT truncate your response."
                )
                
                system_instruction = types.Content(
                    parts=[types.Part(text=instruction_text)]
                )
                first_message_handled = True
            elif json_message.get("type") == "text":
                first_text_content = types.Content(parts=[types.Part(text=json_message["text"])])
        elif "bytes" in message:
            first_audio_blob = types.Blob(mime_type="audio/pcm;rate=16000", data=message["bytes"])
    except asyncio.TimeoutError:
        logger.debug("No setup message received within timeout. Proceeding without draft context.")
    except Exception as e:
        logger.warning(f"Error reading initial setup message: {e}")

    model_name= agent.model
    is_native_audio = "native-audio" in model_name.lower()

    if is_native_audio:
        response_modalities=['AUDIO']
        run_config = RunConfig(
            streaming_mode=StreamingMode.BIDI, 
            response_modalities=response_modalities,
            input_audio_transcription=types.AudioTranscriptionConfig(),
            output_audio_transcription=types.AudioTranscriptionConfig(),
            session_resumption=types.SessionResumptionConfig(),
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Kore"
                    )
                ),
                language_code="en-US",
            )
        )
        logger.debug(f"Using native audio model: {model_name}")
    else:
        response_modalities = ["TEXT"]
        run_config = RunConfig(
            streaming_mode=StreamingMode.BIDI,
            response_modalities=response_modalities,
            input_audio_transcription=None,
            output_audio_transcription=None,
            session_resumption=types.SessionResumptionConfig(),
        )
        logger.debug(f"Half-cascade model detected: {model_name}, using TEXT response modality")
    logger.debug(f"RunConfig created: {run_config}")

    session = await session_service.get_session(
        app_name=APP_NAME,
        session_id=session_id,
        user_id=user_id,
    )    
    if not session:
        logger.debug(f"No existing session found, creating new session for session_id={session_id}, user_id={user_id}")
        session = await session_service.create_session(
            app_name=APP_NAME,
            session_id=session_id,
            user_id=user_id,
        )
    live_request_queue = LiveRequestQueue()

    # Send the system instruction context as the first message if it exists
    if system_instruction:
        live_request_queue.send_content(system_instruction)

    # Process any input received during the setup window
    if first_audio_blob:
        live_request_queue.send_realtime(first_audio_blob)
    if first_text_content:
        live_request_queue.send_content(first_text_content)

    # Shared state for TTFB tracking
    tracking_state = {
        "last_input_time": time.time(),
        "first_byte_logged": first_message_handled or (first_audio_blob is None and first_text_content is None)
    }

    async def upstream_task() -> None:
        """Receives messages from WebSocket and sends to LiveRequestQueue."""
        logger.debug("upstream_task started")
        while True:
            # Receive message from WebSocket (text or binary)
            message = await websocket.receive()
            
            # Reset TTFB tracker on new input
            tracking_state["last_input_time"] = time.time()
            tracking_state["first_byte_logged"] = False

            # Handle binary frames (audio data)
            if "bytes" in message:
                audio_data = message["bytes"]
                logger.debug(f"Received binary audio chunk: {len(audio_data)} bytes")

                audio_blob = types.Blob(
                    mime_type="audio/pcm;rate=16000",
                    data=audio_data
                )
                live_request_queue.send_realtime(audio_blob)

            # Handle text frames (JSON messages)
            elif "text" in message:
                text_data = message["text"]
                logger.debug(f"Received text message: {text_data[:100]}...")

                json_message = json.loads(text_data)

                # Extract text from JSON and send to LiveRequestQueue
                if json_message.get("type") == "text":
                    logger.debug(f"Sending text content: {json_message['text']}")
                    content = types.Content(parts=[types.Part(text=json_message["text"])])
                    live_request_queue.send_content(content)

                # Handle image data
                elif json_message.get("type") == "image":
                    import base64
                    logger.debug(f"Received image data")

                    # Decode base64 image data
                    image_data = base64.b64decode(json_message["data"])
                    mime_type = json_message.get("mimeType", "image/jpeg")

                    logger.debug(f"Sending image: {len(image_data)} bytes, type: {mime_type}")

                    # Send image as blob
                    image_blob = types.Blob(
                        mime_type=mime_type,
                        data=image_data
                    )
                    live_request_queue.send_realtime(image_blob)

    async def downstream_task() -> None:
        """Receives Events from run_live() and sends to WebSocket."""
        logger.debug("downstream_task started, calling runner.run_live()")
        logger.debug(f"Starting run_live with user_id={user_id}, session_id={session_id}")
        async for event in runner.run_live(
            user_id=user_id,
            session_id=session_id,
            live_request_queue=live_request_queue,
            run_config=run_config
        ):
            # TTFB Telemetry
            if not tracking_state["first_byte_logged"]:
                ttfb = (time.time() - tracking_state["last_input_time"]) * 1000
                logger.info(f"TTFB: {ttfb:.2f} ms")
                tracking_state["first_byte_logged"] = True

            event_json = event.model_dump_json(exclude_none=True, by_alias=True)
            logger.debug(f"[SERVER] Event: {event_json}")
            await websocket.send_text(event_json)
        logger.debug("run_live() generator completed")

    # Run both tasks concurrently
    # Exceptions from either task will propagate and cancel the other task
    try:
        logger.debug("Starting asyncio.gather for upstream and downstream tasks")
        await asyncio.gather(
            upstream_task(),
            downstream_task()
        )
        logger.debug("asyncio.gather completed normally")
    except WebSocketDisconnect:
        logger.debug("Client disconnected normally")
    except Exception as e:
        logger.error(f"Unexpected error in streaming tasks: {e}", exc_info=True)
    finally:
        # ========================================
        # Phase 4: Session Termination
        # ========================================

        # Always close the queue, even if exceptions occurred
        logger.debug("Closing live_request_queue")
        live_request_queue.close()
