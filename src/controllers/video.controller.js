import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteOnCloudinaryVideo,
  deleteOnCloudinaryImage,
} from "../utils/fileUpload.js";
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.params;

  const option = {
    page: Number(page) || 1,
    limit: Number(limit) || 1,
  };
  const video = await Video.find();
  if (!video) {
    throw new ApiError(400, "can't get the videos");
  }
  const result = await Video.aggregatePaginate(video, option);
  if (!result) {
    throw new ApiError(400, "can't get the videos");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Video fetch Successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new Error("Title and description are required.");
    }
    const videoFile = req.files?.videoFile[0]?.path;
    const thumbnailFile = req.files?.thumbnail[0]?.path;

    if (!videoFile || !thumbnailFile) {
      throw new ApiError("Video file and thumbnail file are required.");
    }

    const videoFileResponse = await uploadOnCloudinary(videoFile);
    const thumbnailFileResponse = await uploadOnCloudinary(thumbnailFile);

    if (!videoFileResponse.url || !thumbnailFileResponse.url) {
      throw new ApiError("Error while uploading video file or thumbnail file.");
    }

    const newVideo = await Video.create({
      title,
      description,
      videoFile: videoFileResponse.url,
      thumbnail: thumbnailFileResponse.url,
      duration: videoFileResponse.duration,
      owner: req.user?._id,
    });

    if (!newVideo) {
      throw new ApiError("Error while creating newVideo");
    }
    return res.status(201).json({
      status: true,
      data: newVideo,
      message: "Video published successfully.",
    });
  } catch (error) {
    return res.status(500).send(error.msg);
  }
});
//   // TODO: get video, upload to cloudinary, create video

//   try {
//     const { title, description, duration } = req.body;
//     if (!title || !description) {
//       throw new ApiError(400, "All filed are required");
//     }
//     const Video = req.files.videoFile[0].path;
//     console.log(Video);
//     if (!Video) {
//       throw new ApiError(400, "Video file is missing");
//     }
//     const videoFile = await uploadOnCloudinary(Video);
//     console.log(videoFile);
//     if (!videoFile.url) {
//       throw new ApiError(400, "Error while uploading Video file");
//     }
//     const thumbnailFile = req.files.thumbnail[0].path;
//     console.log(thumbnailFile);
//     if (!thumbnailFile) {
//       throw new ApiError(400, "thumbnailFile is missing");
//     }
//     const thumbnails = await uploadOnCloudinary(thumbnailFile);
//     console.log(thumbnails);
//     if (!thumbnails.url) {
//       throw new ApiError(400, "Error while uploading thumbnail file");
//     }

//     const createVideo = await Video.create({
//       title,
//     });
//     if (!createVideo) {
//       throw new ApiError(500, "Something went wrong while Creating the video");
//     }
//     return res
//       .status(201)
//       .json(new ApiResponse(200, createVideo, "SuccessFully Published Video"));
//   } catch (error) {
//     console.error(error);
//     return res.status(500).send({ status: false, msg: error.msg });
//   }
// });

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const getVideo = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!getVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getVideo, "SuccessFully get the Video"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(400, "Video not Found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const obj = {};
  const { title, description } = req.body;
  const thumbnail = req.file?.path;
  if (thumbnail) {
    await deleteOnCloudinaryImage(video.thumbnail);
    const thumbnailfile = await uploadOnCloudinary(thumbnail);
    if (!thumbnailfile.url) {
      throw new ApiError(400, "Error while uploading thumbnailFile");
    }
    obj.thumbnailfile = thumbnailfile.url;
  }
  if (title) {
    obj.title = title;
  }
  if (description) {
    obj.description = description;
  }
  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: obj.title || video.title,
        description: obj.description || video.description,
        thumbnail: obj.thumbnailfile || video.thumbnail,
      },
    },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(400, "Error while update data");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "SuccessFully updated the Video"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    if (!videoId) {
      throw new ApiError(400, "Please provide videoId");
    }
    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid videoId");
    }
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (video.owner.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }
    const videoFile = video.videoFile.public_id;
    const thumbnail = video.thumbnail.public_id;

    await deleteOnCloudinaryVideo(videoFile);
    await deleteOnCloudinaryImage(thumbnail);

    const deletedVideo = await Video.findByIdAndDelete(videoId);
    if (!deletedVideo) {
      return res
        .status(200)
        .json(new ApiResponse(200, "This video is already deleted"));
    } else {
      return res
        .status(200)
        .json(new ApiResponse(200, "Successfully deleted video"));
    }
  } catch (error) {
    return res.status(500).send(error.msg);
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);
  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  if (video.isPublished === true) {
    const unPublished = await Video.findByIdAndUpdate(
      videoId,
      { $set: { isPublished: false } },
      { new: true }
    );
    return res
      .status(200)
      .json(200, new ApiResponse(unPublished, "SuccessFully Unpublished"));
  }
  if (video.isPublished === false) {
    const Published = await Video.findByIdAndUpdate(
      videoId,
      { $set: { isPublished: true } },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, Published, "SuccessFully Published"));
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
