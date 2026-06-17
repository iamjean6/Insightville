import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

// Helper to convert base64 to ArrayBuffer for audio playback
function base64ToArray(base64) {
  let standardBase64 = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (standardBase64.length % 4) {
    standardBase64 += '=';
  }
  const binaryString = window.atob(standardBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export default function AICoAuthorPanel({ draftContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [status, setStatus] = useState('disconnected');
  const [isRecording, setIsRecording] = useState(false);
  
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const sessionIdRef = useRef(uuidv4());
  
  // Audio state refs
  const audioContextRef = useRef(null);
  const playerNodeRef = useRef(null);
  const recorderNodeRef = useRef(null);
  const streamRef = useRef(null);

  const isRecordingRef = useRef(false);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep ref in sync for the audio processor closure
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const connectWebSocket = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setStatus('connecting');
    
    let userId = 'anonymous';
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) userId = user._id;
    } catch (e) {
      console.warn("Could not parse user from local storage");
    }

    // Always use Cloud Run by default. To override (e.g. local dev), set VITE_AGENT_WS_URL=ws://localhost:8000 in .env.local
    const wsBase = import.meta.env.VITE_AGENT_WS_URL || 'wss://insightville-agent-307072703525.us-central1.run.app';
    const wsUrl = `${wsBase}/ws/${userId}/${sessionIdRef.current}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setStatus('connected');
      ws.send(JSON.stringify({
        type: 'setup',
        context: draftContent || 'The document is currently empty.'
      }));
      setMessages([{ role: 'ai', text: "Hi! I've read your current draft. How can I help you write today?", id: 'initial', isComplete: true }]);
    };

    ws.onmessage = (event) => {
      try {
        const adkEvent = JSON.parse(event.data);
        
        // Handle input transcription (user speaking)
        if (adkEvent.inputTranscription && adkEvent.inputTranscription.text) {
          const text = adkEvent.inputTranscription.text;
          const finished = adkEvent.inputTranscription.finished;
          setMessages(prev => {
            const newMsgs = [...prev];
            const lastIdx = newMsgs.length - 1;
            if (lastIdx >= 0 && newMsgs[lastIdx].role === 'user' && !newMsgs[lastIdx].isComplete && newMsgs[lastIdx].isTranscription) {
              newMsgs[lastIdx] = {
                ...newMsgs[lastIdx],
                text: newMsgs[lastIdx].text + text,
                isComplete: finished
              };
            } else {
              newMsgs.push({ role: 'user', text, id: uuidv4(), isComplete: finished, isTranscription: true });
            }
            return newMsgs;
          });
        }
        
        let finished = false;
        if (adkEvent.turnComplete || (adkEvent.serverContent && adkEvent.serverContent.turnComplete)) {
          finished = true;
        }

        // Handle output transcription (AI speaking) or Text parts
        let textParts = '';
        if (adkEvent.outputTranscription && adkEvent.outputTranscription.text) {
           textParts = adkEvent.outputTranscription.text;
        } else if (adkEvent.content && adkEvent.content.parts) {
           textParts = adkEvent.content.parts.filter(p => {
             // Prevent UI crash if the model hallucinates base64 audio as text
             if (p.text && p.text.length > 100 && /^[A-Za-z0-9-_]+=*$/.test(p.text.trim())) {
               return false;
             }
             return p.text;
           }).map(p => p.text).join('');
        }

        if (textParts || finished) {
           setMessages(prev => {
             const newMsgs = [...prev];
             const lastIdx = newMsgs.length - 1;
             
             if (lastIdx >= 0 && newMsgs[lastIdx].role === 'ai' && !newMsgs[lastIdx].isComplete) {
                newMsgs[lastIdx] = {
                  ...newMsgs[lastIdx],
                  text: newMsgs[lastIdx].text + textParts,
                  isComplete: finished
                };
             } else if (textParts) {
                newMsgs.push({ role: 'ai', text: textParts, id: uuidv4(), isComplete: finished });
             }
             return newMsgs;
           });
        }

        // Handle incoming audio data
        if (adkEvent.content && adkEvent.content.parts) {
          adkEvent.content.parts.forEach(part => {
            if (part.inlineData && part.inlineData.mimeType?.startsWith("audio/pcm")) {
              if (playerNodeRef.current) {
                const audioBuffer = base64ToArray(part.inlineData.data);
                playerNodeRef.current.port.postMessage(audioBuffer);
              }
            } else if (part.text && part.text.length > 100 && /^[A-Za-z0-9-_]+=*$/.test(part.text.trim())) {
              // Attempt to recover audio if model hallucinates base64 into text part
              if (playerNodeRef.current) {
                try {
                  const audioBuffer = base64ToArray(part.text.trim());
                  playerNodeRef.current.port.postMessage(audioBuffer);
                } catch (e) {
                  console.warn("Failed to recover audio from base64 text", e);
                }
              }
            }
          });
        }

        // Handle turn complete
        if (adkEvent.turnComplete) {
          setMessages(prev => {
            if (prev.length === 0) return prev;
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (lastMsg.role === 'ai' && !lastMsg.isComplete) {
              lastMsg.isComplete = true;
            }
            return newMsgs;
          });
        }
        
        // Handle interrupted
        if (adkEvent.interrupted) {
          if (playerNodeRef.current) {
            playerNodeRef.current.port.postMessage({ command: "endOfAudio" });
          }
          setMessages(prev => {
            if (prev.length === 0) return prev;
            const newMsgs = [...prev];
            const lastMsg = newMsgs[newMsgs.length - 1];
            if (!lastMsg.isComplete) lastMsg.isComplete = true;
            return newMsgs;
          });
        }

      } catch (err) {
        console.error("Failed to parse WebSocket message:", err);
      }
    };

    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('disconnected');
    wsRef.current = ws;
  };

  const disconnectWebSocket = () => {
    stopAudio();
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (isOpen) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }
    return () => disconnectWebSocket();
  }, [isOpen]);

  const initAudio = async () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;

      // Load Worklets from public directory
      await audioCtx.audioWorklet.addModule('/pcm-player-processor.js');
      await audioCtx.audioWorklet.addModule('/pcm-recorder-processor.js');

      // Setup Player
      const playerNode = new AudioWorkletNode(audioCtx, 'pcm-player-processor');
      playerNode.connect(audioCtx.destination);
      playerNodeRef.current = playerNode;

      // Setup Microphone Recorder
      const stream = await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 16000,
      }});
      streamRef.current = stream;

      const source = audioCtx.createMediaStreamSource(stream);
      const recorderNode = new AudioWorkletNode(audioCtx, 'pcm-recorder-processor');
      
      const bufferSize = 2048; // Send ~128ms of audio at a time
      const sendBuffer = new Int16Array(bufferSize);
      let bufferIndex = 0;

      recorderNode.port.onmessage = (event) => {
        // event.data is Float32Array from mic (typically 128 samples per block)
        if (wsRef.current?.readyState === WebSocket.OPEN && isRecordingRef.current) {
           const float32Array = event.data;
           for (let i = 0; i < float32Array.length; i++) {
             // Convert Float32 to Int16
             let s = Math.max(-1, Math.min(1, float32Array[i]));
             sendBuffer[bufferIndex++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
             
             if (bufferIndex === bufferSize) {
               // We need to send a copy of the buffer because the ArrayBuffer is referenced
               const chunk = new Int16Array(sendBuffer);
               wsRef.current.send(chunk.buffer);
               bufferIndex = 0;
             }
           }
        }
      };

      source.connect(recorderNode);
      recorderNode.connect(audioCtx.destination);
      recorderNodeRef.current = recorderNode;

      return true;
    } catch (err) {
      console.error("Failed to initialize audio:", err);
      alert("Microphone access denied or error initializing audio.");
      return false;
    }
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    playerNodeRef.current = null;
    recorderNodeRef.current = null;
    setIsRecording(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      // Optional: don't destroy audio context completely, just stop sending
    } else {
      if (!audioContextRef.current) {
        const success = await initAudio();
        if (success) setIsRecording(true);
      } else {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        setIsRecording(true);
      }
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || status !== 'connected') return;
    const messageObj = { type: 'text', text: inputValue };
    setMessages(prev => [...prev, { role: 'user', text: inputValue, id: uuidv4(), isComplete: true }]);
    wsRef.current.send(JSON.stringify(messageObj));
    setInputValue('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl transition-all duration-300 z-50 flex items-center justify-center
          ${isOpen ? 'bg-muted text-muted-foreground scale-90' : 'bg-primary text-primary-foreground hover:scale-105'}
        `}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 h-[500px] bg-card border border-border rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 fade-in duration-300">
          
          <div className="bg-primary/10 p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Sparkles size={18} />
              <span>AI Co-Author</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                {status === 'connected' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'connected' ? 'bg-emerald-500' : status === 'connecting' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm relative ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                    : 'bg-muted/50 text-foreground border border-border/50 rounded-tl-sm'
                }`}>
                  {msg.text}
                  {!msg.isComplete && <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse align-middle" />}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 bg-muted/20 border-t border-border">
            <form onSubmit={sendMessage} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={toggleRecording}
                disabled={status !== 'connected'}
                className={`p-3 rounded-full transition-colors flex-shrink-0 ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {isRecording ? <Mic size={18} /> : <MicOff size={18} />}
              </button>
              
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={status === 'connected' ? "Ask the AI or tap mic..." : "Connecting..."}
                  disabled={status !== 'connected'}
                  className="w-full bg-card border border-border rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || status !== 'connected'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-primary-foreground rounded-full disabled:opacity-50 transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
