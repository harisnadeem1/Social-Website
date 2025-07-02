const GiftModel = require('../models/giftModel');

exports.getGiftCatalog = async (req, res) => {
  try {
    const gifts = await GiftModel.fetchAllGifts();
    res.json(gifts);
  } catch (err) {
    console.error("Gift catalog fetch error:", err);
    res.status(500).json({ message: "Failed to fetch gifts" });
  }
};

exports.sendGift = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { conversationId, receiverId, giftId } = req.body;

    const gift = await GiftModel.getGiftById(giftId);
    if (!gift) return res.status(404).json({ message: "Gift not found" });

    const balance = await GiftModel.getUserCoinBalance(senderId);
    if (balance < gift.coin_cost)
      return res.status(400).json({ message: "Not enough coins" });

    await GiftModel.deductUserCoins(senderId, gift.coin_cost);
    await GiftModel.logGiftTransaction(senderId, gift.coin_cost, `gift: ${gift.name}`);

    const message = await GiftModel.insertGiftMessage({
      conversationId,
      senderId,
      giftId
    });

    res.status(200).json({ message });
  } catch (err) {
    console.error("Send gift error:", err);
    res.status(500).json({ message: "Failed to send gift" });
  }
};
