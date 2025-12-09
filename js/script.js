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
    const inPages = window.location.pathname.includes('/pages/');
    // If in pages, go up one level for index, stay same for siblings
    // But structure is index vs pages/file.
    // Links we need: Settings (pages/), Create (pages/), Logout (js), Welcome (void)

    // Prefix for links TO pages/ from...
    // If in root: prefix = 'pages/'
    // If in pages: prefix = ''
    const pagesPrefix = inPages ? '' : 'pages/';

    if (user) {
        // User is logged in
        let profileLink = '#';
        const userData = getUserData();
        if (userData && userData.artistId) {
            profileLink = `${pagesPrefix}profile.html?id=${userData.artistId}`;
        }

        authContainer.innerHTML = `
            <a href="${pagesPrefix}create_profile.html" style="color:var(--neon-green);">+ CREATE</a>
            <a href="${profileLink}">HI, ${user.username.toUpperCase()}</a>
            <a href="${pagesPrefix}settings.html">SETTINGS</a>
            <a href="#" id="logout-btn">LOGOUT</a>
        `;

    } else {
        // Guest
        authContainer.innerHTML = `
            <a href="${pagesPrefix}signup.html" id="create-profile-link">JOIN US</a>
            <a href="#">SEARCH</a>
            <a href="${pagesPrefix}login.html">LOGIN</a>
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
    {
        id: 'm1',
        name: 'NEON WAVE',
        wants: ['Vocals', 'Bass'],
        skills: ['Synth', 'Production'],
        image: 'https://images.unsplash.com/photo-1542596594-649edbc13630?q=80&w=1000&auto=format&fit=crop',
        bio: 'We are a synth-pop duo inspired by the 80s and the future. Currently recording our debut album.',
        socials: { instagram: '@neonwave', soundcloud: 'neonwave' }
    },
    {
        id: 'm2',
        name: 'LUNA ECHO',
        wants: ['Guitar', 'Drums'],
        skills: ['Vocals', 'Songwriting'],
        image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=1000&auto=format&fit=crop',
        bio: 'Singer-songwriter looking to form a full band. Influences include Phoebe Bridgers and heavy reverb.',
        socials: { instagram: '@lunaecho', spotify: 'Luna Echo' }
    },
    {
        id: 'm3',
        name: 'VOID WALKER',
        wants: ['Mixing', 'Mastering'],
        skills: ['Sound Design', 'Foley'],
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
        bio: 'Sound designer for games and film. Exploring dark ambient textures.',
        socials: { twitter: '@voidwalker_audio' }
    },
    {
        id: 'm4',
        name: 'ASTRAL BEAT',
        wants: ['Rapper', 'Feature'],
        skills: ['Beatmaking', 'Keys'],
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop',
        bio: 'Hip hop producer looking for unique flows.',
        socials: { soundcloud: 'astralbeat' }
    },
    {
        id: 'm5',
        name: 'SOLAR FLARE',
        wants: ['Video Editor', 'VFX'],
        skills: ['Rap', 'Performance'],
        image: 'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?q=80&w=1000&auto=format&fit=crop',
        bio: 'High energy performer. Need visuals that match the intensity.',
        socials: { instagram: '@solarflare_official' }
    },
    {
        id: 'm6',
        name: 'ECHO CHAMBER',
        wants: ['Collab', 'Remix'],
        skills: ['Ambient', 'Drone'],
        image: 'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?q=80&w=1000&auto=format&fit=crop',
        bio: 'Creating spaces with sound. Open to experimental collaborations.',
        socials: { bandcamp: 'echochamber.bandcamp.com' }
    },
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

// Helper: One artist
function getArtistById(id) {
    const all = getAllArtists();
    return all.find(a => a.id === id);
}

// Helper: write
function setAllArtists(arr) {
    localStorage.setItem('vibeArtists', JSON.stringify(arr));
}

// ------------------------------------------------------------------
// Render Logic
let currentFilter = 'all'; // all, needs (wants), offers (skills)

function renderArtists(filterType = 'all') {
    if (!artistListEl) return;

    const artists = getAllArtists();
    artistListEl.innerHTML = '';

    // Apply visual filter state
    filterSpans.forEach(span => span.classList.remove('active'));

    artists.forEach(artist => {
        const card = document.createElement('div');
        card.className = 'artist-card';
        card.style.cursor = 'pointer';

        // Setup link to profile
        card.onclick = () => {
            // Determine if we are in pages/ or root to set correct path
            const inPages = window.location.pathname.includes('/pages/');
            const prefix = inPages ? '' : 'pages/';
            window.location.href = `${prefix}profile.html?id=${artist.id}`;
        };

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
    if (feedTitle) {
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

        // Link this profile creation to the currently logged in user if applicable
        // But for now, just standard creation. We might want to save it to User DB too?
        // Simplicity: Just add to public feed.

        const newArtist = {
            id,
            name,
            wants,
            skills,
            image,
            bio: 'Just joined the Vibe Collab network!',
            socials: {}
        };

        const all = getAllArtists();
        all.unshift(newArtist); // Add to top
        setAllArtists(all);

        // If user is logged in, link this artist ID to their user profile so they can edit it later "My Profile"
        if (typeof getCurrentUser === 'function') {
            const user = getCurrentUser();
            if (user) {
                // We need to save this ID to the user's private data
                const uData = getUserData(); // gets data using auth keys
                if (uData) {
                    uData.artistId = id; // Link artist profile to user
                    updateUserData(uData);
                }
            }
        }

        form.reset();

        // If we are on the main page, just re-render
        if (artistListEl) {
            renderArtists(currentFilter);
            artistListEl.scrollIntoView({ behavior: 'smooth' });
        } else {
            // We are likely on create_profile.html, redirect to feed
            alert('Profile Created!');
            // Determine path to index
            const inPages = window.location.pathname.includes('/pages/');
            window.location.href = inPages ? '../index.html' : 'index.html';
        }
    });
}

// ------------------------------------------------------------------
// Carousel Logic
function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 5000); // 5 seconds
}

// ------------------------------------------------------------------
// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();      // Initialize Dark Mode
    updateNavForAuth(); // Update Header based on Auth
    renderArtists();  // Render Grid
    initCarousel();   // Start Carousel
});
