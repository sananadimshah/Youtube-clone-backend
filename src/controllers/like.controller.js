import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please Provide videoId");
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
  const findVideo = await Like.findOne({ video: videoId });

  if (findVideo) {
    await Like.deleteOne({ video: videoId }, { new: true });
    return res
      .status(200)
      .json({ status: true, msg: "SuccessFully Video Unlike" });
  }

  const likeVideo = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, likeVideo, "Suceessfully likes the video"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Please Provide commentId");
  }
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid commentId");
  }
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const findComment = await Like.findOne({ comment: commentId });
  if (findComment) {
    await Like.deleteOne({ comment: commentId }, { new: true });
    return res
      .status(200)
      .json({ status: true, msg: "SuccessFully Comment Unlike" });
  }
  const likeComment = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, likeComment, "Suceessfully likes the Comment"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!tweetId) {
    throw new ApiError(400, "Please Provide tweetId");
  }
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweetId");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  if (tweet.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const findTweet = await Like.findOne({ tweet: tweetId });
  if (findTweet) {
    await Like.deleteOne({ tweet: tweetId }, { new: true });
    return res
      .status(200)
      .json({ status: true, msg: "SuccessFully Tweet Unlike" });
  }
  const likeTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
  });
  return res
    .status(201)
    .json(
      new ApiResponse(200, likeTweet, "Suceessfully Like on Tweet the video")
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const likedVideos = await Like.find({ likedBy: req.user._id });
  if (!likedVideos) {
    throw new ApiError(404, "No Like Video found");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, likedVideos, "Suceessfully Get like videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
