import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../utils/s3-credentials.js";
import { putObject } from "../utils/putObject.js";
import User from "../model/userModel.js";

export const streamTTS = async (req, res) => {
    // 1. Verify User and Credits
    const userId = req.user._id; 
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb" } = req.body; 

    console.log(`[TTS] Request received. UserID: ${userId}, Text length: ${text?.length}`);

    if (!text) {
        return res.status(400).json({ success: false, message: "Text is required" });
    }

    try {
        const user = await User.findById(userId);
        console.log(`[TTS] User verified.for user:${user} Current credits: ${user?.credits}`);
        
        if (!user || user.credits <= 0) {
            return res.status(402).json({ success: false, message: "Insufficient credits. Please purchase more." });
        }

        // 2. Hash the text for S3 filename
        const textHash = crypto.createHash("md5").update(text).digest("hex");
        const fileName = `tts-cache/${voiceId}_${textHash}.mp3`;
        const bucketParams = { Bucket: process.env.AWS_S3_BUCKET, Key: fileName };

        // 3. Check if cached in S3
        try {
            await s3Client.send(new HeadObjectCommand(bucketParams));
            console.log(`[TTS] Cache HIT for ${fileName}`);

            // Deduct credit
            await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });

            // Stream from S3 to client
            const s3Response = await s3Client.send(new GetObjectCommand(bucketParams));
            res.setHeader("Content-Type", "audio/mpeg");
            return s3Response.Body.pipe(res);

        } catch (s3Error) {
            if (s3Error.name !== "NotFound" && s3Error.$metadata?.httpStatusCode !== 404) {
                console.error("S3 HeadObject Error:", s3Error);
            }
            console.log(`[TTS] Cache MISS for ${fileName}. Calling ElevenLabs...`);
        }

        // 4. Fallback to ElevenLabs (Cache Miss)
        const API_KEY = process.env.ELEVENLABS_API_KEY;
        if (!API_KEY) {
            console.error("[TTS] ElevenLabs API Key not configured");
            return res.status(500).json({ success: false, message: "ElevenLabs API Key not configured" });
        }

        console.log("[TTS] Sending request to ElevenLabs API...");
        const response = await axios({
            method: "post",
            url: `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
            data: {
                text: text.slice(0, 5000),
                model_id: "eleven_multilingual_v2",
                voice_settings: { stability: 0.5, similarity_boost: 0.5 },
            },
            headers: {
                Accept: "audio/mpeg",
                "xi-api-key": API_KEY,
                "Content-Type": "application/json",
            },
            responseType: "arraybuffer", // Buffer it in memory so we can upload it
        });

        console.log("[TTS] ElevenLabs request successful. Deducting credit...");
        // Deduct credit since generation succeeded
        await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });

        const audioBuffer = Buffer.from(response.data);

        // Send immediately to user
        res.setHeader("Content-Type", "audio/mpeg");
        res.end(audioBuffer);

        // Upload to S3 in the background using their existing putObject utility
        console.log("[TTS] Initiating background S3 upload for caching...");
        putObject(audioBuffer, fileName, "audio/mpeg").catch(err => {
            console.error("[TTS] Background S3 Upload failed:", err);
        });

    } catch (error) {
        console.error("[TTS] Process Error:", error.message);
        if (error.response?.data) {
            try {
                const parsedError = JSON.parse(error.response.data.toString());
                console.error("ElevenLabs Detailed Error:", parsedError);
            } catch (e) {
                console.error("Raw Error Data:", error.response.data.toString());
            }
        }
        res.status(500).json({ success: false, message: "Failed to generate speech" });
    }
};
