const express = require("express");
const initRoutes = require("./routes/index.route");
require("dotenv").config();
const DBConnect = require("./config/dbConnect");
const app = express();
const PORT = process.env.PORT || 8080;

//Express hiểu body JSON
app.use(express.json({ limit: "10mb" }));
//Form-urlencoded (VD: từ HTML form)
app.use(express.urlencoded({ extended: true }));

DBConnect();
initRoutes(app);

app.get("/", (req, res) => {
  res.send("Welcome to the BookStore App Server");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
