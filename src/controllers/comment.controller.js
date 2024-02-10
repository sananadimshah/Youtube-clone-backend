import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Please provide videoId");
  }
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  const { page = 1, limit = 10 } = req.query;
  // const findCommentonVideo = await Comment.find({video:videoId}).skip(limit*page).limit(limit)
  // if(!findCommentonVideo){
  //   throw new ApiError(400,"No comment Exist for a video")
  // }
  const aggregate = await Comment.aggregate([{ $match: { video: videoId } }]);
  const result = await Comment.aggregatePaginate(aggregate, req.query);
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
  const { content } = req.body;
  const addCommentoVideo = await Comment.create({
    content,
    owner: req.user._id,
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
  const { content } = req.body;
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { $set: content },
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
  const { content } = req.body;
  const deletedcomment = await Comment.findByIdAndDelete(commentId, {
    new: true,
  });
  if (!deletedcomment) {
    throw new ApiError(404, "Commet not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, deletedcomment, "Successfully delete comment"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
