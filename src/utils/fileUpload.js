import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const reponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    fs.unlinkSync(localFilePath);
    // console.log("file is uploaded on cloudinary", reponse.url);
    return reponse;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    // remove the locally saved temporary file as the uplaod operation got failed
    return null;
  }
};

export { uploadOnCloudinary };
