import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const streamTTS = async (req, res) => {
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb" } = req.body; // Default voice: Rachel

    if (!text) {
        return res.status(400).json({ success: false, message: "Text is required" });
    }

    const API_KEY = process.env.ELEVENLABS_API_KEY;
    console.log("TTS Request received for text length:", text.length, "Voice:", voiceId);
    if (!API_KEY) {
        console.error("ELEVENLABS_API_KEY is NOT set in .env");
        return res.status(500).json({ success: false, message: "ElevenLabs API Key not configured on server" });
    }

    try {
        const response = await axios({
            method: "post",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
            data: {
                text: text.slice(0, 5000),
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5,
                },
            },
            headers: {
                Accept: "audio/mpeg",
                "xi-api-key": API_KEY,
                "Content-Type": "application/json",
            },
            responseType: "stream",
        });

        if (response.status !== 200) {
            console.error("ElevenLabs API returned status:", response.status);
            return res.status(response.status).json({ success: false, message: "ElevenLabs API Error" });
        }

        res.setHeader("Content-Type", "audio/mpeg");
        response.data.pipe(res);
    } catch (error) {
        if (error.response) {
            console.error("ElevenLabs API Error Status:", error.response.status);

            // Because responseType is 'stream', we need to collect the stream data to read the error JSON
            let errorData = "";
            error.response.data.on("data", (chunk) => {
                errorData += chunk;
            });

            error.response.data.on("end", () => {
                try {
                    const parsedError = JSON.parse(errorData);
                    console.error("ElevenLabs Detailed Error:", parsedError);
                } catch (e) {
                    console.error("ElevenLabs Raw Error Data:", errorData);
                }
            });
        } else {
            console.error("ElevenLabs Connection Error:", error.message);
        }
        res.status(500).json({ success: false, message: "Failed to generate speech" });
    }
};
