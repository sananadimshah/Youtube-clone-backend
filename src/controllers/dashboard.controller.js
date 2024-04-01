import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  try {
    const channel = await User.findById(req.user?._id);
    if (!channel) {
      throw new ApiError(404, "Channel not found");
    }
    const ChannelStats = await Video.aggregate([
      {
        $match: {
          owner: channel._id,
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
        $lookup: {
          from: "subscriptions",
          localField: "owner",
          foreignField: "channel",
          as: "subscribers",
        },
      },
      {
        $group: {
          _id: null,
          totalVideo: {
            $sum: 1,
          },
          totalViews: {
            $sum: "$views",
          },
          totalLikes: {
            $sum: { $size: "$likedVideo" },
          },
          totalSubscriber: {
            $sum: { $size: "$subscribers" },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalSubscriber: 1,
          totalLikes: 1,
          totalVideo: 1,
          totalViews: 1,
        },
      },
    ]);
    console.log(ChannelStats);
    if (ChannelStats.length === 0) {
      throw new ApiError(400, "Error while having Channel Stats");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, ChannelStats[0], "Get Channel Stats Successfully")
      );
  } catch (error) {
    return res.status(500).send(error.msg);
  }
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
