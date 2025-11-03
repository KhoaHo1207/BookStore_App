const express = require("express");
const router = express.Router();

const { createBook } = require("../controllers/book.controller");
const { protectRoute } = require("../middleware/auth.middleware");

router.post("/", protectRoute, createBook);
module.exports = router;
