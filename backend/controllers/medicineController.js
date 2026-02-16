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
    const mapToken = process.env.MAPBOX_TOKEN;
    const geocodingClient = mbxGeocoding({ accessToken: mapToken });

    const { medicine, city, pincode } = req.body;

    if (!medicine || !city || !pincode) {
      return res.status(400).json({ error: "Provide medicine, city and pincode" });
    }

    // Get user coordinates from Mapbox
    const address = `${pincode}, ${city}`;
    const geoResponse = await geocodingClient.forwardGeocode({
      query: address,
      limit: 1
    }).send();

    if (!geoResponse.body.features || geoResponse.body.features.length === 0) {
      return res.status(400).json({ error: "Could not find location" });
    }

    const [lng, lat] = geoResponse.body.features[0].geometry.coordinates;

    // Load pharmacies data from JSON
    const filePath = path.join(process.cwd(), "medicineDataset.json");
    const pharmaciesData = JSON.parse(fs.readFileSync(filePath, "utf-8"));


    // Filter pharmacies that have the requested medicine
    const filtered = pharmaciesData
  .filter(p =>
    p.name &&
    p.name.toLowerCase().includes(medicine.toLowerCase())
  )
  .slice(0, 5);

    res.json({
      medicine,
      city,
      pincode,
      location: { lat, lng },
      pharmacies: filtered
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
