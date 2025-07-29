// frontend/src/pages/GeoTrackingHistorySidebar.tsx
import React, { useState, useEffect } from 'react';
// FIX: Import from your frontend API service, not the backend route file
import { getGeoTrackingHistory, type GeoTrackingData } from '../api/index';
import { SafeRelativeTime } from './ChatPage'; // Re-using SafeRelativeTime from ChatPage

const GeoTrackingHistorySidebar: React.FC = () => {
    const [history, setHistory] = useState<GeoTrackingData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch all history, no longer filtering by userId
                // Assuming your getGeoTrackingHistory can be called without a userId argument
                const data = await getGeoTrackingHistory();
                setHistory(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch geo-tracking history');
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="w-full h-full flex flex-col bg-gray-800 text-gray-100"> {/* Updated for dark theme */}
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700 flex-shrink-0"> {/* Updated border color */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin"><path d="M12 12.001v.01" /><path d="M12 21.001v-9" /><path d="M12 21.001c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" /></svg>
                        </div>
                        <span className="font-semibold text-lg">Geo Tracking History</span>
                    </div>
                    {/* Settings icon - HIDDEN ON MOBILE (md:block) */}
                    <button className="p-2 rounded-md hover:bg-gray-700 text-gray-200 hidden md:block">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.22a2 2 0 0 0 .73 2.73l.09.09a2 2 0 0 1 0 2.83l-.08.08a2 2 0 0 0-.73 2.73l.78 1.22a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.22a2 2 0 0 0-.73-2.73l-.09-.09a2 2 0 0 1 0-2.83l.08-.08a2 2 0 0 0 .73-2.73l-.78-1.22a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto p-4">
                {loading && <p className="text-blue-500 text-center py-4">Loading geo-tracking history...</p>}
                {error && <p className="text-red-500 text-center py-4">Error: {error}</p>}

                {!loading && !error && (
                    <div className="space-y-3">
                        {history.length > 0 ? (
                            history.map((record) => (
                                <div key={record.id} className="bg-gray-700 rounded-lg shadow-sm p-3 border border-gray-600">
                                    <div className="flex items-center gap-2 mb-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin text-gray-400 flex-shrink-0"><path d="M12 12.001v.01" /><path d="M12 21.001v-9" /><path d="M12 21.001c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" /></svg>
                                        <h4 className="text-sm font-medium truncate text-gray-100">User ID: {record.userId}</h4>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-1">
                                        Lat: {record.latitude}, Lon: {record.longitude}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <SafeRelativeTime timestamp={new Date(record.recordedAt)} />
                                        <span className="bg-gray-600 text-gray-200 px-2 py-0.5 rounded-full">
                                            {record.activityType || 'N/A'}
                                        </span>
                                    </div>
                                    {record.siteName && (
                                        <p className="text-xs text-gray-300 mt-1">Site: {record.siteName}</p>
                                    )}
                                    {record.checkInTime && (
                                        <p className="text-xs text-gray-300">Check-in: {new Date(record.checkInTime).toLocaleTimeString()}</p>
                                    )}
                                    {record.checkOutTime && (
                                        <p className="text-xs text-gray-300">Check-out: {new Date(record.checkOutTime).toLocaleTimeString()}</p>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 text-center py-4">No geo-tracking records found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default GeoTrackingHistorySidebar;