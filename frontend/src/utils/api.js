import axios from 'axios';

export const API_BASE_URL = (process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || '').replace(/\/+$/, '');

export const getApiUrl = (path = '') => {
    if (!path) return API_BASE_URL;
    if (/^https?:\/\//i.test(path)) return path;

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${normalizedPath}`;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getApiErrorMessage = (error, fallback = 'Request failed') => {
    return error?.response?.data?.message || error?.message || fallback;
};

axios.defaults.baseURL = API_BASE_URL || undefined;
axios.defaults.timeout = 15000;

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');

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

export default axios;