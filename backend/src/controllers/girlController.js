const profileModel = require("../models/profileModel");

exports.getGirlProfileById = async (req, res) => {
  const { id } = req.params;

  try {
    const profile = await profileModel.findPublicGirlById(id);
    if (!profile) {
      return res.status(404).json({ message: "Girl profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error("Error fetching girl profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
