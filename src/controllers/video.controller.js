import mongoose, { ConnectionStates, isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  //TODO: get all videos based on query, sort, pagination

  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  const pipeline = [];
  if (query) {
    pipeline.push({
      $search: {
        text: {
          path: ["title", "description"],
          query: "query",
        },
      },
    });
  }
  if (userId) {
    if (!mongoose.isValidObjectId(userId)) {
      throw new ApiError(404, "Invalid userId");
    }
    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        sortBy: sortType,
      },
    });
  }
  const option = {
    page: parseInt(page, 10) || 1,
    limit: parseInt(limit, 10) || 10,
  };
  const aggregation = await Video.aggregation(pipeline);
  const result = await Video.aggregatePaginate(aggregation, option);
  if (!result) {
    throw new ApiError(400, "Something Went wrong");
  }
  return res
    .status(200)
    .send(200, new ApiResponse(result, "SuccessFully get the Video"));
});

//

const publishAVideo = asyncHandler(async (req, res) => {
  // TODO: get video, upload to cloudinary, create video

  const { title, description, duration } = req.body;
  if (!title || !description) {
    throw new ApiError(400, "All filed are required");
  }
  if (!duration && typeof duration != "number") {
    throw new ApiError(400, "Pls provide Duration in proper format");
  }

  const Video = req.file?.path;
  if (!Video) {
    throw new ApiError(400, "Video file is missing");
  }
  const videoFile = await uploadOnCloudinary(Video);
  if (!videoFile.url) {
    throw new ApiError(400, "Error while uploading Video file");
  }
  const thumbnailFile = req.file?.path;
  if (!thumbnailFile) {
    throw new ApiError(400, "thumbnailFile is missing");
  }
  const thumbnail = await uploadOnCloudinary(thumbnail);
  if (!thumbnail.url) {
    throw new ApiError(400, "Error while uploading thumbnail file");
  }
  const createVideo = await Video.create({
    title,
    description,
    thumbnail: thumbnail.url,
    videoFile: videoFile.url,
    duration,
    owner: req.user?._id,
  });
  return res
    .status(200)
    .send(200, new ApiResponse(createVideo, "SuccessFully Published Video"));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const getVideo = await Video.findbyId(videoId);
  if (!getVideo) {
    throw new ApiError(404, "Video not found");
  }
  return res
    .status(200)
    .send(200, new ApiResponse(getVideo, "SuccessFully get the Video"));
});

const updateVideo = asyncHandler(async (req, res) => {
  //TODO: update video details like title, description, thumbnail
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const { title, description } = req.body;
  const obj = {};
  const thumbnail = req.file?.path;
  if (thumbnail) {
    const thumbnailfile = await uploadOnCloudinary(thumbnail);
    if (!thumbnailfile.url) {
      throw new ApiError(400, "Error while uploading thumbnailFile");
    }
    obj.thumbnailfile;
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
        data: obj,
        thumbnail: obj.thumbnailfile.url,
      },
    },
    { new: true }
  );
  if (!updatedVideo) {
    throw new ApiError(400, "Error while update data");
  }
  return res
    .status(200)
    .send(200, new ApiResponse(updatedVideo, "SuccessFully updated the Video"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const deletedVideo = await Video.deleteOne({ videoId });
  if (!deletedVideo) {
    throw new ApiError(400, "Video Can't be Delete try again later");
  }
  return res
    .status(200)
    .send(200, new ApiResponse(deletedVideo, "SuccessFully Deleted the Video"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "please provide VideoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const publishStatus = await Video.findbyId(videoId);
  if (publishStatus.isPublished === true) {
    const unPublished = await Video.findByIdAndUpdate(
      videoId,
      { $set: { isPublished: false } },
      { new: true }
    );
    return res
      .status(200)
      .json(200, new ApiResponse(unPublished, "SuccessFully Unpublished"));
  }
  if (publishStatus.isPublished === false) {
    const Published = await Video.findByIdAndUpdate(
      videoId,
      { $set: { isPublished: true } },
      { new: true }
    );
    return res
      .status(200)
      .json(200, new ApiResponse(Published, "SuccessFully Published"));
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
