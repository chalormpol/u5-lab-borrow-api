const mongoose = require("mongoose");
async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI missing");
  await mongoose
    .connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
}
module.exports = { connectDB };
