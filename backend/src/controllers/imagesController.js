const Images = require('../models/imageModel');

exports.uploadImageAndCreateMessage = async (req, res) => {
  try {
    const { profile_id, conversation_id, image_url } = req.body;
    const sender_id = req.user.id; // Assuming you use authMiddleware to get the user



    // Step 1: Save image
    const image = await Images.saveImage(profile_id, image_url);

    // Step 2: Save message referencing the image
    const message = await Images.createImageMessage({
      conversation_id,
      sender_id,
      image_id: image.id,
    });
    res.status(201).json({
      success: true,
      message: {
        id: message.id,
        sender_id,
        message_type: 'image',
        image_id: image.id,
        image_url: image.image_url || image_url,
        sent_at: message.sent_at,
        status: message.status,
        content: ''
      },
    });

    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Image upload and message save failed' });
  }
};
