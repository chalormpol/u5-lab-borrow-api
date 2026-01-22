require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./configs/db");
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/equipments", require("./routes/equipment.routes"));

const port = process.env.PORT || 5000;
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});
connectDB(process.env.MONGO_URI)
  .then(() =>
    app.listen(port, () =>
      console.log(`Lab Borrow API on http://localhost:${port}`)
    )
  )
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
