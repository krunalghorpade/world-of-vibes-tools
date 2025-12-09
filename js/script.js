// script.js – VibeCollab client‑side logic
// --------------------------------------------------

const form = document.getElementById('artist-form');
const artistListEl = document.getElementById('artist-list');
const feedTitle = document.getElementById('feed-title');
const filterSpans = document.querySelectorAll('.filter-toggles span');

// ------------------------------------------------------------------
// Theme / Dark Mode Logic
// ------------------------------------------------------------------
function initTheme() {
    const moonIcon = document.querySelector('.moon-icon');

    // Check saved preference or user data
    // Default to 'dark' if nothing is saved
    const saved = localStorage.getItem('vibe_theme');
    let isLight = -1; // -1 means check auth

    if (saved) {
        isLight = (saved === 'light');
    }

    // If logged in, prioritize user setting
    if (typeof getUserData === 'function') {
        const uData = getUserData();
        if (uData && uData.settings && uData.settings.theme) {
            isLight = (uData.settings.theme === 'light');
        }
    }

    // Fallback: Default Mode is DARK, so isLight implies adding class
    // If isLight is still -1 (no saved, no auth), default to false (Dark)
    if (isLight === -1) isLight = false;

    if (isLight) {
        document.body.classList.add('light-mode');
        if (moonIcon) moonIcon.textContent = '☾'; // Moon needed to go back to dark
    } else {
        document.body.classList.remove('light-mode');
        if (moonIcon) moonIcon.textContent = '☀'; // Sun indicates we are in dark mode (click for light) 
        // Wait, usually icon represents current state or target state?
        // If Dark Mode, icon usually Sun (to switch to light) or Moon (representing Night).
        // Original code: moon textContent toggles.
        // Let's stick: Dark Mode = ☀ (Sun to switch to light), Light Mode = ☾ (Moon to switch to dark)
    }

    if (moonIcon) {
        moonIcon.addEventListener('click', () => {
            const isLightMode = document.body.classList.toggle('light-mode');
            const theme = isLightMode ? 'light' : 'dark';

            // Save global preference
            localStorage.setItem('vibe_theme', theme);

            // Update icon
            moonIcon.textContent = isLightMode ? '☾' : '☀';

            // If logged in, save to their DB
            if (typeof updateUserData === 'function' && getCurrentUser()) {
                const data = getUserData();
                if (data) {
                    data.settings.theme = theme;
                    updateUserData(data);
                }
            }
        });
    }
}

// ------------------------------------------------------------------
// Auth UI Header Logic
// ------------------------------------------------------------------
function updateNavForAuth() {
    if (typeof getCurrentUser !== 'function') return;

    // We target #auth-links container now
    const authContainer = document.getElementById('auth-links');

    if (!authContainer) return;

    const user = getCurrentUser();

    if (user) {
        // User is logged in
        authContainer.innerHTML = `
            <a href="#">Welcome, ${user.username}</a>
            <a href="pages/settings.html">SETTINGS</a>
            <a href="#" id="logout-btn">LOGOUT</a>
        `;

        // Settings link might need adjustment if we are ALREADY in pages/
        // Simple fix: check current path or use absolute/relative logic. 
        // For simplicity: We assume relative from root. If in pages/, these links break?
        // Actually, the structure uses absolute "pages/..." or "../index".
        // Let's make paths robust.

    } else {
        // Guest - Check if we are in root or pages/ to set correct links
        const inPages = window.location.pathname.includes('/pages/');
        const prefix = inPages ? '' : 'pages/';

        authContainer.innerHTML = `
            <a href="${prefix}signup.html" id="create-profile-link">JOIN US</a>
            <a href="#">SEARCH</a>
            <a href="${prefix}login.html">LOGIN</a>
        `;
    }

    // Attach listener if button exists
    const btn = document.getElementById('logout-btn');
    if (btn) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout(); // from auth.js
        });
    }
}


