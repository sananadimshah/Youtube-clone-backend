import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

  const aggregate = Video.aggregate([
    [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.user._id),
        },
      },
      {
        $lookup: {
          from: "likes",
          localField: "_id",
          foreignField: "video",
          as: "likedVideo",
        },
      },
      {
        $addFields: {
          totalLikes: {
            $size: "$likedVideo",
          },
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscriber",
        },
      },
      {
        $addFields: {
          totalSubscriber: {
            $size: "$subscriber",
          },
        },
      },
      {
        $project: {
          totalSubscriber: 1,
          totalLikes: 1,
        },
      },
    ],
  ]);
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const channelVideo = await Video.find({ owner: req.user._id });
  if (!channelVideo) {
    throw new ApiError(404, "No video found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, channelVideo, "Successfully Get Channel Video"));
});

export { getChannelStats, getChannelVideos };
