const authRoutes = require("./auth.route");
const express = require("express");
const router = express.Router();

const initRoutes = (app) => {
  app.use("/api/auth", authRoutes);
};

module.exports = initRoutes;
