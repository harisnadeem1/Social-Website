const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/authController");
const { loginUser } = require('../controllers/authController');
const { googleRegisterUser,googleLoginUser} = require('../controllers/googleAuth');

const { facebookRegisterUser } = require('../controllers/facebookAuth');

router.post("/facebook", facebookRegisterUser);

router.post("/register", registerUser);

router.post("/google", googleRegisterUser);

router.post("/google-login", googleLoginUser);

router.post('/login', loginUser);
module.exports = router;
