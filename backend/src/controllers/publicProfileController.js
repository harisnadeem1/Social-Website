const profileModel = require('../models/profileModel');

exports.getPublicProfileByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const profile = await profileModel.getPublicProfileByUsername(username);

    if (!profile) {
      return res.status(404).json({ message: "Profile not found or not public/featured." });
    }

    res.json(profile);
  } catch (error) {
    console.error("Error fetching public profile by username:", error);
    res.status(500).json({ message: "Server error." });
  }
};
