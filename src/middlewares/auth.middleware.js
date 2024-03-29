import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Invalid access token");
  }
});

// export const Authorization = asyncHandler(async (req, _, next) => {
//   try {
//     const user = req.params.userId;
//     const ValidUser = await User.findById(user);
//     if (!ValidUser) {
//       throw new ApiError(400, "Invalid User ID");
//     }
//     if (ValidUser._id.toString() !== req.user._id.toString()) {
//       throw new ApiError(
//         400,
//         "Invalid User permission denied,You are not authorized to perform this action"
//       );
//     }

//     next();
//   } catch (err) {
//     throw new ApiError(403, "Invalid User");
//   }
// });
