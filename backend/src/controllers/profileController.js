const profileModel = require("../models/profileModel");
const pool = require('../config/db');
const createProfile = async (req, res) => {
  try {
    const {
      name,
      user_id,
      age,
      gender,
      city,
      height,
      bio,
      interests,
      profile_image_url,
    } = req.body;

    if (!name|| !user_id || !age || !gender || !city || !bio) {
      return res.status(400).json({ error: "Required fields missing" });
    }

    const newProfile = await profileModel.createProfile({
      name,
      user_id,
      age,
      gender,
      city,
      height,
      bio,
      interests,
      profile_image_url,
    });

    return res.status(201).json({ message: "Profile created", profile: newProfile });
  } catch (err) {
    console.error("Profile creation error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};


const getProfile = async (req, res) => {
  try {
    
    const profile = await profileModel.findByUserId(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateProfile = async (req, res) => {
 
  try {
    const updated = await profileModel.updateProfile(req.user.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error("Profile update failed:", error);
    res.status(500).json({ error: "Profile update failed" });
  }
};



const updateProfilePhoto = async (req, res) => {
  const { imageUrl, type } = req.body;

  if (!imageUrl || !type) {
    return res.status(400).json({ error: "Missing imageUrl or type" });
  }

  try {
    if (type === "profile") {
      await pool.query(
        "UPDATE profiles SET profile_image_url = $1 WHERE user_id = $2",
        [imageUrl, req.user.id]
      );
    } else if (type === "gallery") {
      await pool.query(
        "INSERT INTO profile_gallery (user_id, image_url) VALUES ($1, $2)",
        [req.user.id, imageUrl]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update photo:", err);
    res.status(500).json({ error: "Failed to update photo" });
  }
};



// Get gallery images
const getGalleryImages = async (req, res) => {
  try {
    // Find the profile ID linked to the current user
    const profileResult = await pool.query(
      "SELECT id FROM profiles WHERE user_id = $1",
      [req.user.id]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const profileId = profileResult.rows[0].id;

    // Then fetch gallery images by profile_id
    const imagesResult = await pool.query(
      "SELECT * FROM images WHERE profile_id = $1",
      [profileId]
    );

    res.json(imagesResult.rows);
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Upload new image
const uploadGalleryImage = async (req, res) => {
  const { imageUrl } = req.body;
  try {
    const profile = await pool.query("SELECT id FROM profiles WHERE user_id = $1", [req.user.id]);
    const profileId = profile.rows[0]?.id;

    if (!profileId) return res.status(404).json({ error: "Profile not found" });

    await pool.query(
      "INSERT INTO images (profile_id, image_url) VALUES ($1, $2)",
      [profileId, imageUrl]
    );
    res.status(201).json({ message: "Image uploaded" });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete image
const deleteGalleryImage = async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM images WHERE id = $1 AND profile_id = (SELECT id FROM profiles WHERE user_id = $2)",
      [req.params.id, req.user.id]
    );
    res.json({ message: "Image deleted" });
  } catch (error) {
    console.error("Delete failed:", error);
    res.status(500).json({ error: "Server error" });
  }
};
// profileController.js
const getProfileById = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const profile = await profileModel.findById(id);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

const fetchUserIdByProfileId = async (req, res) => {
  const { profileId } = req.params;

  try {
    const user = await profileModel.getUserIdByProfileId(profileId);

    if (!user) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ user_id: user.user_id });
  } catch (err) {
    console.error('Error in fetchUserIdByProfileId:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


const getProfileId = async (req, res) => {
  const userId = req.params.userId;

  try {
    const profile = await profileModel.getProfileIdByUserId(userId);

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found for user' });
    }

    res.status(200).json({ profileId: profile.id, profileLocation:profile.city });
  } catch (err) {
    console.error('Error fetching profile ID:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfileId,createProfile ,getProfile, updateProfile,updateProfilePhoto , getGalleryImages, deleteGalleryImage, uploadGalleryImage, getProfileById ,fetchUserIdByProfileId};
