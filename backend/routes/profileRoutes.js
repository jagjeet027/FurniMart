import express from "express";
import {
  getProfile,
  getUserProfile,
  updateProfile,
  updateAvatar,
  getUserPosts,
  toggleFollow,
  getFollowers,
  getFollowing,
} from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes
router.get("/me", protect, getProfile);
router.put("/me", protect, updateProfile);
router.put("/me/avatar", protect, updateAvatar);
router.get("/me/posts", protect, getUserPosts);

// Public routes
router.get("/:id", getUserProfile);
router.get("/:userId/followers", getFollowers);
router.get("/:userId/following", getFollowing);

// Follow/Unfollow
router.post("/:userId/follow", protect, toggleFollow);

export default router;