import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!videoId) {
    throw new ApiError(400, "Please provide videoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const option = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  };
  const aggregate = await Comment.aggregate([{ $match: { video: videoId } }]);
  if (!aggregate) {
    throw new ApiError(400, "Video not found");
  }
  const result = await Comment.aggregatePaginate(aggregate, option);
  if (!result) {
    throw new ApiError(400, "No comment Exist for a video");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, result, "Successfully get all comment for a video")
    );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
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
  const { content } = req.body;
  const addCommentoVideo = await Comment.create({
    content,
    owner: req.user._id,
    video: video._id,
  });
  if (!addCommentoVideo) {
    throw new ApiError(400, "Can'nt add comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        addCommentoVideo,
        "Successfully add comment for a video"
      )
    );
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Please provide commentId");
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

  const { content } = req.body;
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: { content } },
    { new: true }
  );
  if (!updatedComment) {
    throw new ApiError(404, "Commet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Successfully update comment"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!commentId) {
    throw new ApiError(400, "Please provide commentId");
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
  const deletedcomment = await Comment.findByIdAndDelete(commentId, {
    new: true,
  });
  if (!deletedcomment) {
    throw new ApiError(404, "Comment already Deleted");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedcomment, "Successfully delete comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
