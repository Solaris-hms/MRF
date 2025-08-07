import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080/api/auth';

// Register a new user with all fields
const register = (fullName, username, email, designation, password) => {
    return axios.post(`${API_URL}/register`, {
        full_name: fullName,
        username,
        email,
        designation,
        password,
    });
};

// Log in a user
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

// Log out a user
const logout = () => {
    localStorage.removeItem('user_token');
};

// Get the current user's token
const getCurrentToken = () => {
    return localStorage.getItem('user_token');
};

// Get user data from token
const getCurrentUser = () => {
    const token = getCurrentToken();
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