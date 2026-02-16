import express from "express";
import { handleSearch } from "../controllers/medicineController.js";
import axios from "axios";  // For Mapbox API call

const router = express.Router();

// Search route - returns user coordinates
router.post("/search", handleSearch);

// Geocode route - optional if frontend wants separate geocode
router.post("/geocode", async (req, res) => {
  const { city, pincode } = req.body;

  if (!city || !pincode) {
    return res.status(400).json({ error: "City and Pincode are required" });
  }

  try {
    const query = encodeURIComponent(`${city}, ${pincode}`);
    const mapboxToken = process.env.MAPBOX_TOKEN;

    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}`
    );

    const data = response.data;
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      res.json({ latitude, longitude });
    } else {
      res.status(404).json({ error: "Location not found" });
    }
  } catch (error) {
    console.error("Geocode API Error:", error);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;
