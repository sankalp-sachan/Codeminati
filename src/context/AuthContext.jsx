import { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                client.defaults.headers.authorization = `Bearer ${token}`;
                try {
                    const { data } = await client.get('/auth/profile');
                    setUser({ ...data, token });
                } catch (error) {
                    console.error(error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await client.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            client.defaults.headers.authorization = `Bearer ${data.token}`;
            setUser(data);
            toast.success('Logged in successfully!');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const googleLogin = async (token) => {
        try {
            const { data } = await client.post('/auth/google', { token });
            localStorage.setItem('token', data.token);
            client.defaults.headers.authorization = `Bearer ${data.token}`;
            setUser(data);
            toast.success('Google Login successful!');
            return true;
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Google Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await client.post('/auth/register', userData);
            localStorage.setItem('token', data.token);
            client.defaults.headers.authorization = `Bearer ${data.token}`;
            setUser(data);
            toast.success('Registration successful! Logging you in...');
            return true;
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        delete client.defaults.headers.authorization;
        setUser(null);
        toast.success('Logged out');
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser, googleLogin }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
