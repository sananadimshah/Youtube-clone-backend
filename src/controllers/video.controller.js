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
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  console.log(userId);
  const pipeline = [];

  // for using Full Text based search u need to create a search index in mongoDB atlas
  // you can include field mapppings in search index eg.title, description, as well
  // Field mappings specify which fields within your documents should be indexed for text search.
  // this helps in seraching only in title, desc providing faster search results
  // here the name of search index is 'search-videos'
  if (query) {
    pipeline.push({
      $search: {
        index: "search-videos",
        text: {
          query: query,
          path: ["title", "description"], //search only on title, desc
        },
      },
    });
  }

  if (userId) {
    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "Invalid userId");
    }

    pipeline.push({
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    });
  }

  // fetch videos only that are set isPublished as true
  pipeline.push({ $match: { isPublished: true } });

  //sortBy can be views, createdAt, duration
  //sortType can be ascending(-1) or descending(1)
  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    });
  } else {
    pipeline.push({ $sort: { createdAt: -1 } });
  }

  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails",
    }
  );

  const videoAggregate = Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };

  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

// const getAllVideos = asyncHandler(async (req, res) => {
//   const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
//   //TODO: get all videos based on query, sort, pagination
//   const options = {
//     page: Number(page) || 1,
//     limit: Number(limit) || 10,
//   };
//   const pipeline = [];
//   if (userId) {
//     pipeline.push({
//       $match: {
//         _id: new mongoose.Types.ObjectId(userId),
//       },
//     });
//   }
//   if (query){
//     console.log(query);
//     pipeline.push({
//       $match: {
//         $text: {
//           $search: query,
//         },
//       },
//     });
//   }
//   console.log("sortBy:", sortBy);
//   console.log("sortType:", sortType);
//   if (sortBy && sortType) {
//     let sortObj = {};
//     sortObj[sortBy] = sortType === "asc" ? 1 : -1;
//     pipeline.push({
//       $sort: sortObj,
//     });
//   }

//   const aggregate = await Video.aggregate(pipeline);
//   const result = await Video.aggregatePaginate(aggregate, options);
//   if (!result) {
//     throw new ApiError(400, "can't get the video");
//   }
//   res
//     .status(200)
//     .json(new ApiResponse(200, result, "Video fetch Successfully"));
// });

const publishAVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      throw new Error("Title and description are required.");
    }
    const videoFile = req.files?.videoFile[0]?.path;
    const thumbnailFile = req.files?.thumbnail[0]?.path;
    console.log(videoFile);
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
    console.log(newVideo);
    if (!newVideo) {
      throw new ApiError("Error while creating newVideo");
    }
    return res.status(201).json({
      status: true,
      data: newVideo,
      message: "Video published successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
});
// const publishAVideo = asyncHandler(async (req, res) => {
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
  const obj = {};
  const { title, description } = req.body;
  const thumbnail = req.file?.path;
  if (thumbnail) {
    await deleteOnCloudinary(video.thumbnail);
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
    // Taking out thumbnail and video file
    const videoFile = video.videoFile.public_id;
    const thumbnail = video.thumbnail.public_id;

    // Delete video file and thumbnail from cloudinary
    await deleteOnCloudinaryVideo(videoFile);
    await deleteOnCloudinaryImage(thumbnail);

    // Delete the video from the database
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
    return res
      .status(error.status || 500)
      .json({ status: false, msg: error.message });
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
  const publishStatus = await Video.findById(videoId);
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
