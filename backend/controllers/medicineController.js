import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
import fs from 'fs';
import path from 'path';

// Path to your JSON data inside front-api folder
const pharmaciesFile = path.join(process.cwd(), "front-api/data/pharmacies.json");

// Utility to calculate distance between two coordinates (Haversine formula)
const getDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const handleSearch = async (req, res) => {
  try {
    const { medicine } = req.body;

    if (!medicine) {
      return res.status(400).json({ error: "Provide medicine name" });
    }

    const cleanMedicine = medicine.trim().toLowerCase();

    const filtered = pharmaciesData
      .filter(p =>
        p.name?.toLowerCase().includes(cleanMedicine) ||
        p.short_composition1?.toLowerCase().includes(cleanMedicine)
      )
      .map(p => ({
        id: p.id,
        brand_name: p.name,
        manufacturer: p.manufacturer_name,
        composition: p.short_composition1,
        pack_size: p.pack_size_label,
        price: parseFloat(p["price(₹)"]),
        discontinued: p.Is_discontinued === "TRUE"
      }));

    if (filtered.length === 0) {
      return res.json({
        query: medicine,
        total_results: 0,
        results: []
      });
    }

    // Calculate price statistics
    const prices = filtered.map(m => m.price);

    const price_stats = {
      lowest: Math.min(...prices),
      highest: Math.max(...prices),
      average: (
        prices.reduce((a, b) => a + b, 0) / prices.length
      ).toFixed(2)
    };

    res.json({
      query: medicine,
      total_results: filtered.length,
      price_stats,
      results: filtered
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
