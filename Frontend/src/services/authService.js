import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = '/api/auth';

const register = (fullName, username, email, designation, password) => {
    return axios.post(`${API_URL}/register`, {
        full_name: fullName,
        username,
        email,
        designation,
        password,
    });
};

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, {
        email,
        password,
    });
    if (response.data.token) {
        localStorage.setItem('user_token', response.data.token);
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user_token');
};

// Enhanced token validation
const getCurrentToken = () => {
    const token = localStorage.getItem('user_token');
    if (!token) return null;
    
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        // Check if token is expired
        if (decoded.exp < currentTime) {
            console.log('Token expired, clearing storage');
            logout(); // Clear expired token
            return null;
        }
        return token;
    } catch (error) {
        console.error("Invalid token:", error);
        logout(); // Clear invalid token
        return null;
    }
};

const getCurrentUser = () => {
    const token = getCurrentToken(); // This now checks expiry
    if (!token) {
        return null;
    }
    try {
        const decoded = jwtDecode(token);
        return decoded;
    } catch (error) {
        console.error("Invalid token:", error);
        logout();
        return null;
    }
};

const authService = {
    register,
    login,
    logout,
    getCurrentToken,
    getCurrentUser,
};

export default authService;