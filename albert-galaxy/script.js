// ============== STAR GALAXY CONFIGURATION ==============
// Optional configuration file for easy customization
// Include this file BEFORE script.js if you want to use custom settings

window.GALAXY_CONFIG = {
    // ============== SUPABASE DATABASE SETTINGS ==============
    // Replace with your Supabase credentials
    supabase: {
        url: 'https://kncwqtqmbyukguuargsg.supabase.co',
        key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY3dxdHFtYnl1a2d1dWFyZ3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDQ4MDUsImV4cCI6MjA2NTMyMDgwNX0.WvxeazNz2y-F57JE0fvT4XVXkEMZQ-R_sviYaSrRuNg'
    },

    // ============== BLACK HOLE EFFECT SETTINGS ==============
    blackHole: {
        // Background image for the black hole effect
        backgroundImage: 'background.jpg',
        
        // Mass affects the warping intensity (higher = more warping)
        mass: 1500,
        
        // Auto-movement when mouse isn't moved
        autoMove: true
    },

    // ============== STAR SETTINGS ==============
    stars: {
        // Default star that's always present
        defaultStar: {
            name: "PointZero",
            color: "#ff6b6b",
            position: { x: 0, y: 0, z: 0 }
        },
        
        // Star generation settings
        generation: {
            minRadius: 10,      // Minimum distance from center
            maxRadius: 50,      // Maximum distance from center
        },
        
        // Star appearance
        appearance: {
            coreSize: 0.5,          // Main star size
            glowSizes: [1.2, 2, 3.5], // Glow layer sizes
            glowOpacities: [0.6, 0.3, 0.1], // Glow layer opacities
        },
        
        // Animation speeds
        animation: {
            rotation: 0.01,         // Star rotation speed
            glowRotation: 0.002,    // Glow rotation speed
            pulseSpeed: 0.1         // Glow pulsing speed
        }
    },

    // ============== CAMERA SETTINGS ==============
    camera: {
        initialDistance: 50,        // Starting zoom level
        minDistance: 5,             // Closest zoom
        maxDistance: 200,           // Furthest zoom
        rotationSpeed: 0.005,       // Mouse drag sensitivity
        focusAnimationDuration: 2000 // Focus transition time (ms)
    },

    // ============== BACKGROUND STARS ==============
    backgroundStars: {
        count: 1000,               // Number of background stars
        size: 0.5,                 // Star point size
        opacity: 0.6,              // Star brightness
        spread: 2000               // How far they spread
    },

    // ============== UI SETTINGS ==============
    ui: {
        // Modal settings
        showWelcomeModal: true,         // Show welcome modal for new users
        modalDelay: 500,                // Delay before showing modal (ms)
        
        // User input limits
        maxNameLength: 20,              // Maximum star name length
        
        // Search settings
        minSearchLength: 2,             // Minimum characters to start search
        maxSearchResults: 10            // Maximum search results shown
    },

    // ============== ADVANCED SETTINGS ==============
    advanced: {
        // Enable debug logging
        debug: false,
        
        // Fallback mode settings
        offlineStorageKey: 'galaxy_stars',
        userStoragePrefix: 'galaxy_user_',
        
        // Performance settings
        enableFog: true,                // Scene fog effect
        antialias: true,                // Renderer antialiasing
        
        // Animation frame rate (null = browser default)
        targetFPS: null
    }
};

// ============== EASY CUSTOMIZATION FUNCTIONS ==============

// Quick theme presets
window.GALAXY_THEMES = {
    classic: {
        backgroundColor: '#000011',
        starColors: ['#ffffff', '#ffdddd', '#ddddff', '#ddffdd'],
        uiColor: '#4da6ff'
    },
    
    warm: {
        backgroundColor: '#1a0f0a',
        starColors: ['#ffaa44', '#ff6644', '#ffdd88', '#ff8866'],
        uiColor: '#ff8844'
    },
    
    cool: {
        backgroundColor: '#0a0f1a', 
        starColors: ['#44aaff', '#6644ff', '#88ddff', '#6688ff'],
        uiColor: '#44aaff'
    },
    
    neon: {
        backgroundColor: '#0d0d0d',
        starColors: ['#ff00ff', '#00ffff', '#ff4400', '#44ff00'],
        uiColor: '#ff00aa'
    }
};

// Apply a theme (call this in console or add to script.js)
window.applyTheme = function(themeName) {
    const theme = window.GALAXY_THEMES[themeName];
    if (!theme) {
        console.error('Theme not found:', themeName);
        return;
    }
    
    document.documentElement.style.setProperty('--bg-color', theme.backgroundColor);
    document.documentElement.style.setProperty('--ui-color', theme.uiColor);
    console.log('Applied theme:', themeName);
};

// ============== USAGE INSTRUCTIONS ==============
/*
To use this config file:

1. Include it in your HTML BEFORE script.js:
   <script src="config.js"></script>
   <script src="script.js"></script>

2. Modify the settings above to customize your galaxy

3. The main script.js will automatically use these settings if available

4. You can also apply themes by calling:
   applyTheme('warm') // or 'cool', 'neon', 'classic'

Common customizations:
- Change supabase.url and supabase.key to your own database
- Adjust blackHole.mass for different warping effects
- Modify stars.generation.minRadius/maxRadius for star placement
- Change backgroundStars.count for more/fewer background stars
- Set advanced.debug to true for development logging
*/