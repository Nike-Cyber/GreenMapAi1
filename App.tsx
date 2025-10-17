import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, Navigate, useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import type { Chat } from '@google/genai';
import { Report, ReportType } from './types';
import { initializeChatSession, generateReportAnalysis, analyzeFeedback, AIAnalysisResult, FeedbackAnalysisResult } from './ai';


// --- ICONS (as React Components) ---

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const TreeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 4a1 1 0 012 0v5.012a2.5 2.5 0 011.237 1.237l.001.002a2.5 2.5 0 11-4.476 0L9 9.012V4z" />
    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000 16zM4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
  </svg>
);

const PollutionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1.75-5.25a.75.75 0 00-1.5 0v2.5a.75.75 0 001.5 0v-2.5z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
);
const ReportIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const InfoIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const NewsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3h2m-4 3H9m-4 0H5m14 0v2m-3-2v4m-3-4v4" /></svg>
);
const AnalysisIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" /></svg>
);
const ChatbotIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
        <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
    </svg>
);
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
);
const FeedbackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
    </svg>
);

const MicrophoneIcon: React.FC<{ isListening: boolean; disabled?: boolean }> = ({ isListening, disabled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${isListening ? 'text-red-500 animate-pulse' : disabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0m7 10v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);

const SpeakerIcon: React.FC<{ isSpeaking: boolean }> = ({ isSpeaking }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-colors ${isSpeaking ? 'text-emerald-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M6 8a1 1 0 011-1h1v4H7a1 1 0 01-1-1V8z" />
      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zM3 8a1 1 0 011-1h1v4H4a1 1 0 01-1-1V8zm13 0a1 1 0 011-1h1v4h-1a1 1 0 01-1-1V8z" clipRule="evenodd" />
    </svg>
);

const CommunityIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// --- MOCK DATA & HELPERS ---

interface NewsArticle {
    id: number | string;
    title: string;
    excerpt: string;
    date: string;
    imageUrl: string;
}

const initialReports: Report[] = [
    { id: '1', type: ReportType.TreePlantation, latitude: 51.505, longitude: -0.09, locationName: "Central Park London", description: "Planted 50 oak trees.", reportedBy: "Eco Warriors", timestamp: "2024-05-20T10:00:00Z" },
    { id: '2', type: ReportType.PollutionHotspot, latitude: 51.51, longitude: -0.1, locationName: "River Thames Bank", description: "Large amount of plastic waste.", reportedBy: "GreenPeace", timestamp: "2024-05-18T14:30:00Z" },
    { id: '3', type: ReportType.TreePlantation, latitude: 51.52, longitude: -0.12, locationName: "Regent's Park", description: "Community planting event.", reportedBy: "Alex Green", timestamp: "2024-05-21T11:00:00Z" },
    { id: '4', type: ReportType.TreePlantation, latitude: 51.49, longitude: -0.11, locationName: "Hyde Park Corner", description: "Planted cherry blossom trees.", reportedBy: "Alex Green", timestamp: "2024-04-15T09:00:00Z" },
    { id: '5', type: ReportType.PollutionHotspot, latitude: 51.515, longitude: -0.08, locationName: "City Alleyway", description: "Overflowing bins and litter.", reportedBy: "GreenPeace", timestamp: "2024-04-25T18:00:00Z" },
    { id: '6', type: ReportType.TreePlantation, latitude: 51.50, longitude: -0.13, locationName: "Soho Square Gardens", description: "Added new flower beds and 5 trees.", reportedBy: "Eco Warriors", timestamp: "2024-03-10T12:00:00Z" },
];

const mockNewsData: NewsArticle[] = [
    { id: 1, title: "Global Reforestation Efforts Reach New Heights", excerpt: "A new report shows a 15% increase in worldwide tree planting initiatives over the past year.", date: "2024-05-20", imageUrl: "https://picsum.photos/seed/news1/400/200" },
    { id: 2, title: "Innovative Technology Turns Plastic Waste Into Fuel", excerpt: "Startups are developing new methods to tackle the plastic pollution crisis in our oceans.", date: "2024-05-18", imageUrl: "https://picsum.photos/seed/news2/400/200" },
    { id: 3, title: "Community Gardens Transform Urban Landscapes", excerpt: "Cities are embracing green spaces, with community-led projects improving air quality and biodiversity.", date: "2024-05-15", imageUrl: "https://picsum.photos/seed/news3/400/200" },
];

const createLeafletIcon = (color: string, content: string) => {
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 2rem;
        height: 2rem;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid #fff;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      ">
        <div style="transform: rotate(45deg); color: white;">
          ${content}
        </div>
      </div>
    `;
    return new L.DivIcon({
        html: iconHtml,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
};

const treeMarkerIcon = createLeafletIcon('#4CAF50', '🌳');
const pollutionMarkerIcon = createLeafletIcon('#F44336', '⚠️');
const searchMarkerIcon = createLeafletIcon('#2196F3', '📍');


// --- APP LAYOUT COMPONENTS ---

const Sidebar: React.FC<{ onLogout: () => void; toggleTheme: () => void; currentTheme: string; }> = ({ onLogout, toggleTheme, currentTheme }) => {
    const navItemClasses = "flex items-center px-4 py-3 text-lg font-medium rounded-md transition-all duration-300 w-full";
    const activeClasses = "bg-emerald-500 text-white shadow-lg";
    const inactiveClasses = "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white";

    return (
        <aside className="w-64 bg-white dark:bg-gray-800/80 backdrop-blur-sm text-gray-800 dark:text-white flex flex-col z-30 shadow-2xl">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <Link to="/dashboard" className="text-3xl font-bold text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                    <span className="text-4xl mr-2">🌍</span>GreenMap
                </Link>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                <NavLink to="/dashboard" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><DashboardIcon />Dashboard</NavLink>
                <NavLink to="/reports" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><ReportIcon />Reports</NavLink>
                <NavLink to="/analysis" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><AnalysisIcon />Analysis</NavLink>
                <NavLink to="/community" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><CommunityIcon />Community</NavLink>
                <NavLink to="/news" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><NewsIcon />News</NavLink>
                <NavLink to="/profile" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><UserIcon />Profile</NavLink>
                <NavLink to="/about" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><InfoIcon />About</NavLink>
                <NavLink to="/feedback" className={({ isActive }) => `${navItemClasses} ${isActive ? activeClasses : inactiveClasses}`}><FeedbackIcon />Feedback</NavLink>
            </nav>
            <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                <button onClick={toggleTheme} className="w-full flex items-center justify-center px-4 py-2 mb-4 text-md font-medium rounded-md transition-all duration-300 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 ring-1 ring-gray-300 dark:ring-gray-600">
                    {currentTheme === 'light' ? 
                        <MoonIcon /> : 
                        <SunIcon />
                    }
                    <span className="ml-3">Switch to {currentTheme === 'light' ? 'Dark' : 'Light'} Mode</span>
                </button>
                <div className="flex justify-center space-x-4 mb-4">
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">LinkedIn</a>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Twitter</a>
                    <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">Instagram</a>
                </div>
                <button onClick={onLogout} className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">
                    Logout
                </button>
            </div>
        </aside>
    );
};

// --- REPORT FORM COMPONENT ---

interface ReportFormProps {
    position?: { lat: number; lng: number };
    reportToEdit?: Report;
    onClose: () => void;
    onSubmit?: (report: Omit<Report, 'id' | 'reportedBy' | 'timestamp'>) => void;
    onUpdate?: (report: Report) => void;
    initialLocationName?: string;
}

const ReportForm: React.FC<ReportFormProps> = ({ position, reportToEdit, onClose, onSubmit, onUpdate, initialLocationName }) => {
    const isEditMode = !!reportToEdit;
    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<ReportType>(ReportType.TreePlantation);

    useEffect(() => {
        if (isEditMode && reportToEdit) {
            setLocationName(reportToEdit.locationName);
            setDescription(reportToEdit.description);
            setType(reportToEdit.type);
        } else {
            // For new reports
            setLocationName(initialLocationName || '');
            // Reset other fields when a new location is clicked
            setDescription('');
            setType(ReportType.TreePlantation);
        }
    }, [reportToEdit, isEditMode, initialLocationName]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditMode && onUpdate && reportToEdit) {
            onUpdate({
                ...reportToEdit,
                locationName,
                description,
                type,
            });
        } else if (onSubmit && position) {
            onSubmit({
                type,
                latitude: position.lat,
                longitude: position.lng,
                locationName,
                description,
            });
        }
    };

    const currentLat = isEditMode ? reportToEdit.latitude : position?.lat ?? 0;
    const currentLng = isEditMode ? reportToEdit.longitude : position?.lng ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-gray-500/50 dark:bg-black/50 flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg shadow-2xl p-8 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">{isEditMode ? 'Edit Report' : 'Report an Event'}</h2>
                <form onSubmit={handleSubmit}>
                     <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Location Name</label>
                        <input type="text" value={locationName} onChange={e => setLocationName(e.target.value)} required className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Report Type</label>
                        <select value={type} onChange={e => setType(e.target.value as ReportType)} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                            <option value={ReportType.TreePlantation}>🌱 Tree Plantation</option>
                            <option value={ReportType.PollutionHotspot}>⚠️ Pollution Hotspot</option>
                        </select>
                    </div>
                     <div className="mb-6">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Coordinates</label>
                         <p className="text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded">{currentLat.toFixed(5)}, {currentLng.toFixed(5)}</p>
                         {isEditMode && <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">Drag the marker on the map to change location.</p>}
                         {!isEditMode && <p className="text-xs text-gray-600 dark:text-gray-500 mt-1">Location name is auto-fetched. You can edit it if needed.</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">{isEditMode ? 'Update Report' : 'Submit Report'}</button>
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

// --- MAP COMPONENT ---

interface MapComponentProps {
    reports: Report[];
    onMapClick: (latlng: L.LatLng) => void;
    onViewDetails: (report: Report) => void;
    onEditReport: (report: Report) => void;
    editingReportId: string | null;
    onMarkerDragEnd: (reportId: string, newLatLng: L.LatLng) => void;
    searchResult: { lat: number; lng: number } | null;
    theme: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ reports, onMapClick, onViewDetails, onEditReport, editingReportId, onMarkerDragEnd, searchResult, theme }) => {
    const MapClickHandler = () => {
        useMapEvents({
            click: (e) => onMapClick(e.latlng),
        });
        return null;
    };

    const FlyToMarker: React.FC<{position: {lat: number, lng: number} | null}> = ({ position }) => {
        const map = useMap();
        useEffect(() => {
            if (position) {
                map.flyTo([position.lat, position.lng], 15, {
                    animate: true,
                    duration: 1.5
                });
            }
        }, [position, map]);
        
        return position ? (
             <Marker position={[position.lat, position.lng]} icon={searchMarkerIcon}>
                <Tooltip permanent>Search Result</Tooltip>
            </Marker>
        ) : null;
    };


    return (
        <MapContainer center={[51.505, -0.09]} zoom={13} scrollWheelZoom={true} className="h-full w-full z-0 bg-gray-300 dark:bg-gray-800">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark' 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                }
            />
            <MapClickHandler />
            {reports.map(report => (
                <Marker
                    key={report.id}
                    position={[report.latitude, report.longitude]}
                    icon={report.type === ReportType.TreePlantation ? treeMarkerIcon : pollutionMarkerIcon}
                    draggable={report.id === editingReportId}
                    eventHandlers={{
                        dragend: (e) => {
                            onMarkerDragEnd(report.id, e.target.getLatLng());
                        },
                    }}
                >
                    {report.id === editingReportId && (
                        <Tooltip permanent direction="top" offset={[0, -32]}>
                           Editing... Drag me!
                        </Tooltip>
                    )}
                    <Popup>
                        <div className="text-gray-800 dark:text-gray-200 w-48">
                            <h3 className="font-bold text-base mb-1">{report.locationName}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">By {report.reportedBy}</p>
                            <div className="flex space-x-2 mt-2">
                                <button onClick={() => onViewDetails(report)} className="flex-1 text-xs bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">Details</button>
                                <button onClick={() => onEditReport(report)} className="flex-1 text-xs bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-2 rounded-md transition-colors">Edit</button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
            <FlyToMarker position={searchResult} />
        </MapContainer>
    );
};


// --- CHATBOT COMPONENT ---

interface ChatMessage {
    id: number | string;
    text: string;
    sender: 'user' | 'bot';
}

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 1, text: "Hello! I'm EcoBot. How can I help you with GreenMap today? 🌳", sender: 'bot' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [speakingId, setSpeakingId] = useState<number | string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const chatSession = useRef<Chat | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
        return () => {
            speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return; // Only init when opened

        const initChat = () => {
            try {
                chatSession.current = initializeChatSession();
                if (!chatSession.current) {
                    throw new Error("Failed to initialize AI Chat session.");
                }
            } catch (error) {
                console.error("Chatbot initialization error:", error);
                setMessages(prev => [...prev, {
                    id: 'error',
                    text: "Sorry, I couldn't connect to the AI service. Please check your API key configuration.",
                    sender: 'bot'
                }]);
            }
        };

        if (!chatSession.current) {
            initChat();
        }
    }, [isOpen]);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Speech recognition not supported in this browser.");
            setMicPermission('unsupported');
            return;
        }

        if (navigator.permissions) {
            navigator.permissions.query({ name: 'microphone' as any }).then(permissionStatus => {
                setMicPermission(permissionStatus.state);
                permissionStatus.onchange = () => {
                    setMicPermission(permissionStatus.state);
                };
            });
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setInputValue(transcript);
        };

        recognitionRef.current = recognition;

        return () => {
            recognitionRef.current?.abort();
        };
    }, []);

    const handleListenClick = () => {
        if (!recognitionRef.current || micPermission === 'denied' || micPermission === 'unsupported') return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };


    const handleSpeak = (message: ChatMessage) => {
        if (!('speechSynthesis' in window)) {
            alert("Sorry, your browser doesn't support text-to-speech.");
            return;
        }

        if (speakingId === message.id) {
            speechSynthesis.cancel();
            setSpeakingId(null);
            return;
        }
        
        const utterance = new SpeechSynthesisUtterance(message.text);
        utterance.onstart = () => setSpeakingId(message.id);
        utterance.onend = () => setSpeakingId(null);
        utterance.onerror = () => setSpeakingId(null);
        
        speechSynthesis.cancel();
        speechSynthesis.speak(utterance);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '' || isBotTyping) return;

        const currentInput = inputValue;
        const userMessage: ChatMessage = { id: Date.now(), text: currentInput, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsBotTyping(true);

        if (!chatSession.current) {
            setMessages(prev => [...prev, {
                id: 'error-no-session',
                text: "Chat session is not initialized. Please try closing and reopening the chat.",
                sender: 'bot'
            }]);
            setIsBotTyping(false);
            return;
        }

        const botResponse: ChatMessage = { id: Date.now() + 1, text: '', sender: 'bot' };
        setMessages(prev => [...prev, botResponse]);
        
        try {
            const stream = await chatSession.current.sendMessageStream({ message: currentInput });
            let streamedText = "";

            for await (const chunk of stream) {
                streamedText += chunk.text;
                setMessages(prevMessages => {
                    const newMessages = [...prevMessages];
                    newMessages[newMessages.length - 1].text = streamedText;
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message to AI:", error);
            setMessages(prevMessages => {
                const newMessages = [...prevMessages];
                newMessages[newMessages.length - 1].text = "Oops! Something went wrong while getting a response. Please try again.";
                return newMessages;
            });
        } finally {
            setIsBotTyping(false);
        }
    };

    const isMicDisabled = micPermission === 'denied' || micPermission === 'unsupported';

    return (
        <>
            <div className="fixed bottom-6 right-6 z-40">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="bg-emerald-500 rounded-full p-4 shadow-lg"
                    aria-label="Open Chatbot"
                >
                    <ChatbotIcon />
                </motion.button>
            </div>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="fixed bottom-24 right-6 w-80 h-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl flex flex-col z-40"
                    >
                        <header className="bg-gray-100 dark:bg-gray-900 p-3 flex justify-between items-center rounded-t-xl">
                            <h3 className="text-gray-900 dark:text-white font-bold">EcoBot</h3>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <CloseIcon />
                            </button>
                        </header>
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                                     <div className={`flex items-end gap-2 max-w-[90%]`}>
                                        {msg.sender === 'bot' && (
                                            <button onClick={() => handleSpeak(msg)} className="mb-1" aria-label="Read message aloud">
                                                <SpeakerIcon isSpeaking={speakingId === msg.id} />
                                            </button>
                                        )}
                                        <div className={`p-2 rounded-lg ${msg.sender === 'user' ? 'bg-emerald-500 dark:bg-emerald-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white'}`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                             {isBotTyping && messages[messages.length - 1]?.sender === 'user' && (
                                <div className="flex justify-start mb-3">
                                    <div className="flex items-end gap-2 max-w-[90%]">
                                        <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-white">
                                            <div className="flex items-center justify-center space-x-1">
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                             )}
                             <div ref={messagesEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700">
                             <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    placeholder={isListening ? "Listening..." : isBotTyping ? "EcoBot is typing..." : "Ask something..."}
                                    className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    disabled={isBotTyping}
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                                    <button
                                        type="button"
                                        onClick={handleListenClick}
                                        disabled={isMicDisabled}
                                        className="group relative rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        aria-label={isListening ? 'Stop listening' : isMicDisabled ? 'Microphone unavailable' : 'Use microphone'}
                                    >
                                        <MicrophoneIcon isListening={isListening} disabled={isMicDisabled} />
                                        {micPermission === 'denied' && (
                                            <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 text-center z-10 shadow-lg">
                                                Microphone access denied. Please enable it in your browser's site settings.
                                            </div>
                                        )}
                                        {micPermission === 'unsupported' && (
                                            <div className="absolute bottom-full right-1/2 translate-x-1/2 mb-2 w-56 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 text-center z-10 shadow-lg">
                                                Voice input is not supported by your browser.
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
};


// --- PAGES ---

const LoginPage: React.FC<{ onLogin: () => void }> = ({ onLogin }) => (
    <div className="h-screen w-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 dark:opacity-20" style={{backgroundImage: "url('https://picsum.photos/1920/1080?blur=5&grayscale')"}}></div>
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg p-10 rounded-2xl shadow-2xl text-gray-900 dark:text-white text-center w-full max-w-sm"
        >
            <h1 className="text-5xl font-bold text-emerald-500 dark:text-emerald-400 mb-2">GreenMap</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-8">Mapping a sustainable future, together.</p>
            <div className="space-y-4">
                <input type="email" placeholder="Email" defaultValue="demo@greenmap.com" className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input type="password" placeholder="Password" defaultValue="password" className="w-full p-3 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button onClick={onLogin} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 mt-8 rounded-lg transition-transform duration-300 hover:scale-105">
                Login
            </button>
        </motion.div>
    </div>
);

const WelcomeScreen: React.FC<{ username: string }> = ({ username }) => (
    <motion.div
        key="welcome-screen"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        className="fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex justify-center items-center z-50"
    >
        <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0, transition: { delay: 0.2, type: 'spring', stiffness: 120 } }}
        >
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white">Welcome, <span className="text-emerald-500 dark:text-emerald-400">{username}</span>!</h1>
        </motion.div>
    </motion.div>
);

const ReportDetailPanel: React.FC<{ report: Report | null; onClose: () => void }> = ({ report, onClose }) => {
    return (
        <AnimatePresence>
            {report && (
                 <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-40 flex flex-col"
                >
                    <div className="p-6 bg-gray-100 dark:bg-gray-900/50 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Report Details</h2>
                        <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"><CloseIcon /></button>
                    </div>
                    <div className="p-6 flex-1 text-gray-800 dark:text-white overflow-y-auto">
                        <div className="mb-4">
                            <h3 className="font-bold text-xl">{report.locationName}</h3>
                            <p className={`text-sm font-semibold ${report.type === ReportType.TreePlantation ? 'text-green-500 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                                {report.type === ReportType.TreePlantation ? '🌱 Tree Plantation' : '⚠️ Pollution Hotspot'}
                            </p>
                        </div>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <div>
                                <label className="font-bold text-gray-500 dark:text-gray-500 text-xs uppercase">Description</label>
                                <p>{report.description}</p>
                            </div>
                            <div>
                                <label className="font-bold text-gray-500 dark:text-gray-500 text-xs uppercase">Coordinates</label>
                                <p className="font-mono text-sm">{report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}</p>
                            </div>
                            <div>
                                <label className="font-bold text-gray-500 dark:text-gray-500 text-xs uppercase">Reported By</label>
                                <p>{report.reportedBy}</p>
                            </div>
                            <div>
                                <label className="font-bold text-gray-500 dark:text-gray-500 text-xs uppercase">Date</label>
                                <p>{new Date(report.timestamp).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                 </motion.div>
            )}
        </AnimatePresence>
    )
};


const DashboardPage: React.FC<{
    reports: Report[],
    addReport: (reportData: Omit<Report, 'id' | 'reportedBy' | 'timestamp'>) => void,
    updateReport: (reportData: Report) => void,
    theme: string
}> = ({ reports, addReport, updateReport, theme }) => {
    const [formInitialData, setFormInitialData] = useState<{ position: { lat: number; lng: number }; locationName: string } | null>(null);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const [editingReport, setEditingReport] = useState<Report | null>(null);
    const [viewingReport, setViewingReport] = useState<Report | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<{ lat: number; lng: number } | null>(null);
    const [searchError, setSearchError] = useState<string | null>(null);

    const treeCount = useMemo(() => reports.filter(r => r.type === ReportType.TreePlantation).length, [reports]);
    const pollutionCount = useMemo(() => reports.filter(r => r.type === ReportType.PollutionHotspot).length, [reports]);

    const handleMapClick = useCallback(async (latlng: L.LatLng) => {
        if (!editingReport) { // Prevent opening a new form while editing
            setIsFetchingLocation(true);
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`);
                if (!response.ok) throw new Error("Failed to fetch location");
                const data = await response.json();
                const locationName = data.display_name || `Lat: ${latlng.lat.toFixed(4)}, Lng: ${latlng.lng.toFixed(4)}`;
                setFormInitialData({
                    position: { lat: latlng.lat, lng: latlng.lng },
                    locationName: locationName,
                });
            } catch (error) {
                console.error("Error fetching location name:", error);
                setFormInitialData({
                    position: { lat: latlng.lat, lng: latlng.lng },
                    locationName: '', // Let user fill manually
                });
            } finally {
                setIsFetchingLocation(false);
            }
        }
    }, [editingReport]);

    const handleFormSubmit = (reportData: Omit<Report, 'id'| 'reportedBy' | 'timestamp'>) => {
        addReport(reportData);
        setFormInitialData(null);
    };
    
    const handleUpdateSubmit = (reportData: Report) => {
        updateReport(reportData);
        setEditingReport(null);
    };

    const handleMarkerDragEnd = (reportId: string, newLatLng: L.LatLng) => {
        if (editingReport && editingReport.id === reportId) {
            setEditingReport({
                ...editingReport,
                latitude: newLatLng.lat,
                longitude: newLatLng.lng,
            });
        }
    };
    
    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchError(null);
        setSearchResult(null);

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`, {
                headers: { 'User-Agent': 'GreenMap Application v1.0' }
            });
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            const data = await response.json();
            if (data && data.length > 0) {
                setSearchResult({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
            } else {
                setSearchError("Location not found. Please try another search.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchError("Failed to search. Please check your connection.");
        }
    };


    return (
        <div className="h-full w-full relative">
            <div className="absolute top-4 left-4 z-10 flex flex-col space-y-3">
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow-lg text-gray-900 dark:text-white w-64">
                    <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">Statistics</h3>
                    <p className="text-lg">🌱 Trees Planted: <span className="font-bold">{treeCount}</span></p>
                    <p className="text-lg">⚠️ Pollution Hotspots: <span className="font-bold">{pollutionCount}</span></p>
                </motion.div>
                 <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-4 rounded-lg shadow-lg text-gray-900 dark:text-white w-64">
                    <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400">How to help?</h3>
                    {isFetchingLocation ? (
                        <p className="text-sm text-emerald-500 dark:text-emerald-300 animate-pulse">Fetching location...</p>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">Click anywhere on the map to add a new report. Click a marker for more options.</p>
                    )}
                </motion.div>
            </div>
             <div className="absolute top-4 right-4 z-10 w-64 sm:w-80">
                <motion.form 
                    onSubmit={handleSearch}
                    initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    className="flex items-center bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-lg shadow-lg"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setSearchError(null);
                            setSearchResult(null);
                        }}
                        placeholder="Search for a location..."
                        className="bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 py-2 px-4 focus:outline-none w-full"
                    />
                    <button type="submit" className="text-white bg-emerald-500 hover:bg-emerald-600 p-2.5 rounded-r-lg transition-colors shrink-0" aria-label="Search">
                        <SearchIcon />
                    </button>
                </motion.form>
                <AnimatePresence>
                    {searchError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 text-sm text-red-700 dark:text-red-400 bg-red-100/80 dark:bg-red-900/80 backdrop-blur-sm p-2 rounded-md shadow-lg text-center"
                        >
                            {searchError}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <MapComponent 
                reports={reports} 
                onMapClick={handleMapClick} 
                onViewDetails={setViewingReport}
                onEditReport={setEditingReport}
                editingReportId={editingReport?.id || null}
                onMarkerDragEnd={handleMarkerDragEnd}
                searchResult={searchResult}
                theme={theme}
            />
            <AnimatePresence>
                {formInitialData && <ReportForm position={formInitialData.position} initialLocationName={formInitialData.locationName} onClose={() => setFormInitialData(null)} onSubmit={handleFormSubmit} />}
                {editingReport && <ReportForm reportToEdit={editingReport} onClose={() => setEditingReport(null)} onUpdate={handleUpdateSubmit} />}
            </AnimatePresence>
            <ReportDetailPanel report={viewingReport} onClose={() => setViewingReport(null)} />
        </div>
    );
};

const PageContainer: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="text-gray-900 dark:text-white p-8"
    >
        <div className="container mx-auto">
            <h1 className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">{title}</h1>
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-lg">
                {children}
            </div>
        </div>
    </motion.div>
);

const ReportsPage: React.FC<{reports: Report[]}> = ({ reports }) => {
    const [filterType, setFilterType] = useState<ReportType | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAndSortedReports = useMemo(() => {
        let result = [...reports];
        
        if (filterType !== 'ALL') {
            result = result.filter(r => r.type === filterType);
        }

        if (searchTerm.trim() !== '') {
            const lowercasedTerm = searchTerm.toLowerCase();
            result = result.filter(r => 
                r.locationName.toLowerCase().includes(lowercasedTerm) ||
                r.description.toLowerCase().includes(lowercasedTerm)
            );
        }

        switch (sortBy) {
            case 'oldest':
                result.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                break;
            case 'name':
                result.sort((a, b) => a.locationName.localeCompare(b.locationName));
                break;
            case 'newest':
            default:
                result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                break;
        }
        return result;
    }, [reports, filterType, sortBy, searchTerm]);

    const handleDownloadCSV = () => {
        if (filteredAndSortedReports.length === 0) {
            alert("No data available to download for the current filters.");
            return;
        }
        const headers = ["ID", "Type", "Latitude", "Longitude", "Location Name", "Description", "Reported By", "Timestamp"];
        
        const escapeCsvCell = (cell: any): string => {
            const strCell = String(cell);
            if (strCell.includes(',')) {
                return `"${strCell.replace(/"/g, '""')}"`;
            }
            return strCell;
        };

        const csvContent = [
            headers.join(','),
            ...filteredAndSortedReports.map(report => [
                escapeCsvCell(report.id),
                escapeCsvCell(report.type),
                escapeCsvCell(report.latitude),
                escapeCsvCell(report.longitude),
                escapeCsvCell(report.locationName),
                escapeCsvCell(report.description),
                escapeCsvCell(report.reportedBy),
                escapeCsvCell(report.timestamp)
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "greenmap_reports.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const selectClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500";
    const inputClasses = "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all";

    return (
        <PageContainer title="All Reports">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-gray-100/30 dark:bg-gray-700/30 rounded-lg gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search location/description..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)}
                        className={`${inputClasses} w-full sm:w-auto`}
                    />
                    <div className="flex items-center space-x-2">
                        <label htmlFor="filter-type" className="text-gray-600 dark:text-gray-400">Filter:</label>
                        <select id="filter-type" value={filterType} onChange={e => setFilterType(e.target.value as ReportType | 'ALL')} className={selectClasses}>
                            <option value="ALL">All Types</option>
                            <option value={ReportType.TreePlantation}>🌱 Tree Plantation</option>
                            <option value={ReportType.PollutionHotspot}>⚠️ Pollution Hotspot</option>
                        </select>
                    </div>
                     <div className="flex items-center space-x-2">
                        <label htmlFor="sort-by" className="text-gray-600 dark:text-gray-400">Sort:</label>
                        <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')} className={selectClasses}>
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                            <option value="name">Name (A-Z)</option>
                        </select>
                    </div>
                </div>
                <button
                    onClick={handleDownloadCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center w-full md:w-auto justify-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download CSV
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-100/50 dark:bg-gray-700/50">
                        <tr className="border-b border-gray-200 dark:border-gray-600">
                            <th className="p-3">Type</th>
                            <th className="p-3">Location Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAndSortedReports.length > 0 ? (
                            filteredAndSortedReports.map(report => (
                                <tr key={report.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="p-3 whitespace-nowrap">{report.type === ReportType.TreePlantation ? '🌱 Plantation' : '⚠️ Pollution'}</td>
                                    <td className="p-3">{report.locationName}</td>
                                    <td className="p-3">{report.description}</td>
                                    <td className="p-3 whitespace-nowrap">{new Date(report.timestamp).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center p-8 text-gray-500 dark:text-gray-500">
                                    No reports match your search criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </PageContainer>
    );
};

const Gauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = Math.min(Math.max((score / 10) * 100, 0), 100);
    const rotation = (percentage / 100) * 180 - 90;
    const color = score > 7 ? '#34D399' : score > 4 ? '#FBBF24' : '#F87171';
    
    return (
        <div className="w-48 h-24 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" className="stroke-gray-300 dark:stroke-gray-700" strokeWidth="10" strokeLinecap="round" />
                <motion.path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    fill="none"
                    stroke={color}
                    strokeWidth="10"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: "0, 251.2" }}
                    animate={{ strokeDasharray: `${(percentage / 100) * 125.6}, 251.2` }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </svg>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                 <span className="text-3xl font-bold" style={{ color }}>{score}</span>
                 <p className="text-xs text-gray-500 dark:text-gray-400">Positivity Score</p>
            </div>
        </div>
    );
};

const AnalysisPage: React.FC<{ reports: Report[] }> = ({ reports }) => {
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    const analysisData = useMemo(() => {
        const totalReports = reports.length;
        if (totalReports === 0) {
            return {
                totalReports: 0,
                treeCount: 0,
                pollutionCount: 0,
                treePercentage: 0,
                pollutionPercentage: 0,
                monthlyData: [],
                maxMonthlyCount: 0,
            };
        }

        const treeCount = reports.filter(r => r.type === ReportType.TreePlantation).length;
        const pollutionCount = totalReports - treeCount;
        const treePercentage = (treeCount / totalReports) * 100;
        const pollutionPercentage = 100 - treePercentage;

        const reportsByMonth = reports.reduce<Record<string, number>>((acc, report) => {
            const date = new Date(report.timestamp);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            acc[monthKey] = (acc[monthKey] || 0) + 1;
            return acc;
        }, {});

        const monthlyData = Object.entries(reportsByMonth)
            .map(([dateKey, value]) => ({
                date: new Date(dateKey + '-01'), // Use first day of month for sorting
                label: new Date(dateKey + '-01').toLocaleString('default', { month: 'short', year: '2-digit' }),
                value,
            }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
        
        const maxMonthlyCount = Math.max(...monthlyData.map(d => d.value), 0);

        return { totalReports, treeCount, pollutionCount, treePercentage, pollutionPercentage, monthlyData, maxMonthlyCount };
    }, [reports]);
    
    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        setAiAnalysis(null);
        setAnalysisError(null);

        if (reports.length < 3) {
            setAnalysisError("Not enough data for a meaningful analysis. Please add at least 3 reports.");
            setIsAnalyzing(false);
            return;
        }

        try {
            const resultJson = await generateReportAnalysis(analysisData);
            setAiAnalysis(resultJson);
        } catch (error) {
            console.error("AI analysis generation failed:", error);
            setAnalysisError("Failed to generate analysis. There might be an issue with the AI service or your API key.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const StatCard = ({ title, value, icon, delay = 0 }: { title: string, value: string | number, icon: string, delay?: number }) => (
        <motion.div 
            className="bg-gray-100/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-lg flex items-center space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay * 0.15 }}
        >
            <div className="text-3xl text-emerald-500 dark:text-emerald-400">{icon}</div>
            <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
                <p className="text-2xl font-bold">{value}</p>
            </div>
        </motion.div>
    );
    
    const AnalysisListItem: React.FC<{children: React.ReactNode, delay: number}> = ({ children, delay }) => (
        <motion.li 
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + delay * 0.15 }}
        >
            <span className="text-emerald-500 dark:text-emerald-400 mr-3 mt-1">✓</span>
            <span>{children}</span>
        </motion.li>
    );

    return (
        <PageContainer title="Data Analysis">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Total Reports" value={analysisData.totalReports} icon="📈" delay={0} />
                <StatCard title="Tree Plantations" value={analysisData.treeCount} icon="🌳" delay={1} />
                <StatCard title="Pollution Hotspots" value={analysisData.pollutionCount} icon="⚠️" delay={2} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <motion.div 
                    className="bg-gray-100/50 dark:bg-gray-700/50 p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Report Type Distribution</h2>
                    <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-8 flex overflow-hidden">
                        <motion.div
                            className="bg-green-500 flex justify-center items-center text-white font-bold"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisData.treePercentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            title={`Tree Plantations: ${analysisData.treePercentage.toFixed(1)}%`}
                        >
                           {analysisData.treePercentage > 10 && `🌳 ${analysisData.treePercentage.toFixed(0)}%`}
                        </motion.div>
                         <motion.div
                            className="bg-red-500 flex justify-center items-center text-white font-bold"
                            initial={{ width: 0 }}
                            animate={{ width: `${analysisData.pollutionPercentage}%` }}
                            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                            title={`Pollution Hotspots: ${analysisData.pollutionPercentage.toFixed(1)}%`}
                        >
                            {analysisData.pollutionPercentage > 10 && `⚠️ ${analysisData.pollutionPercentage.toFixed(0)}%`}
                        </motion.div>
                    </div>
                </motion.div>

                 <motion.div 
                    className="bg-gray-100/50 dark:bg-gray-700/50 p-6 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Reports Over Time</h2>
                    <div className="flex justify-between items-end h-48 space-x-2">
                        {analysisData.monthlyData.length > 0 ? (
                            analysisData.monthlyData.map((data, index) => (
                                <div key={data.label} className="flex-1 flex flex-col items-center justify-end">
                                    <p className="text-sm font-bold">{data.value}</p>
                                    <motion.div
                                        className="w-full bg-emerald-500 rounded-t-md"
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(data.value / analysisData.maxMonthlyCount) * 100}%` }}
                                        transition={{ duration: 0.5, delay: 0.6 + index * 0.05, ease: "easeOut" }}
                                        title={`${data.label}: ${data.value} reports`}
                                    />
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{data.label}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-600 dark:text-gray-500 w-full text-center">No monthly data available.</p>
                        )}
                    </div>
                </motion.div>
            </div>
            
            <motion.div
                className="mt-8 bg-gray-100/50 dark:bg-gray-700/50 p-6 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <h2 className="text-xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">✨ AI-Powered Insights</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Get an automated analysis of the current environmental reports. This AI will identify trends and suggest potential actions.
                </p>
                <button
                    onClick={handleGenerateAnalysis}
                    disabled={isAnalyzing}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center"
                >
                    {isAnalyzing ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                        </>
                    ) : (
                        'Generate Analysis'
                    )}
                </button>

                {analysisError && (
                    <div className="mt-4 p-4 bg-red-100/50 dark:bg-red-900/50 border border-red-400 dark:border-red-500 text-red-700 dark:text-red-300 rounded-lg">
                        <p>{analysisError}</p>
                    </div>
                )}

                {aiAnalysis && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 0.2 }}
                        className="mt-4 p-4 bg-gray-200/30 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-600 rounded-lg"
                    >
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="md:col-span-2">
                                <motion.h4 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="font-bold text-lg mb-2 text-emerald-500 dark:text-emerald-300">Summary</motion.h4>
                                <motion.p 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                                    className="text-gray-700 dark:text-gray-300 font-sans leading-relaxed">{aiAnalysis.summary}</motion.p>
                            </div>
                            <motion.div 
                                initial={{ opacity: 0, scale:0.8 }} animate={{ opacity: 1, scale:1 }} transition={{ delay: 0.5 }}
                                className="flex justify-center items-center">
                                <Gauge score={aiAnalysis.score} />
                            </motion.div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6 mt-6 border-t border-gray-300 dark:border-gray-700 pt-6">
                            <div>
                                <motion.h4 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="font-bold text-lg mb-2 text-emerald-500 dark:text-emerald-300">🔎 Key Observations</motion.h4>
                                <ul className="space-y-2">
                                    {aiAnalysis.observations.map((item, i) => <AnalysisListItem key={i} delay={i}>{item}</AnalysisListItem>)}
                                </ul>
                            </div>
                            <div>
                                <motion.h4 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="font-bold text-lg mb-2 text-emerald-500 dark:text-emerald-300">💡 Recommendations</motion.h4>
                                <ul className="space-y-2">
                                    {aiAnalysis.recommendations.map((item, i) => <AnalysisListItem key={i} delay={i}>{item}</AnalysisListItem>)}
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </PageContainer>
    );
};

interface AddNewsFormProps {
    onClose: () => void;
    onSubmit: (article: Omit<NewsArticle, 'id' | 'date'>) => void;
}

const AddNewsForm: React.FC<AddNewsFormProps> = ({ onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !excerpt.trim() || !imageUrl.trim()) {
            alert("Please fill out all fields.");
            return;
        }
        onSubmit({ title, excerpt, imageUrl });
        onClose();
    };
    
    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
            onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-2xl p-8 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
               <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Add News Article</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                     <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Excerpt</label>
                        <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} required rows={3} className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Image URL</label>
                        <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required placeholder="https://example.com/image.jpg" className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                    </div>
                    <div className="flex items-center justify-end space-x-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                        <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Add Article</button>
                    </div>
                </form>
            </div>
        </motion.div>
    )
};


const NewsPage: React.FC<{
    newsData: NewsArticle[],
    addNewsArticle: (article: Omit<NewsArticle, 'id' | 'date'>) => void
}> = ({ newsData, addNewsArticle }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const sortedNews = useMemo(() => 
        [...newsData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [newsData]);

    return (
        <PageContainer title="Latest Environmental News">
            <div className="flex justify-end mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add News Article
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedNews.map((article, index) => (
                     <motion.div 
                        key={article.id} 
                        className="bg-gray-100/50 dark:bg-gray-700/50 rounded-lg overflow-hidden shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 transition-shadow duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
                        <div className="p-6">
                            <h3 className="font-bold text-xl mb-2 text-emerald-600 dark:text-emerald-400">{article.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-base mb-4">{article.excerpt}</p>
                            <p className="text-gray-600 dark:text-gray-500 text-sm">{new Date(article.date).toLocaleDateString()}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
            <AnimatePresence>
                {isModalOpen && <AddNewsForm onClose={() => setIsModalOpen(false)} onSubmit={addNewsArticle} />}
            </AnimatePresence>
        </PageContainer>
    );
};

const CommunityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'chat' | 'gallery'>('chat');

    // Chat State
    const [chatMessages, setChatMessages] = useState([
        { id: 1, user: 'Eco Warrior', text: 'Welcome to the community chat! Let\'s discuss how we can make a difference.', timestamp: '10:30 AM', avatarSeed: 'warrior' },
        { id: 2, user: 'Alex Green', text: 'Just reported a new tree plantation in Hyde Park! Feels great to contribute.', timestamp: '10:32 AM', avatarSeed: 'alex' },
        { id: 3, user: 'Jane Doe', text: 'That\'s awesome, Alex! I\'m planning a cleanup event next weekend. Anyone interested?', timestamp: '10:35 AM', avatarSeed: 'jane' },
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (chatInput.trim() === '') return;
        const newMessage = {
            id: Date.now(),
            user: 'Alex Green',
            text: chatInput,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatarSeed: 'alex'
        };
        setChatMessages([...chatMessages, newMessage]);
        setChatInput('');
    };

    // Gallery State
    const [galleryImages, setGalleryImages] = useState([
        { id: 1, src: 'https://picsum.photos/seed/gallery1/600/400', caption: 'Our community tree planting day was a huge success!', user: 'Eco Warriors' },
        { id: 2, src: 'https://picsum.photos/seed/gallery2/600/400', caption: 'Cleaned up the local beach this morning.', user: 'Jane Doe' },
        { id: 3, src: 'https://picsum.photos/seed/gallery3/600/400', caption: 'My new sapling in Hyde Park.', user: 'Alex Green' },
        { id: 4, src: 'https://picsum.photos/seed/gallery4/600/400', caption: 'Before and after of the river cleanup project.', user: 'GreenPeace' },
    ]);
    const [selectedImg, setSelectedImg] = useState<string | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadCaption, setUploadCaption] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !uploadCaption.trim()) {
            alert("Please provide an image and a caption.");
            return;
        }
        const newImage = {
            id: Date.now(),
            src: uploadPreview!,
            caption: uploadCaption,
            user: 'Alex Green'
        };
        setGalleryImages([newImage, ...galleryImages]);
        setIsUploadModalOpen(false);
        setUploadCaption('');
        setUploadFile(null);
        setUploadPreview(null);
    };


    return (
        <PageContainer title="Community Hub">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
                <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-6 py-3 text-lg font-medium transition-colors ${activeTab === 'chat' ? 'border-b-2 border-emerald-500 dark:border-emerald-400 text-emerald-500 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    💬 Chat
                </button>
                <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-6 py-3 text-lg font-medium transition-colors ${activeTab === 'gallery' ? 'border-b-2 border-emerald-500 dark:border-emerald-400 text-emerald-500 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    🖼️ Gallery
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'chat' ? (
                    <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-[65vh]">
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                            {chatMessages.map(msg => (
                                <div key={msg.id} className={`flex items-start gap-3 ${msg.user === 'Alex Green' ? 'flex-row-reverse' : ''}`}>
                                    <img src={`https://picsum.photos/seed/${msg.avatarSeed}/40`} alt={msg.user} className="w-10 h-10 rounded-full" />
                                    <div className={`p-3 rounded-lg max-w-md ${msg.user === 'Alex Green' ? 'bg-emerald-700 dark:bg-emerald-800 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                                        <div className="flex items-baseline gap-2">
                                            <p className="font-bold text-emerald-500 dark:text-emerald-300">{msg.user}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{msg.timestamp}</p>
                                        </div>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                        <form onSubmit={handleSendMessage} className="mt-4 flex gap-3">
                            <input
                                type="text"
                                value={chatInput}
                                onChange={e => setChatInput(e.target.value)}
                                placeholder="Type your message..."
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Send</button>
                        </form>
                    </motion.div>
                ) : (
                     <motion.div key="gallery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="flex justify-end mb-4">
                            <button 
                                onClick={() => setIsUploadModalOpen(true)} 
                                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                Upload Photo
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {galleryImages.map(img => (
                                <motion.div key={img.id} layoutId={img.src} onClick={() => setSelectedImg(img.src)} className="group cursor-pointer aspect-w-1 aspect-h-1 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    <img src={img.src} alt={img.caption} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <p className="text-white text-sm">{img.caption}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedImg && (
                    <motion.div onClick={() => setSelectedImg(null)} className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4">
                        <motion.img layoutId={selectedImg} src={selectedImg} alt="Enlarged view" className="max-w-full max-h-full rounded-lg shadow-2xl" />
                    </motion.div>
                )}
                 {isUploadModalOpen && (
                     <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
                        onClick={() => setIsUploadModalOpen(false)}>
                        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-2xl p-8 w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                           <h2 className="text-2xl font-bold mb-4 text-emerald-600 dark:text-emerald-400">Upload Your Photo</h2>
                            <form onSubmit={handleUpload}>
                                <div className="mb-4">
                                    <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Photo</label>
                                     <label htmlFor="photo-upload" className="cursor-pointer bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-2 px-4 rounded-md transition duration-300 inline-block">
                                        {uploadFile ? 'Change Photo' : 'Select Photo'}
                                    </label>
                                    <input id="photo-upload" type="file" accept="image/*" onChange={handleFileChange} required className="hidden"/>
                                    {uploadPreview && <img src={uploadPreview} alt="Preview" className="mt-4 rounded-lg max-h-48" />}
                                </div>
                                <div className="mb-4">
                                    <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Caption</label>
                                    <input type="text" value={uploadCaption} onChange={e => setUploadCaption(e.target.value)} required className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"/>
                                </div>
                                <div className="flex items-center justify-end space-x-4">
                                    <button type="button" onClick={() => setIsUploadModalOpen(false)} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Upload</button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageContainer>
    );
};


const ProfilePage: React.FC<{ reports: Report[] }> = ({ reports }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("Alex Green");
    const [email, setEmail] = useState("alex.green@example.com");

    const [tempName, setTempName] = useState(name);
    const [tempEmail, setTempEmail] = useState(email);

    const userReports = useMemo(() =>
        reports.filter(report => report.reportedBy === name),
    [reports, name]);

    const treeReportsCount = useMemo(() =>
        userReports.filter(report => report.type === ReportType.TreePlantation).length,
    [userReports]);

    const pollutionReportsCount = useMemo(() =>
        userReports.filter(report => report.type === ReportType.PollutionHotspot).length,
    [userReports]);
    
    const recentActivities = useMemo(() =>
        userReports
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3),
    [userReports]);

    const handleEdit = () => {
        setTempName(name);
        setTempEmail(email);
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setName(tempName);
        setEmail(tempEmail);
        setIsEditing(false);
    };

    const StatCard = ({ value, label, icon, delay }: {value: number, label: string, icon: string, delay: number}) => (
        <motion.div 
            className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay * 0.1 + 0.3 }}
        >
            <p className="text-3xl font-bold">{icon} {value}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{label}</p>
        </motion.div>
    );

    return (
        <PageContainer title="My Profile">
            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <motion.div layout>
                    <img src="https://picsum.photos/seed/profile/150" alt="Profile" className="w-32 h-32 rounded-full ring-4 ring-emerald-500" />
                </motion.div>
                
                <div className="flex-1 w-full overflow-hidden">
                    <AnimatePresence mode="wait">
                        {isEditing ? (
                            <motion.form
                                key="edit-form"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                onSubmit={handleSave}
                                className="w-full"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Name</label>
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onChange={e => setTempName(e.target.value)} 
                                            className="w-full max-w-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Email</label>
                                        <input 
                                            type="email" 
                                            value={tempEmail} 
                                            onChange={e => setTempEmail(e.target.value)} 
                                            className="w-full max-w-sm bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                                        />
                                    </div>
                                </div>
                                <div className="mt-6 flex space-x-4">
                                    <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition duration-300">Save Changes</button>
                                    <button type="button" onClick={handleCancel} className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white font-bold py-2 px-4 rounded-md transition duration-300">Cancel</button>
                                </div>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="display-profile"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-3xl font-bold">{name}</h2>
                                <p className="text-emerald-500 dark:text-emerald-400">{email}</p>
                                <p className="mt-2 text-gray-700 dark:text-gray-300">Joined on {new Date().toLocaleDateString()}</p>
                                <button onClick={handleEdit} className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-md transition-transform duration-300 hover:scale-105">
                                    Edit Profile
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            
            <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                 <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">My Contributions</h3>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard value={treeReportsCount} label="Trees Planted" icon="🌳" delay={0} />
                    <StatCard value={pollutionReportsCount} label="Pollution Hotspots" icon="⚠️" delay={1} />
                    <StatCard value={userReports.length} label="Total Contributions" icon="⭐" delay={2} />
                 </div>
            </div>

            <div className="mt-8">
                <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {recentActivities.length > 0 ? (
                        recentActivities.map((report, index) => (
                             <motion.div
                                key={report.id}
                                className="bg-gray-100/50 dark:bg-gray-700/50 p-4 rounded-lg flex items-center justify-between"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 + 0.5 }}
                            >
                                <div>
                                    <p className="font-bold">
                                        {report.type === ReportType.TreePlantation ? '🌱' : '⚠️'} {report.locationName}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-500 whitespace-nowrap">{new Date(report.timestamp).toLocaleDateString()}</p>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-gray-500 dark:text-gray-500">No reports submitted yet. Go make your first contribution!</p>
                    )}
                </div>
            </div>

        </PageContainer>
    );
};

const AboutPage = () => {
    const teamMembers = [
        { name: 'Nikhil', role: 'Founder & Lead Developer', seed: 'nikhil' },
        { name: 'Devnand', role: 'Lead UI/UX Designer', seed: 'devnand' },
        { name: 'Sajan', role: 'Backend Architect', seed: 'sajan' },
        { name: 'Rayan', role: 'Frontend Specialist', seed: 'rayan' },
        { name: 'Saniya', role: 'Data & Analytics Lead', seed: 'saniya' },
        { name: 'HEMADG', role: 'Community & Marketing', seed: 'hemadg' },
    ];

    return (
        <PageContainer title="About GreenMap">
            <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                GreenMap is a community-driven platform dedicated to visualizing and tracking environmental actions around the globe. Our mission is to empower individuals and organizations to make a tangible impact by mapping both positive contributions, like tree plantations, and areas of concern, such as pollution hotspots.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                By providing a clear, interactive map, we aim to raise awareness, encourage participation, and foster a global community committed to protecting our planet. Join us in creating a greener, cleaner world, one report at a time.
            </p>
            <div className="mt-12">
                <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-6 text-center">Our Team</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {teamMembers.map((member, index) => (
                        <motion.div
                            key={member.name}
                            className="text-center bg-gray-100/50 dark:bg-gray-700/50 p-6 rounded-lg shadow-lg hover:shadow-emerald-500/10 dark:hover:shadow-emerald-500/20 transition-shadow duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <img
                                src={`https://picsum.photos/seed/${member.seed}/150`}
                                alt={member.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 ring-gray-300 dark:ring-gray-600"
                            />
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{member.name}</h3>
                            <p className="text-emerald-500 dark:text-emerald-400">{member.role}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </PageContainer>
    );
};

const FeedbackPage: React.FC = () => {
    const [feedbackType, setFeedbackType] = useState('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<FeedbackAnalysisResult | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            alert("Please enter your feedback message.");
            return;
        }
        setIsSubmitting(true);
        setSubmitSuccess(false);
        setAnalysisResult(null);

        // AI Analysis Call
        try {
            const resultJson = await analyzeFeedback(feedbackType, message);
            setAnalysisResult(resultJson);
        } catch (error) {
            console.error("Feedback analysis failed:", error);
            // Non-blocking error. The feedback can still be submitted.
        }

        // Simulate submission process
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitSuccess(true);
            setMessage('');
            setFeedbackType('general');
            setTimeout(() => {
                setSubmitSuccess(false);
                setAnalysisResult(null);
            }, 6000); // Hide success message after 6 seconds
        }, 500);
    };

    const inputClasses = "w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500";
    
    return (
        <PageContainer title="Submit Feedback">
            <div className="max-w-xl mx-auto">
                 <p className="mb-8 text-gray-700 dark:text-gray-300 text-center">
                    We value your input! Whether you've found a bug, have an idea for a new feature, or just want to share your thoughts, we'd love to hear from you.
                </p>
                <AnimatePresence>
                    {submitSuccess && (
                         <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="bg-green-100/50 dark:bg-green-800/50 border border-green-400 dark:border-green-500 text-green-700 dark:text-green-200 px-4 py-3 rounded-lg relative mb-6 text-center"
                            role="alert"
                        >
                            <strong className="font-bold">Thank you! </strong>
                            <span className="block sm:inline">Your feedback has been submitted successfully.</span>
                             {analysisResult && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: '0.5rem' }}
                                    transition={{ delay: 0.2 }}
                                    className="text-sm"
                                >
                                    AI analysis: Category '{analysisResult.category}', Sentiment '{analysisResult.sentiment}'.
                                </motion.div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Feedback Type</label>
                        <select value={feedbackType} onChange={e => setFeedbackType(e.target.value)} className={inputClasses}>
                            <option value="general">General Comment</option>
                            <option value="bug">Bug Report</option>
                            <option value="feature">Feature Request</option>
                        </select>
                    </div>
                     <div className="mb-6">
                        <label className="block text-gray-600 dark:text-gray-400 text-sm font-bold mb-2">Message</label>
                        <textarea 
                            value={message} 
                            onChange={e => setMessage(e.target.value)} 
                            required 
                            rows={6} 
                            placeholder="Tell us what you think..."
                            className={inputClasses}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-md transition duration-300 flex items-center justify-center"
                    >
                         {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </PageContainer>
    );
};


// --- MAIN APP COMPONENT & ROUTER ---

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
    const [reports, setReports] = useState<Report[]>(() => {
        try {
            const savedReports = localStorage.getItem('greenmap_reports');
            return savedReports ? JSON.parse(savedReports) : initialReports;
        } catch (error) {
            console.error("Failed to load reports from localStorage", error);
            return initialReports;
        }
    });
    const [newsData, setNewsData] = useState<NewsArticle[]>(() => {
        try {
            const savedNews = localStorage.getItem('greenmap_news');
            return savedNews ? JSON.parse(savedNews) : mockNewsData;
        } catch (error) {
            console.error("Failed to load news from localStorage", error);
            return mockNewsData;
        }
    });

    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('greenmap_theme');
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    const location = useLocation();

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('greenmap_theme', theme);
    }, [theme]);

    useEffect(() => {
        try {
            localStorage.setItem('greenmap_reports', JSON.stringify(reports));
        } catch (error) {
            console.error("Failed to save reports to localStorage", error);
        }
    }, [reports]);

    useEffect(() => {
        try {
            localStorage.setItem('greenmap_news', JSON.stringify(newsData));
        } catch (error) {
            console.error("Failed to save news to localStorage", error);
        }
    }, [newsData]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const handleLogin = () => {
        setIsAuthenticated(true);
        setShowWelcomeScreen(true);
        setTimeout(() => {
            setShowWelcomeScreen(false);
        }, 2500);
    };
    const handleLogout = () => setIsAuthenticated(false);

    const addReport = (reportData: Omit<Report, 'id' | 'reportedBy' | 'timestamp'>) => {
        const newReport: Report = {
            ...reportData,
            id: new Date().toISOString() + Math.random(), // Add random number to ensure unique ID
            reportedBy: 'Alex Green', // Mock user
            timestamp: new Date().toISOString(),
        };
        setReports(prev => [...prev, newReport]);
    };
    
    const updateReport = (updatedReport: Report) => {
        setReports(prevReports => 
            prevReports.map(report => 
                report.id === updatedReport.id ? updatedReport : report
            )
        );
    };

    const addNewsArticle = (articleData: Omit<NewsArticle, 'id' | 'date'>) => {
        const newArticle: NewsArticle = {
            ...articleData,
            id: Date.now(),
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
        };
        setNewsData(prev => [newArticle, ...prev]);
    };

    if (!isAuthenticated) {
        return <LoginPage onLogin={handleLogin} />;
    }

    const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

    return (
        <>
            <AnimatePresence>
                {showWelcomeScreen && <WelcomeScreen username="Alex Green" />}
            </AnimatePresence>
            <div className={`flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden transition-filter duration-500 ${showWelcomeScreen ? 'filter blur-sm' : ''}`}>
                <Sidebar onLogout={handleLogout} toggleTheme={toggleTheme} currentTheme={theme} />
                <main className={`flex-1 ${isDashboard ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                    <AnimatePresence mode="wait">
                        <Routes location={location} key={location.pathname}>
                            <Route path="/dashboard" element={<DashboardPage reports={reports} addReport={addReport} updateReport={updateReport} theme={theme} />} />
                            <Route path="/reports" element={<ReportsPage reports={reports} />} />
                            <Route path="/analysis" element={<AnalysisPage reports={reports} />} />
                            <Route path="/community" element={<CommunityPage />} />
                            <Route path="/news" element={<NewsPage newsData={newsData} addNewsArticle={addNewsArticle} />} />
                            <Route path="/profile" element={<ProfilePage reports={reports}/>} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/feedback" element={<FeedbackPage />} />
                            <Route path="*" element={<Navigate to="/dashboard" />} />
                        </Routes>
                    </AnimatePresence>
                </main>
                <Chatbot />
            </div>
        </>
    );
};

const RootApp: React.FC = () => (
    <HashRouter>
        <App />
    </HashRouter>
);

export default RootApp;
