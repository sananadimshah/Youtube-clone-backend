import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!channelId) {
    throw new ApiError(400, "Please provide channelId");
  }
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  try {
    const findSubscription = await Subscription.findOne({ channel: channelId });
    if (findSubscription) {
      await Subscription.deleteOne({ channel: channelId });
      return res
        .status(200)
        .json({ status: true, msg: "SuccessFully unSubscrided Channel" });
    }
    console.log(findSubscription);
    if (!findSubscription) {
      const subscribe = await Subscription.create({
        channel: channelId,
        subscriber: req.user._id,
      });
      return res
        .status(201)
        .json(
          new ApiResponse(200, subscribe, "Successfully Channel Subscride")
        );
    }
  } catch (error) {
    throw new ApiError(500, "Something went wrong");
  }
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  let { channelId } = req.params;
  console.log(channelId);
  if (!channelId) {
    throw new ApiError(400, "Please provide channelId");
  }
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  channelId = new mongoose.Types.ObjectId(channelId);
  try {
    const subscribers = await Subscription.aggregate([
      {
        $match: { channel: channelId },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "subscriberInfo",
        },
      },

      {
        $unwind: "$subscriberInfo",
      },

      {
        $project: {
          _id: 0,
          subscriber: {
            fullName: "$subscriberInfo.fullName",
            email: "$subscriberInfo.email",
            username: "$subscriberInfo.username",
            avatar: "$subscriberInfo.avatar",
          },
        },
      },
    ]);
    if (!subscribers.length) {
      throw new ApiError(404, "No subcriber found with this Id");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribers,
          "Successfully Fetch Subscribed Channel "
        )
      );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  let { subscriberId } = req.params;

  if (!subscriberId) {
    throw new ApiError(400, "Please provide subscriberId");
  }
  if (!mongoose.isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid subscriberId");
  }
  subscriberId = new mongoose.Types.ObjectId(subscriberId);
  try {
    const channel = await Subscription.aggregate([
      {
        $match: { subscriber: subscriberId },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "channelInfo",
        },
      },

      {
        $unwind: "$channelInfo",
      },

      {
        $project: {
          _id: 0,
          channel: {
            fullName: "$channelInfo.fullname",
            email: "$channelInfo.email",
            username: "$channelInfo.username",
            avatar: "$channelInfo.avatar",
          },
        },
      },
    ]);
    if (!channel.length) {
      throw new ApiError(404, "No subscrided channel found");
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, channel, "Successfully Fetch Subscribed Channel")
      );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
