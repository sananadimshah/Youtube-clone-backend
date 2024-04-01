import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  //TODO: create tweet
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "All filed is required");
  }
  const TweetCreated = await Tweet.create({ content, owner: req.user._id });
  res
    .status(201)
    .json(new ApiResponse(200, "Tweet Succesfully created", TweetCreated));
});

const getUserTweets = asyncHandler(async (req, res) => {
  // TODO: get user tweets
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "All filed is required");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }
  const getTweet = await Tweet.findById(userId);
  if (getTweet.length === 0) {
    throw new ApiError(400, "This User don't have any Tweet");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, getTweet, "Tweet Succesfully Get"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet

  const { tweetId } = req.params;
  console.log(tweetId);
  if (!tweetId) {
    throw new ApiError(400, "All fields is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }
  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const { content } = req.body;
  const updateUserTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    { $set: { content } },
    { new: true }
  );
  if (!updateUserTweet) {
    throw new ApiError(404, "Tweet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Succesfully update", updateUserTweet));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  console.log(tweetId);
  if (!tweetId) {
    throw new ApiError(400, "All filed is required");
  }
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const deleteUserTweet = await Tweet.findByIdAndDelete(tweetId, { new: true });

  if (!deleteUserTweet) {
    throw new ApiError(400, "This tweet is already Deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Tweet Succesfully delete", deleteUserTweet));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
