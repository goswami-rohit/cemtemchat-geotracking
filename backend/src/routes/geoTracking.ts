// backend/src/routes/geoTracking.ts
import { Router } from 'express';
import { db } from '../db';
import { geoTracking, users, InsertGeoTracking, SelectGeoTracking } from '../db/schema';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { ActivityType } from '../types'; // Import ActivityType type

const router = Router();

// --- Zod Schemas for Validation ---

// Schema for creating a new geo_tracking record (e.g., a live ping)
const createGeoTrackingSchema = z.object({
  userId: z.number().int().positive(),
  latitude: z.number().min(-90).max(90), // Accepts number from client
  longitude: z.number().min(-180).max(180), // Accepts number from client
  recordedAt: z.string().datetime().optional(), // Optional, default is NOW() in DB

  // Optional fields from live_tracking - type now matches 'real' in schema (number)
  speed: z.number().optional(),
  heading: z.number().optional(),
  accuracy: z.number().optional(),
  altitude: z.number().optional(),
  provider: z.string().optional(),
  batt: z.number().min(0).max(100).optional(),
  isCharging: z.boolean().optional(),
  network: z.string().optional(),
  connectionType: z.string().optional(),
  wifiStatus: z.boolean().optional(),
  ipAddress: z.union([z.string().ipv4(), z.string().ipv6()]).optional(),
  locationType: z.string().optional(),
  // Keeping only 'still' and 'in_vehicle' as requested
  activityType: z.enum(['still', 'in_vehicle'] as const).optional(),
  activityConfidence: z.number().min(0).max(100).optional(),
  appState: z.string().optional(),

  // Optional fields for a visit (making them nullable and optional)
  checkInTime: z.string().datetime().nullable().optional(),
  checkOutTime: z.string().datetime().nullable().optional(),
  visitPurpose: z.string().nullable().optional(),
  siteName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  checkInPhotoUrl: z.string().url().nullable().optional(),
  checkOutPhotoUrl: z.string().url().nullable().optional(),
});

// Schema for updating an existing geo_tracking record
const updateGeoTrackingSchema = createGeoTrackingSchema.partial().extend({
  id: z.number().int().positive(), // ID is required for update
});


// --- API Endpoints ---

// POST /api/geo-tracking - Add a new geo-tracking record
router.post('/', async (req, res) => {
  try {
    const parsedBody = createGeoTrackingSchema.safeParse(req.body);

    if (!parsedBody.success) {
      console.error('Validation Error:', parsedBody.error.format());
      // Use .format() for error response
      return res.status(400).json({ message: 'Invalid data provided', errors: parsedBody.error.format() });
    }

    // Ensure latitude and longitude are explicitly destructured here
    const { userId, latitude, longitude, recordedAt, checkInTime, checkOutTime, ...otherData } = parsedBody.data;

    // Verify if the user exists
    const existingUser = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Construct the InsertGeoTracking object, performing necessary type conversions
    const newLocation: InsertGeoTracking = {
        userId: userId,
        latitude: latitude.toString(), // Convert number to string for numeric DB type
        longitude: longitude.toString(), // Convert number to string for numeric DB type
        recordedAt: recordedAt ? new Date(recordedAt) : undefined, // Handled by Drizzle's defaultNow() if undefined
        // Ensure checkInTime and checkOutTime are correctly converted or set to null/undefined
        checkInTime: checkInTime !== undefined ? (checkInTime ? new Date(checkInTime) : null) : undefined,
        checkOutTime: checkOutTime !== undefined ? (checkOutTime ? new Date(checkOutTime) : null) : undefined,
        ...otherData, // Spread the rest of the validated data (real, text, boolean types match directly)
    };

    const inserted = await db.insert(geoTracking).values(newLocation).returning();
    res.status(201).json(inserted[0]);

  } catch (error) {
    console.error('Error adding geo-tracking record:', error);
    res.status(500).json({ message: 'Failed to add geo-tracking record', error: (error as Error).message });
  }
});

// GET /api/geo-tracking - Get all geo-tracking records (or filtered by user)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;

    let query = db.select().from(geoTracking).$dynamic();
    
    if (userId) {
      const parsedUserId = z.string().regex(/^\d+$/).transform(Number).safeParse(userId);
      if (!parsedUserId.success) {
        return res.status(400).json({ message: 'Invalid userId provided' });
      }
      query = query.where(eq(geoTracking.userId, parsedUserId.data));
    }

    const locations = await query
      .orderBy(desc(geoTracking.recordedAt))
      .limit(100)
      .execute();

    res.status(200).json(locations);

  } catch (error) {
    console.error('Error fetching geo-tracking records:', error);
    res.status(500).json({ message: 'Failed to fetch geo-tracking records', error: (error as Error).message });
  }
});


// PATCH /api/geo-tracking/:id - Update an existing geo-tracking record
router.patch('/:id', async (req, res) => {
  try {
    const parsedId = z.number().int().positive().safeParse(Number(req.params.id));
    if (!parsedId.success) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    const id = parsedId.data;

    const parsedBody = updateGeoTrackingSchema.safeParse({ id, ...req.body });
    if (!parsedBody.success) {
      console.error('Validation Error:', parsedBody.error.format());
      // Use .format() for error response
      return res.status(400).json({ message: 'Invalid data provided for update', errors: parsedBody.error.format() });
    }

    const { id: _, ...dataToUpdate } = parsedBody.data;

    // Build the update payload with explicit type conversions for Drizzle
    const updatePayload: Partial<InsertGeoTracking> = {};

    // Iterate over the keys provided in dataToUpdate and apply transformations
    for (const key of Object.keys(dataToUpdate) as Array<keyof typeof dataToUpdate>) {
        const value = dataToUpdate[key];

        if (value === undefined) {
            continue; // Skip undefined values
        }

        switch (key) {
            case 'latitude':
            case 'longitude':
                if (typeof value === 'number') {
                    updatePayload[key] = value.toString(); // Convert number to string
                }
                // If client sends null, it will be ignored for NOT NULL columns.
                break;
            case 'recordedAt':
                // `recordedAt` is NOT NULL in schema. Only update if a valid string is provided.
                if (typeof value === 'string') {
                    updatePayload.recordedAt = new Date(value);
                }
                break;
            case 'checkInTime':
            case 'checkOutTime':
                // These are nullable timestamps
                if (typeof value === 'string') {
                    updatePayload[key] = new Date(value);
                } else if (value === null) {
                    updatePayload[key] = null;
                }
                break;
            default:
                // For all other fields (speed, heading, etc.), assign directly.
                (updatePayload as any)[key] = value; // Type assertion still needed for direct generic assignment
                break;
        }
    }
    
    // Always update the updatedAt timestamp
    updatePayload.updatedAt = new Date();

    const updated = await db.update(geoTracking)
      .set(updatePayload)
      .where(eq(geoTracking.id, id))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ message: 'Geo-tracking record not found' });
    }

    res.status(200).json(updated[0]);

  } catch (error) {
    console.error('Error updating geo-tracking record:', error);
    res.status(500).json({ message: 'Failed to update geo-tracking record', error: (error as Error).message });
  }
});

export default router;