// ------------------------------------------------------------------
// Mock Initial Data (so the grid isn't empty)
const MOCK_DATA = [
    { id: 'm1', name: 'NEON WAVE', wants: ['Vocals', 'Bass'], skills: ['Synth', 'Production'], image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1000&auto=format&fit=crop' },
    { id: 'm2', name: 'LUNA ECHO', wants: ['Guitar', 'Drums'], skills: ['Vocals', 'Songwriting'], image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop' },
    { id: 'm3', name: 'VOID WALKER', wants: ['Mixing', 'Mastering'], skills: ['Sound Design', 'Foley'], image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop' },
    { id: 'm4', name: 'ASTRAL BEAT', wants: ['Rapper', 'Feature'], skills: ['Beatmaking', 'Keys'], image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop' },
    { id: 'm5', name: 'SOLAR FLARE', wants: ['Video Editor', 'VFX'], skills: ['Rap', 'Performance'], image: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop' },
    { id: 'm6', name: 'ECHO CHAMBER', wants: ['Collab', 'Remix'], skills: ['Ambient', 'Drone'], image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop' },
];

// Initialize storage with mock data if empty
if (!localStorage.getItem('vibeArtists')) {
    localStorage.setItem('vibeArtists', JSON.stringify(MOCK_DATA));
}

// ------------------------------------------------------------------
// Helper: read all stored profiles
function getAllArtists() {
    const data = localStorage.getItem('vibeArtists');
    return data ? JSON.parse(data) : [];
}

// Helper: write
function setAllArtists(arr) {
    localStorage.setItem('vibeArtists', JSON.stringify(arr));
}

// ------------------------------------------------------------------
// Render Logic
let currentFilter = 'all'; // all, needs, offers

function renderArtists(filterType = 'all') {
    if (!artistListEl) return;

    const artists = getAllArtists();
    artistListEl.innerHTML = '';

    // Apply visual filter state
    filterSpans.forEach(span => span.classList.remove('active'));

    artists.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'artist-card';

        // Note: usage of different unsplash source for variety
        const imgUrl = artist.image || `https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80&sig=${artist.id}`;

        const wantsStr = Array.isArray(artist.wants) ? artist.wants.join(', ') : artist.wants;
        const skillsStr = Array.isArray(artist.skills) ? artist.skills.join(', ') : artist.skills;

        card.innerHTML = `
      <div class="card-image-placeholder">
         <img src="${imgUrl}" alt="${artist.name}" loading="lazy" />
      </div>
      <div class="card-details">
        <h3>${artist.name}</h3>
        <p><strong>NEEDS:</strong> ${wantsStr}</p>
        <p><strong>OFFERS:</strong> ${skillsStr}</p>
      </div>
    `;

        artistListEl.appendChild(card);
    });
}

// ------------------------------------------------------------------
// Filter Toggle
window.filterBy = function (type) {
    currentFilter = type;

    // Update UI headers
    const spanText = (type === 'wants' || type === 'needs') ? 'SEEKING'
        : (type === 'skills' || type === 'offers') ? 'OFFERING'
            : 'ALL';

    filterSpans.forEach(s => {
        s.classList.remove('active');
        if (s.innerText === spanText) s.classList.add('active');
    });

    if (type === 'wants' || type === 'needs') {
        feedTitle.innerText = 'Artists Looking for Talent';
    } else if (type === 'skills' || type === 'offers') {
        feedTitle.innerText = 'Artists Offering Skills';
    } else {
        feedTitle.innerText = 'Latest Profiles';
    }

    renderArtists(type);
}

// ------------------------------------------------------------------
// Form Submission
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const name = form.name.value.trim();
        const wants = form.wants.value.split(',').map(v => v.trim()).filter(Boolean);
        const skills = form.skills.value.split(',').map(v => v.trim()).filter(Boolean);

        if (!name || wants.length === 0 || skills.length === 0) {
            alert('Please fill out all fields.');
            return;
        }

        const id = Date.now().toString();
        // Random fashion/music image for new profile
        const image = `https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=500&q=80&sig=${id}`;

        const newArtist = { id, name, wants, skills, image };

        const all = getAllArtists();
        all.unshift(newArtist); // Add to top
        setAllArtists(all);

        form.reset();
        renderArtists(currentFilter);

        // Scroll to grid
        artistListEl.scrollIntoView({ behavior: 'smooth' });
    });
}

// ------------------------------------------------------------------
// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();      // Initialize Dark Mode
    updateNavForAuth(); // Update Header based on Auth
    renderArtists();  // Render Grid
});
