import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3-credentials.js";

export const deleteObject = async (key) => {
    try {
        const command = new DeleteObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        });
        const data = await s3Client.send(command);
        const status = data.$metadata.httpStatusCode;
        if (status === 204 || status === 200) {
            return { status, message: "Object deleted successfully" };
        }
        return { status, message: "S3 deletion failed" };
    } catch (error) {
        console.error("S3 deletion error:", error);
        const status = error.$metadata?.httpStatusCode || 500;
        return { status, message: error.message || "Internal Server Error" };
    }
}