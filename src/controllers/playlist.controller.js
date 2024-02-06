import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  try {
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
    const playlist = await playlist.create({ name, description });
    new ApiResponse(200, "Plalist SuccessFully created", playlist);
  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating Playlist");
  }
  //TODO: create playlist
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "UserId is required");
  }
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Please provide valid UserId");
  }
  const userPlaylist = await Playlist.find({ _id: userId });
  if (!userPlaylist) {
    throw new ApiError(404, "No Playlist Found");
  }
  new ApiResponse(200, "Successfully Gets Playlist", userPlaylist);

  //TODO: get user playlists
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!playlistId) {
    throw new ApiError(400, "Please provide playlistId");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Please provide valid playlistId");
  }
  const playlistById = await Playlist.findOne({ _id: playlistId });
  if (!playlistById) {
    throw new ApiError(400, "No Playlist found");
  }
  new ApiResponse(200, "Successfully get PlaylistById", playlistById);
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "All filed are required");
  }
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlistId");
  }
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }
  // if(!isValidObjectId(playlistId && videoId)){
  //   throw new ApiError(400,"Invalid playlistId or videoId")
  // }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
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
