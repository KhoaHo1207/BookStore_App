const express = require("express");
const router = express.Router();

const authRoutes = require("./auth.route");
const bookRoutes = require("./book.route");
const uploadRoutes = require("./upload.route");
const initRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/book", bookRoutes);
  app.use("/api/upload", uploadRoutes);
};

module.exports = initRoutes;
