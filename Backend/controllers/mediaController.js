import sharp from "sharp";
import { putObject } from "../utils/putObject.js";
import {v4} from "uuid"

export const uploadInlineMedia= async (req,res)=>{

    try {
        if (!req.files || !req.files.inlineMedia){
            return res.status(400).json({
                sucess:false,
                message:"No file uploaded"
            })
        }

        const media = req.files.inlineMedia
        const IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif"
];

const GIF_TYPE = "image/gif";

const VIDEO_TYPES = [
    "video/mp4",
    "video/webm",
    "video/quicktime"
];
  const isImage =IMAGE_TYPES.includes(media.mimetype)
  const isGif = media.mimetype === GIF_TYPE
  const isVideo = VIDEO_TYPES.includes(media.mimetype)

  if(!isImage && !isVideo && !isGif){
    return res.status(400).json({
        success: false,
        message:"Invalid format"
    })
  }
  if((isImage || isGif) && media.size > 10*1024*1024){
    return res.status(400).json({
        success: false,
        message: "Image size exceeds 10MB limit"
    })
  }
  if (isVideo && media.size > 50 * 1024 * 1024) {
    return res.status(400).json({
        success: false,
        message: "Video size exceeds 100MB limit"
    });
}

const mediaId = v4()

if(isImage){
const webpKey = `inline-images/${mediaId}.webp`;
const jpegKey = `inline-images/${mediaId}.jpg`;
const avifKey = `inline-images/${mediaId}.avif`;

const webpBuffer = await sharp(media.data)
    .resize({
        width: 1400,
        withoutEnlargement: true
    })
    .webp({ quality: 80 })
    .toBuffer();
const jpegBuffer = await sharp(media.data)
    .resize({
        width: 1400,
        withoutEnlargement: true
    })
    .jpeg({ quality: 85 })
    .toBuffer();
const avifBuffer = await sharp(media.data)
    .resize({
        width: 1400,
        withoutEnlargement: true
    })
    .avif({ quality: 60 })
    .toBuffer();

const [
    webpUpload,
    jpegUpload,
    avifUpload
] = await Promise.all([

    putObject(
        webpBuffer,
        webpKey,
        "image/webp"
    ),

    putObject(
        jpegBuffer,
        jpegKey,
        "image/jpeg"
    ),

    putObject(
        avifBuffer,
        avifKey,
        "image/avif"
    )

]);
return res.status(200).json({
    success: true,

    type: "image",

    urls: {
        webp: webpUpload.url,
        jpeg: jpegUpload.url,
        avif: avifUpload.url
    }
});
}
if(isGif){

const gifKey = `inline-gif/${mediaId}.gif`
const gifUpload= await putObject(media.data,gifKey,media.mimetype)

return res.status(200).json({
    sucess:true,
    type:"gif",
    urls:{
        url:gifUpload.url
    }
})
}


 if (isVideo) {

            const videoKey = `inline-videos/${mediaId}`;

            const videoUpload = await putObject(
                media.data,
                videoKey,
                media.mimetype
            );


            return res.status(200).json({

                success: true,

                type: "video",

                urls: {
                    url: videoUpload.url
                }

            });
        }


    } catch (error) {
        console.error("Inline media upload error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}