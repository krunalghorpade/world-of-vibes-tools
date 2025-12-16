// auth.js - Authentication & User Database Management

const DB_PREFIX = 'vibe_db_';
const USERS_KEY = 'users'; // Centralized Users DB
const CURRENT_USER_KEY = 'vibe_current_user';

// Helper to get all users
function getUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
}

// Signup
function signup(username, password, email) {
    const users = getUsers();
    if (users[username]) {
        return { success: false, message: 'Username already exists' };
    }

    // Create new user entry
    users[username] = {
        username,
        password, // In a real app, hash this!
        email,
        artistId: null, // Will link to artist profile later
        joined: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Auto login
    login(username, password);

    return { success: true };
}

// Login
function login(username, password) {
    const users = getUsers();
    const user = users[username];

    if (user && user.password === password) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        return { success: true, user };
    }
    return { success: false, message: 'Invalid credentials' };
}

// Login with Google (Mock)
function loginWithGoogle() {
    // Simulate a successful Google login
    const googleUser = {
        username: 'google_user_' + Date.now(),
        email: 'user@gmail.com',
        artistId: null,
        joined: new Date().toISOString(),
        isGoogle: true
    };

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(googleUser));
    return { success: true, user: googleUser };
}

// Reset Password (Mock)
function resetPassword(email) {
    const users = getUsers();
    // In a real app, strict checking. Here, just pretend.
    return { success: true, message: `Password reset link sent to ${email}` };
}

// Logout
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    const inPages = window.location.pathname.includes('/pages/');
    window.location.href = inPages ? '../index.html' : 'index.html';
}

// Get Current User
function getCurrentUser() {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
}

// Get User's Private Data
function getUserData() {
    const user = getCurrentUser();
    if (!user) return null;
    const data = localStorage.getItem(user.dbKey);
    return data ? JSON.parse(data) : null;
}

// Update User's Private Data
function updateUserData(newData) {
    const user = getCurrentUser();
    if (!user) return false;
    const currentData = getUserData() || {};
    const updated = { ...currentData, ...newData };
    localStorage.setItem(user.dbKey, JSON.stringify(updated));
    return true;
}
