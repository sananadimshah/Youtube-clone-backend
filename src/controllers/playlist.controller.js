import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name || !description) {
    throw new ApiError(400, "All fields are required");
  }

  const existname = await Playlist.findOne({ name });
  if (existname) {
    throw new ApiError(
      400,
      "This name is already exist, Please take another name"
    );
  }
  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, "Playlist SuccessFully created", playlist));

  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide valid UserId");
  }

  const userPlaylist = await Playlist.find({ owner: userId });

  if (!userPlaylist) {
    throw new ApiError(404, "No Playlist Found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully Gets Playlist", userPlaylist));
  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "Please provide playlistId");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please provide valid playlistId");
  }
  const playlistById = await Playlist.findOne({ _id: playlistId });
  if (!playlistById) {
    throw new ApiError(400, "No Playlist found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, "Successfully get PlaylistById", playlistById));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All filed are required");
  }

  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (
    playlist.owner.toString() !== req.user._id.toString() ||
    video.owner.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const addVideoByIdToPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: {
        video: videoId,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Successfully addVideoToPlaylist",
        addVideoByIdToPlaylist
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  // TODO: remove video from playlist
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All filed are required");
  }
  if (
    !mongoose.isValidObjectId(playlistId) ||
    !mongoose.isValidObjectId(videoId)
  ) {
    throw new ApiError(400, "Invalid playlistId or videoId");
  }
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }

  const removeVideoByIdFromPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: {
        video: videoId,
      },
    },
    { new: true }
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Succesfully remove Video from Playlist",
        removeVideoByIdFromPlaylist
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "All filed are required");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const deletePlaylistById = await Playlist.findByIdAndDelete(playlistId, {
    new: true,
  });
  if (!deletePlaylistById) {
    throw new ApiError(404, "This playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "SuccessFully DeletePlaylist", deletePlaylistById)
    );
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  //TODO: update playlist
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "All filed are required");
  }
  if (!mongoose.isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (playlist.owner !== req.user._id) {
    throw new ApiError(403, "You are not authorized to perform this action");
  }
  const { name, description } = req.body;
  const updatePlaylistById = await Playlist.findByIdAndUpdate(
    playlistId,
    { $set: { name, description } },
    { new: true }
  );
  if (!updatePlaylistById) {
    throw new ApiError(404, "Playlist not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Successfully updatePlaylist", updatePlaylistById)
    );
  //TODO: update playlist
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
