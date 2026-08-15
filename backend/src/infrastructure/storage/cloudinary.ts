import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

import { env } from "../../config/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const uploadImage = (
  buffer: Buffer,
  folder: string,
): Promise<{
  url: string;
  publicId: string;
}> => {
  return new Promise((resolve, reject) => {
    const stream =
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
        },
        (error, result) => {
          if (error || !result) {
            return reject(error);
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const deleteImage = async (
  publicId: string,
) => {
  await cloudinary.uploader.destroy(publicId);
};