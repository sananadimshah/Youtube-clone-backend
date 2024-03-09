import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  // cloudinary configuration
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCloudinary = async (localFilePath) => {
  // async as uploading takes some time.
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary.
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been successfully uploaded.
    // console.log("File successfully uploaded on cloudinary", response.url);

    // Remove the locally saved temporary file. i.e. from the public folder
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // Remove the locally saved temporary file as upload failed.
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export const deleteOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const Deleteresponse = await cloudinary.uploader.destroy(localFilePath);
    return Deleteresponse;
  } catch (error) {
    return res.status(500).json(error.msg);
  }
};
