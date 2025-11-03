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

module.exports = { createBook };
