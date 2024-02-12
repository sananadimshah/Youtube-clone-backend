import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (channelId) {
    throw new ApiError(400, "Please provide channelId");
  }
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }
  const findSubscription = await Subscription.findOne({ channel: channelId });
  if (findSubscription) {
    await Subscription.deleteOne({ channelId }, { new: true });
    return res.status(200).json(200, "Successfully Unsubscrided");
  }
  if (!findSubscription) {
    await Subscription.create({ channel: channelId, subscriber: req.user._id });
    return res
      .status(201)
      .json(new ApiResponse(200, "Successfully Unsubscrided"));
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
