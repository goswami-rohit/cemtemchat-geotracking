// backend/src/db/schema.ts
import { pgTable, serial, text, timestamp, numeric, boolean, integer, real } from 'drizzle-orm/pg-core'; // Import 'real'
import { relations } from 'drizzle-orm';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// --- Users Table Schema ---
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  workosUserId: text('workos_user_id').unique(),
  email: text('email').unique().notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name'),
  role: text('role').notNull().default('staff'), // Now accepts 'admin', 'manager', 'staff'
  salesmanLoginId: text('salesman_login_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  geoLocations: many(geoTracking),
}));

// --- Geo Tracking Table Schema ---
export const geoTracking = pgTable('geo_tracking', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  // Latitude and Longitude remain numeric for precision, expecting string input from Drizzle's perspective
  latitude: numeric('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: numeric('longitude', { precision: 11, scale: 8 }).notNull(),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).defaultNow().notNull(),

  // Fields from live_tracking changed to 'real' for direct number mapping in TS
  speed: real('speed'),
  heading: real('heading'),
  accuracy: real('accuracy'),
  altitude: real('altitude'),
  provider: text('provider'),
  batt: real('batt'), // Battery percentage
  isCharging: boolean('is_charging'),
  network: text('network'),
  connectionType: text('connection_type'),
  wifiStatus: boolean('wifi_status'),
  ipAddress: text('ip_address'),
  locationType: text('location_type'),
  activityType: text('activity_type'), // Corresponds to ActivityType string union
  activityConfidence: real('activity_confidence'), // Confidence level of activity
  appState: text('app_state'),

  // Fields from locations
  checkInTime: timestamp('check_in_time', { withTimezone: true }),
  checkOutTime: timestamp('check_out_time', { withTimezone: true }),
  visitPurpose: text('visit_purpose'),
  siteName: text('site_name'),
  address: text('address'),
  checkInPhotoUrl: text('check_in_photo_url'),
  checkOutPhotoUrl: text('check_out_photo_url'),

  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const geoTrackingRelations = relations(geoTracking, ({ one }) => ({
  user: one(users, {
    fields: [geoTracking.userId],
    references: [users.id],
  }),
}));

// --- TypeScript Types for Drizzle ---
export type SelectUser = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export type SelectGeoTracking = InferSelectModel<typeof geoTracking>;
export type InsertGeoTracking = InferInsertModel<typeof geoTracking>;