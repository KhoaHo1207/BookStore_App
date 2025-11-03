const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({ email, username }) => {
  try {
    const token = jwt.sign({ email, username }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (err) {
    console.error("Error generating JWT:", err);
    return null;
  }
};

module.exports = { generateToken };
