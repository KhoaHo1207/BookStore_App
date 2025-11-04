const cloudinary = require("../lib/cloudinary");
const Book = require("../models/book.model");

const createBook = async (req, res) => {
  try {
    const { title, caption, image, rating } = req.body;
    const userId = req?.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Missing user ID",
      });
    }

    if (!title?.trim() || !caption?.trim() || !image || !rating) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, caption, image, rating) are required",
      });
    }

    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "books",
        resource_type: "image",
        transformation: [{ width: 800, crop: "limit" }],
      });
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return res.status(502).json({
        success: false,
        message: "Image upload failed",
      });
    }

    const newBook = await Book.create({
      title: title.trim(),
      caption: caption.trim(),
      image: uploadResponse.secure_url,
      rating,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: newBook,
    });
  } catch (error) {
    console.error("🔥 Server error creating book:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getBooks = async (req, res) => {
  try {
    const page = req.params.page || 1;
    const limit = req.params.limit || 10;
    const skip = (page - 1) * limit;
    const books = await Book.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username email profileImage");

    const totalBooks = await Book.countDocuments();
    const totalPages = Math.ceil(totalBooks / limit);
    return res.status(200).json({
      success: true,
      message: "Books fetched successfully",
      data: {
        books,
        currentPage: Number(page),
        limit: Number(limit),
        totalBooks: totalBooks,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.log("Server error fetching books:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await Book.findById(bookId).populate(
      "user",
      "username email profileImage"
    );
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Book fetched successfully",
      data: book,
    });
  } catch (error) {
    console.log("Server error fetching book:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const userId = req?.user?._id;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
      });
    }

    if (book.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own books",
      });
    }
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const publicId = Book.image.spilt("/").pop.split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error("Cloudinary deletion error:", error);
      }
    }
    await Book.findByIdAndDelete(bookId);
    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    console.log("Server error deleting book:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
module.exports = { createBook, getBooks, getBook, deleteBook };
