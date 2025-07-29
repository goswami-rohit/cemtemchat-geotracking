// backend/src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import geoTrackingRoutes from './routes/geoTracking';
import cors from 'cors'; // Import cors

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // To parse JSON request bodies
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend to connect. Adjust if your frontend port changes.
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Routes
app.use('/api/geo-tracking', geoTrackingRoutes); // Use a base path for geo-tracking routes

// Simple root route
app.get('/', (req, res) => {
  res.send('Geo Tracking Backend is running!');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`Database URL: ${process.env.DATABASE_URL ? 'Set' : 'Not Set'}`);
});