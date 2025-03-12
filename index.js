require("dotenv").config();
const express = require("express");
const { body, validationResult, query } = require("express-validator");
const sqlConnection = require("./db");
const app = express();
const port = process.env.PORT;

app.use(express.json());

app.post(
  "/addSchool",
  [
    body("name")
      .notEmpty()
      .withMessage("Name is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("address")
      .notEmpty()
      .withMessage("Address is required")
      .isLength({ min: 3 })
      .withMessage("Address must be at least 3 characters long"),
    body("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a valid number between -90 and 90"),
    body("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a valid number between -180 and 180"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, address, latitude, longitude } = req.body;

    const connection = await sqlConnection();
    const [result] = await connection.query(
      "INSERT INTO school (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, latitude, longitude]
    );
    res.status(201).json({
      message: "School added successfully",
      schoolId: result.insertId,
    });

    try {
    } catch (e) {
      res.status(500).json({ error: "Database error", details: e.message });
    }
  }
);

app.get(
  "/listSchools",
  [
    query("latitude")
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be a valid number between -90 and 90"),
    query("longitude")
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be a valid number between -180 and 180"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude } = req.query;

    try {
      const connection = await sqlConnection();
      const [result] = await connection.query(
        `SELECT id, name, address, latitude, longitude,
          (6371 * ACOS(
               COS(RADIANS(?)) * COS(RADIANS(latitude)) *
               COS(RADIANS(longitude) - RADIANS(?)) +
               SIN(RADIANS(?)) * SIN(RADIANS(latitude))
          )) AS distance
   FROM school
   ORDER BY distance ASC`,
        [latitude, longitude, latitude]
      );

      res.status(201).json({
        message: "Schools find successfully",
        data: result,
      });
    } catch (e) {
      res.status(500).json({ error: "Database error", details: e.message });
    }
  }
);

app.get("/", (req, res) => {
  res.status(200).send("Express is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
