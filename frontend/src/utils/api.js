import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || 'http://localhost:5000').replace(/\/+$/, '');
console.log("Global API_BASE_URL:", API_BASE_URL);

export const getApiUrl = (path = '') => {
    if (!path) return API_BASE_URL;
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
    if (error?.response?.status === 401) {
        return "Unauthorized - Please login again";
    }
    if (error?.message === "Network Error") {
        return "Network Error - Please check your connection or CORS configuration";
    }
    return error?.response?.data?.message || error?.message || fallback;
};

axios.defaults.baseURL = API_BASE_URL || undefined;
axios.defaults.timeout = 15000;

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (token) {
            config.headers = config.headers || {};
            if (!config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

axios.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/choose'; // Redirect to login choice
        }
        return Promise.reject(error);
    }
);

export default axios;