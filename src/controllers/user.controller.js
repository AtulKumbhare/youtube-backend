import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler((req, res, next) => {
  res.status(200).json({
    message: 'Registered Successfully'
  })
})