import axios from 'axios';

// Define the interface for the GeoTrackingData expected from the backend.
// This should closely match the 'SelectGeoTracking' type in your backend schema,
// but with appropriate types for the frontend (e.g., string for dates if not parsed).
export interface GeoTrackingData {
    id: number;
    userId: number;
    latitude: string; // Backend stores as string for numeric type
    longitude: string; // Backend stores as string for numeric type
    recordedAt: string; // ISO 8601 string from backend
    speed?: number | null;
    heading?: number | null;
    accuracy?: number | null;
    altitude?: number | null;
    provider?: string | null;
    batt?: number | null;
    isCharging?: boolean | null;
    network?: string | null;
    connectionType?: string | null;
    wifiStatus?: boolean | null;
    ipAddress?: string | null;
    locationType?: string | null;
    activityType?: 'still' | 'in_vehicle' | null; // Matches backend enum
    activityConfidence?: number | null;
    appState?: string | null;
    checkInTime?: string | null; // ISO 8601 string or null
    checkOutTime?: string | null; // ISO 8601 string or null
    visitPurpose?: string | null;
    siteName?: string | null;
    address?: string | null;
    checkInPhotoUrl?: string | null;
    checkOutPhotoUrl?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

// Base URL for your API. Vite's proxy (configured in vite.config.ts) will
// automatically redirect '/api' to your backend during development.
const API_BASE_URL = '/api';

/**
 * Fetches geo-tracking history from the backend.
 * @param userId Optional. If provided, filters records by this user ID.
 * @returns A promise that resolves to an array of GeoTrackingData.
 */
export const getGeoTrackingHistory = async (userId?: number): Promise<GeoTrackingData[]> => {
    try {
        let url = `${API_BASE_URL}/geo-tracking`;
        if (userId !== undefined) {
            url += `?userId=${userId}`;
        }
        const response = await axios.get<GeoTrackingData[]>(url);
        return response.data;
    } catch (error) {
        // More robust error handling for API calls
        if (axios.isAxiosError(error)) {
            console.error('API Error fetching geo-tracking history:', error.response?.data || error.message);
            throw new Error(error.response?.data?.message || 'Failed to fetch geo-tracking history from API');
        } else {
            console.error('An unexpected error occurred during API call:', error);
            throw new Error('An unexpected error occurred while fetching geo-tracking history');
        }
    }
};

// You can add other API functions here as needed (e.g., postGeoTracking, updateGeoTracking, etc.)
/*
export const postGeoTracking = async (data: Omit<GeoTrackingData, 'id' | 'createdAt' | 'updatedAt'>): Promise<GeoTrackingData> => {
    try {
        const response = await axios.post<GeoTrackingData>(`${API_BASE_URL}/geo-tracking`, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to create geo-tracking record');
        }
        throw error;
    }
};
*/