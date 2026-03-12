/**
 * API Configuration
 * 
 * This file centralizes all API-related configuration.
 * The base URL is determined by the environment variable REACT_APP_BASE_URL.
 * 
 * In production (Vercel), set: REACT_APP_BASE_URL=https://college-project-management.onrender.com
 * In development, it defaults to: http://localhost:5000
 */

export const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:5000";

// Axios default configuration
export const axiosConfig = {
    headers: { 
        'Content-Type': 'application/json' 
    },
    timeout: 30000, // 30 second timeout (helps with Render cold starts)
};

// Debug: Log the API URL in development
if (process.env.NODE_ENV === 'development') {
    console.log('API Base URL:', API_BASE_URL);
}

export default API_BASE_URL;
