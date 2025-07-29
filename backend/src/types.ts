// backend/src/types.ts

// Define the roles enum type if not already defined globally or in your Drizzle schema
export type UserRole = 'admin' |'manager'| 'staff'; // Extend as needed

// Define the activity types for geo_tracking if they are fixed
export type ActivityType = 'still'| 'in_vehicle';