const express = require("express");
const router = express.Router();

const { uploadImage } = require("../controllers/upload.controller");

router.post("/", uploadImage);

module.exports = router;
