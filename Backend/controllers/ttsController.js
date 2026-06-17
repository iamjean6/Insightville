import dotenv from "dotenv";
dotenv.config();

import crypto from "crypto";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../utils/s3-credentials.js";
import { putObject } from "../utils/putObject.js";
import User from "../model/userModel.js";

// Reuse a single client instance across requests (avoids repeated auth overhead)
const ttsClient = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    ? new TextToSpeechClient({ credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) })
    : new TextToSpeechClient();

export const streamTTS = async (req, res) => {
    // 1. Verify User and Credits
    const userId = req.user._id;
    const { text, voiceId = "en-US-Chirp3-HD-Algieba" } = req.body;

    console.log(`[TTS] Request received. UserID: ${userId}, Text length: ${text?.length}`);

    if (!text) {
        return res.status(400).json({ success: false, message: "Text is required" });
    }

    try {
        const user = await User.findById(userId);
        console.log(`[TTS] User verified. Current credits: ${user?.credits}`);

        if (!user || user.credits <= 0) {
            return res.status(402).json({ success: false, message: "Insufficient credits. Please purchase more." });
        }

        // 2. Hash the text for S3 cache key
        const textToSpeak = text.slice(0, 8000);
        const textHash = crypto.createHash("md5").update(textToSpeak).digest("hex");
        const fileName = `tts-cache/${voiceId}_${textHash}.mp3`;
        const bucketParams = { Bucket: process.env.AWS_S3_BUCKET, Key: fileName };

        // 3. Check S3 cache first
        try {
            await s3Client.send(new HeadObjectCommand(bucketParams));
            console.log(`[TTS] Cache HIT for ${fileName}`);

            // Deduct credit
            await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });

            // Stream cached audio from S3 to client
            const s3Response = await s3Client.send(new GetObjectCommand(bucketParams));
            res.setHeader("Content-Type", "audio/mpeg");
            return s3Response.Body.pipe(res);

        } catch (s3Error) {
            if (s3Error.name !== "NotFound" && s3Error.$metadata?.httpStatusCode !== 404) {
                console.error("[TTS] S3 HeadObject Error:", s3Error);
            }
            console.log(`[TTS] Cache MISS for ${fileName}. Calling Google Cloud TTS...`);
        }

        // 4. Cache miss — call Google Cloud TTS (chunked to respect 5000-byte limit)
        const chunks = chunkText(textToSpeak, 4800);
        console.log(`[TTS] Synthesizing ${chunks.length} chunk(s) via Google Cloud TTS...`);

        const voiceConfig = {
            languageCode: "en-US",
            name: voiceId,
            ssmlGender: "MALE",
        };
        const audioConfig = {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0.0,
            volumeGainDb: 0.0,
        };

        // Synthesize all chunks in parallel
        const chunkResults = await Promise.all(
            chunks.map(chunk =>
                ttsClient.synthesizeSpeech({
                    input: { text: chunk },
                    voice: voiceConfig,
                    audioConfig,
                })
            )
        );

        // Concatenate all MP3 buffers in order
        const audioBuffer = Buffer.concat(
            chunkResults.map(([r]) => Buffer.from(r.audioContent))
        );

        console.log(`[TTS] Google Cloud TTS successful (${audioBuffer.length} bytes). Deducting credit...`);
        await User.findByIdAndUpdate(userId, { $inc: { credits: -1 } });

        // Send audio immediately to the user
        res.setHeader("Content-Type", "audio/mpeg");
        res.end(audioBuffer);

        // Upload to S3 in the background for future cache hits
        console.log("[TTS] Initiating background S3 upload for caching...");
        putObject(audioBuffer, fileName, "audio/mpeg").catch(err => {
            console.error("[TTS] Background S3 Upload failed:", err);
        });

    } catch (error) {
        console.error("[TTS] Process Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to generate speech" });
    }
};

/**
 * Splits text into chunks that are each at most `maxBytes` bytes (UTF-8).
 * Splits at sentence boundaries (. ! ?) where possible to avoid mid-sentence cuts.
 */
function chunkText(text, maxBytes = 4800) {
    const chunks = [];
    // Split into sentences on . ! ? followed by whitespace or end-of-string
    const sentences = text.split(/(?<=[.!?])\s+/);
    let current = "";

    for (const sentence of sentences) {
        const candidate = current ? current + " " + sentence : sentence;
        if (Buffer.byteLength(candidate, "utf8") <= maxBytes) {
            current = candidate;
        } else {
            // Current chunk is full — save it and start a new one
            if (current) chunks.push(current.trim());
            // If a single sentence is longer than maxBytes, hard-split it by words
            if (Buffer.byteLength(sentence, "utf8") > maxBytes) {
                const words = sentence.split(" ");
                let part = "";
                for (const word of words) {
                    const next = part ? part + " " + word : word;
                    if (Buffer.byteLength(next, "utf8") <= maxBytes) {
                        part = next;
                    } else {
                        if (part) chunks.push(part.trim());
                        part = word;
                    }
                }
                if (part) current = part;
            } else {
                current = sentence;
            }
        }
    }

    if (current.trim()) chunks.push(current.trim());
    return chunks;
}
