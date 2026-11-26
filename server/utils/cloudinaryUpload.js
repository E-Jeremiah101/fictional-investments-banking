import cloudinary from "../config/cloudinary.js";

// Uploads a Buffer to Cloudinary. Returns the Cloudinary upload result.
export const uploadBufferToCloudinary = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "loan-government-ids",
        resource_type: "auto", // PDFs are "auto"/"raw"; images are "image"
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });

// Deletes a previously uploaded asset by public_id. Best-effort: logs but
// does not throw, so a failed cleanup can't fail the user's request.
export const deleteCloudinaryAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "auto" });
  } catch (error) {
    console.error("Cloudinary cleanup error:", error.message);
  }
};