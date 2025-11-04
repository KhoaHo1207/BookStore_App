const cloudinary = require("../lib/cloudinary");

const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image data is required",
      });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: "bookstore",
    });

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
      error: error.message,
    });
  }
};

module.exports = { uploadImage };
