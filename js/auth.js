// auth.js - Authentication & User Database Management

const DB_PREFIX = 'vibe_db_';
const USERS_KEY = 'vibe_users';
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
        dbKey: DB_PREFIX + username, // Their private "database" key
        joined: new Date().toISOString()
    };

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Initialize their private DB
    localStorage.setItem(users[username].dbKey, JSON.stringify({
        settings: {
            theme: 'light',
            notifications: true,
            publicProfile: true
        },
        savedArtists: []
    }));

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

// Logout
function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = 'index.html';
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
