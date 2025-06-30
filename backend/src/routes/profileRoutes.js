const express = require("express");
const router = express.Router();
const {getProfileId,fetchUserIdByProfileId, createProfile,getProfile, updateProfile,updateProfilePhoto , getGalleryImages, deleteGalleryImage, uploadGalleryImage , getProfileById} = require("../controllers/profileController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/create", verifyToken, createProfile);
router.get("/me", verifyToken, getProfile);
router.put("/update", verifyToken, updateProfile);
router.put("/photo", verifyToken, updateProfilePhoto);
router.get("/gallery", verifyToken, getGalleryImages);
router.post("/gallery", verifyToken, uploadGalleryImage);
router.delete("/gallery/:id", verifyToken, deleteGalleryImage);

router.get("/girls/:id", verifyToken, getProfileById);

router.get('/user/:userId', getProfileId);

router.get('/user-id/:profileId', fetchUserIdByProfileId);

module.exports = router;
