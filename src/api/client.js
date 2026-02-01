import axios from 'axios';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://codeminati-backend.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default client;
