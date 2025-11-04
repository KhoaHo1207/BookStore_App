const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  deleteBook,
  getBook,
} = require("../controllers/book.controller");
const { protectRoute } = require("../middleware/auth.middleware");

router.post("/", protectRoute, createBook);
router.get("/", protectRoute, getBooks);
router.get("/:id", protectRoute, getBook);
router.delete("/:id", protectRoute, deleteBook);
module.exports = router;
