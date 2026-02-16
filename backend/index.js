import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import medicineRoutes from "./routes/medicineRoutes.js";
import substituteRoutes from "./routes/substituteRoutes.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || "*"
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Smart Medicine Locator Backend Running 🚀");
});

app.use("/api", medicineRoutes);
app.use("/api/substitutes", substituteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
