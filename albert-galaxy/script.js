// ============== BLACK HOLE SHADER CONFIGURATION ==============
var bgUrl = 'background.jpg'; // Use local background image
var blackholeMass = 1500;
var curblackholeMass = 0;
var blackholeCanvas, blackholeGl; // canvas and webgl context for black hole
var shaderScript;
var shaderSource;
var vertexShader, fragmentShader;
var buffer;
var locationOfTime, locationOfResolution, locationOfMouse, locationOfMass, locationOfclickedTime;
var originY = window.innerHeight, originX = window.innerWidth;
var blackholeMouse;
var startTime = new Date().getTime();
var currentTime = 0;
// Removed click-related variables since we don't want the zoom effect

// ============== SUPABASE CONFIGURATION ==============
const SUPABASE_URL = 'https://kncwqtqmbyukguuargsg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtuY3dxdHFtYnl1a2d1dWFyZ3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NDQ4MDUsImV4cCI6MjA2NTMyMDgwNX0.WvxeazNz2y-F57JE0fvT4XVXkEMZQ-R_sviYaSrRuNg';

// Initialize Supabase client
let supabaseClient = null;
let isOnlineMode = false;

// Try to initialize Supabase
try {
    // Check if Supabase library loaded correctly from CDN
    if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        const { createClient } = window.supabase;
        supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        isOnlineMode = true;
        console.log('🟢 Online mode: Connected to Supabase');
        console.log('Database URL:', SUPABASE_URL);
    } else {
        throw new Error('Supabase library not found - make sure CDN loaded');
    }
} catch (error) {
    console.log('🟡 Offline mode: Supabase connection failed', error);
    console.log('Make sure Supabase library is loaded correctly');
    isOnlineMode = false;
}

function updateConnectionStatus() {
    const statusElement = document.getElementById('connection-status');
    if (isOnlineMode) {
        statusElement.innerHTML = '🟢 Online (Database)';
        statusElement.style.color = '#4da6ff';
    } else {
        statusElement.innerHTML = '🟡 Offline (Local)';
        statusElement.style.color = '#f9ca24';
    }
}

// ============== DATA MANAGEMENT ==============
let galaxyData = {
    stars: [],
    visitCount: 0
};

// Three.js setup
let scene, camera, renderer;
let starMeshes = [];
let selectedStar = null;

// Camera control variables
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let cameraDistance = 50;
let cameraRotation = { x: 0, y: 0 };
let focusTarget = new THREE.Vector3(0, 0, 0);
const rotationSpeed = 0.005;

// User identification
let currentUser = null;

// ============== BLACK HOLE SHADER FUNCTIONS ==============

function initBlackHole(image) {
    blackholeCanvas = document.getElementById('blackhole-canvas');
    blackholeGl = blackholeCanvas.getContext('webgl') || blackholeCanvas.getContext('experimental-webgl');
    
    // Make canvas fill the full window (not square!)
    blackholeCanvas.width = window.innerWidth;
    blackholeCanvas.height = window.innerHeight;
    
    // Set canvas style to cover full screen
    blackholeCanvas.style.width = window.innerWidth + 'px';
    blackholeCanvas.style.height = window.innerHeight + 'px';
    
    blackholeMouse = {x: window.innerWidth/2, y: window.innerHeight/2, moved: false};
    
    // Mouse events for black hole effect - REMOVED CLICK HANDLERS
    $(document).mousemove(function(e) {
        // Direct mouse coordinates (no transformation needed)
        blackholeMouse.x = e.pageX;
        blackholeMouse.y = e.pageY;
        blackholeMouse.moved = true;
    });

    // WebGL setup with correct viewport
    blackholeGl.viewport(0, 0, blackholeCanvas.width, blackholeCanvas.height);
    
    buffer = blackholeGl.createBuffer();
    blackholeGl.bindBuffer(blackholeGl.ARRAY_BUFFER, buffer);
    blackholeGl.bufferData(
        blackholeGl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0]),
        blackholeGl.STATIC_DRAW
    );

    // Create shaders
    shaderScript = document.getElementById("2d-vertex-shader");
    shaderSource = shaderScript.text;
    vertexShader = blackholeGl.createShader(blackholeGl.VERTEX_SHADER);
    blackholeGl.shaderSource(vertexShader, shaderSource);
    blackholeGl.compileShader(vertexShader);

    shaderScript = document.getElementById("2d-fragment-shader");
    shaderSource = shaderScript.text;
    fragmentShader = blackholeGl.createShader(blackholeGl.FRAGMENT_SHADER);
    blackholeGl.shaderSource(fragmentShader, shaderSource);
    blackholeGl.compileShader(fragmentShader);

    program = blackholeGl.createProgram();
    blackholeGl.attachShader(program, vertexShader);
    blackholeGl.attachShader(program, fragmentShader);
    blackholeGl.linkProgram(program);
    blackholeGl.useProgram(program);

    // Get uniform locations
    locationOfResolution = blackholeGl.getUniformLocation(program, "u_resolution");
    locationOfMouse = blackholeGl.getUniformLocation(program, "u_mouse");
    locationOfMass = blackholeGl.getUniformLocation(program, "u_mass");
    locationOfTime = blackholeGl.getUniformLocation(program, "u_time");
    locationOfclickedTime = blackholeGl.getUniformLocation(program, "u_clickedTime");

    // Set initial uniforms with correct resolution
    blackholeGl.uniform2f(locationOfResolution, blackholeCanvas.width, blackholeCanvas.height);
    blackholeGl.uniform2f(locationOfMouse, blackholeMouse.x, blackholeMouse.y);
    blackholeGl.uniform1f(locationOfMass, curblackholeMass*0.00001);
    blackholeGl.uniform1f(locationOfTime, currentTime);
    blackholeGl.uniform1f(locationOfclickedTime, 0); // Always 0 - no click effect

    // Texture setup
    var texCoordLocation = blackholeGl.getAttribLocation(program, "a_texCoord");
    var texCoordBuffer = blackholeGl.createBuffer();
    blackholeGl.bindBuffer(blackholeGl.ARRAY_BUFFER, texCoordBuffer);
    blackholeGl.bufferData(blackholeGl.ARRAY_BUFFER, new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0]),
        blackholeGl.STATIC_DRAW);
    blackholeGl.enableVertexAttribArray(texCoordLocation);
    blackholeGl.vertexAttribPointer(texCoordLocation, 2, blackholeGl.FLOAT, false, 0, 0);

    // Create texture
    var texture = blackholeGl.createTexture();
    blackholeGl.bindTexture(blackholeGl.TEXTURE_2D, texture);
    blackholeGl.texParameteri(blackholeGl.TEXTURE_2D, blackholeGl.TEXTURE_WRAP_S, blackholeGl.CLAMP_TO_EDGE);
    blackholeGl.texParameteri(blackholeGl.TEXTURE_2D, blackholeGl.TEXTURE_WRAP_T, blackholeGl.CLAMP_TO_EDGE);
    blackholeGl.texParameteri(blackholeGl.TEXTURE_2D, blackholeGl.TEXTURE_MIN_FILTER, blackholeGl.NEAREST);
    blackholeGl.texParameteri(blackholeGl.TEXTURE_2D, blackholeGl.TEXTURE_MAG_FILTER, blackholeGl.NEAREST);
    blackholeGl.texImage2D(blackholeGl.TEXTURE_2D, 0, blackholeGl.RGBA, blackholeGl.RGBA, blackholeGl.UNSIGNED_BYTE, image);

    renderBlackHole();
}

function renderBlackHole() {
    var now = new Date().getTime();
    currentTime = (now - startTime) / 1000;
    
    if(curblackholeMass < blackholeMass - 50){
        curblackholeMass += (blackholeMass-curblackholeMass) * 0.03;
    }
    
    // REMOVED CLICK EFFECT LOGIC - no more clickedTime manipulation
    
    // Auto-movement when mouse hasn't moved (fixed coordinates)
    if(blackholeMouse.moved == false){
        blackholeMouse.x = (window.innerWidth/2) + Math.sin(currentTime * 0.6) * (window.innerWidth * 0.35);
        blackholeMouse.y = (window.innerHeight/2) + Math.sin(currentTime * 0.7) * (window.innerHeight * 0.25);
    }

    blackholeGl.uniform1f(locationOfMass, curblackholeMass*0.00001);
    blackholeGl.uniform2f(locationOfMouse, blackholeMouse.x, blackholeMouse.y);
    blackholeGl.uniform1f(locationOfTime, currentTime);
    blackholeGl.uniform1f(locationOfclickedTime, 0); // Always 0 - no click effect

    window.requestAnimationFrame(renderBlackHole, blackholeCanvas);
    
    positionLocation = blackholeGl.getAttribLocation(program, "a_position");
    blackholeGl.enableVertexAttribArray(positionLocation);
    blackholeGl.vertexAttribPointer(positionLocation, 2, blackholeGl.FLOAT, false, 0, 0);
    blackholeGl.drawArrays(blackholeGl.TRIANGLES, 0, 6);
}

// ============== DATABASE FUNCTIONS ==============

async function checkExistingUser() {
    const fingerprint = await generateUserFingerprint();
    
    if (isOnlineMode) {
        try {
            const { data, error } = await supabaseClient
                .from('galaxy_users')
                .select('*')
                .eq('fingerprint', fingerprint)
                .single();
            
            if (data && !error) {
                currentUser = data;
                return true;
            }
        } catch (error) {
            console.log('User not found in database');
        }
    } else {
        // Offline mode: check localStorage
        const existingUser = localStorage.getItem('galaxy_user_' + fingerprint);
        if (existingUser) {
            currentUser = JSON.parse(existingUser);
            return true;
        }
    }
    
    return false;
}

async function generateUserFingerprint() {
    // Create a semi-unique fingerprint based on browser/device characteristics
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Browser fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString();
}

async function saveUser(userData) {
    const fingerprint = await generateUserFingerprint();
    const userRecord = {
        fingerprint: fingerprint,
        name: userData.name,
        created_at: new Date().toISOString()
    };

    if (isOnlineMode) {
        try {
            const { data, error } = await supabaseClient
                .from('galaxy_users')
                .insert([userRecord])
                .select()
                .single();
            
            if (!error) {
                currentUser = data;
                return true;
            }
        } catch (error) {
            console.error('Error saving user:', error);
        }
    } else {
        // Offline mode: save to localStorage
        localStorage.setItem('galaxy_user_' + fingerprint, JSON.stringify(userRecord));
        currentUser = userRecord;
        return true;
    }
    
    return false;
}

async function loadAllStars() {
    if (isOnlineMode) {
        try {
            console.log('🔄 Loading stars from database...');
            const { data, error } = await supabaseClient
                .from('galaxy_stars')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) {
                console.error('❌ Database error:', error);
                console.log('💡 Make sure you created the database tables! Check the setup instructions.');
                // Switch to offline mode due to database issues
                isOnlineMode = false;
                updateConnectionStatus();
                // Fall back to default star
                return [{ name: "PointZero", color: "#ff6b6b", position: { x: 0, y: 0, z: 0 }, timestamp: new Date().toISOString() }];
            }
            
            if (data) {
                console.log(`✅ Loaded ${data.length} stars from database`);
                return data.map(star => ({
                    id: star.id,
                    name: star.name,
                    color: star.color,
                    position: star.position,
                    timestamp: star.created_at
                }));
            }
        } catch (error) {
            console.error('❌ Error loading stars:', error);
            console.log('💡 This might mean the database tables don\'t exist yet. Check the setup instructions.');
            // Switch to offline mode due to connection issues
            isOnlineMode = false;
            updateConnectionStatus();
        }
    } else {
        // Offline mode: load from localStorage
        const starsData = localStorage.getItem('galaxy_stars');
        if (starsData) {
            return JSON.parse(starsData);
        }
    }
    
    // Return default star if no data available
    return [{ name: "PointZero", color: "#ff6b6b", position: { x: 0, y: 0, z: 0 }, timestamp: new Date().toISOString() }];
}

async function saveStar(starData) {
    if (isOnlineMode) {
        try {
            console.log('💾 Saving star to database:', starData.name);
            const { data, error } = await supabaseClient
                .from('galaxy_stars')
                .insert([{
                    name: starData.name,
                    color: starData.color,
                    position: starData.position,
                    created_at: starData.timestamp
                }])
                .select()
                .single();
            
            if (error) {
                console.error('❌ Error saving star:', error);
                console.log('💡 Make sure you created the database tables and set up the policies!');
                // Switch to offline mode and try saving locally
                isOnlineMode = false;
                updateConnectionStatus();
                return await saveStar(starData); // Retry in offline mode
            }
            
            if (data) {
                console.log('✅ Star saved successfully!');
                return { ...starData, id: data.id };
            }
        } catch (error) {
            console.error('❌ Database connection error:', error);
            // Switch to offline mode and try saving locally
            isOnlineMode = false;
            updateConnectionStatus();
            return await saveStar(starData); // Retry in offline mode
        }
    } else {
        // Offline mode: save to localStorage
        const existingStars = JSON.parse(localStorage.getItem('galaxy_stars') || '[]');
        const newStar = { ...starData, id: Date.now() };
        existingStars.push(newStar);
        localStorage.setItem('galaxy_stars', JSON.stringify(existingStars));
        console.log('💾 Star saved to localStorage (offline mode)');
        return newStar;
    }
    
    return null;
}

// ============== INITIALIZATION ==============

async function init() {
    document.getElementById('loading').style.display = 'block';
    
    // Update connection status display
    updateConnectionStatus();
    
    // Initialize black hole background first
    var image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = bgUrl;
    image.onload = function() {
        initBlackHole(image);
    }
    
    // Check if user already exists
    const userExists = await checkExistingUser();
    
    // Load existing stars from database
    const stars = await loadAllStars();
    galaxyData.stars = stars;
    galaxyData.visitCount = stars.length;
    
    // Initialize 3D scene
    initThreeJS();
    
    // Load stars into scene
    stars.forEach(star => createStarMesh(star));
    updateCounters();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start animation loop
    animate();
    
    // Hide loading
    document.getElementById('loading').style.display = 'none';
    
    // Show welcome modal only if user doesn't exist
    if (!userExists) {
        setTimeout(() => {
            document.getElementById('welcome-modal').classList.remove('hidden');
        }, 500);
    }
}

function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000020, 1, 1000);

    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, cameraDistance);

    // Renderer setup with transparency to show black hole behind
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add background stars
    createBackgroundStars();
}

function createBackgroundStars() {
    const bgStarGeometry = new THREE.BufferGeometry();
    const bgStarCount = 1000;
    const positions = new Float32Array(bgStarCount * 3);

    for (let i = 0; i < bgStarCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 2000;
        positions[i + 1] = (Math.random() - 0.5) * 2000;
        positions[i + 2] = (Math.random() - 0.5) * 2000;
    }

    bgStarGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const bgStarMaterial = new THREE.PointsMaterial({ 
        color: 0xffffff, 
        size: 0.5,
        transparent: true,
        opacity: 0.6
    });

    const bgStars = new THREE.Points(bgStarGeometry, bgStarMaterial);
    scene.add(bgStars);
}

async function createUserStar() {
    const name = document.getElementById('user-name').value.trim();
    const color = document.getElementById('star-color').value;

    if (!name) {
        alert('Please enter your name!');
        return;
    }

    // Check if name already exists
    const existingStar = galaxyData.stars.find(star => star.name.toLowerCase() === name.toLowerCase());
    if (existingStar) {
        alert('A star with this name already exists! Please choose a different name.');
        return;
    }

    // Create star data
    const starData = {
        name: name,
        color: color,
        position: generateStarPosition(),
        timestamp: new Date().toISOString()
    };

    // Save to database
    const savedStar = await saveStar(starData);
    if (!savedStar) {
        alert('Error saving star to database. Please check the browser console for details and make sure the database tables are set up correctly.');
        return;
    }

    // Save user
    const userSaved = await saveUser({ name: name });
    if (!userSaved) {
        console.warn('Could not save user data');
    }

    // Add to local data
    galaxyData.stars.push(savedStar);
    galaxyData.visitCount++;

    // Create 3D star
    createStarMesh(savedStar);
    updateCounters();
    
    // Hide modal
    document.getElementById('welcome-modal').classList.add('hidden');
    
    // Focus on new star
    focusOnStar(savedStar);
}

function generateStarPosition() {
    const radius = Math.random() * 40 + 10;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi)
    };
}

function createStarMesh(starData) {
    // Create main star (white core)
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 1
    });

    const star = new THREE.Mesh(geometry, material);
    star.position.set(starData.position.x, starData.position.y, starData.position.z);
    star.userData = starData;

    // Create multiple glow layers
    const glowLayers = [];
    
    // Inner glow
    const innerGlowGeometry = new THREE.SphereGeometry(1.2, 12, 12);
    const innerGlowMaterial = new THREE.MeshBasicMaterial({
        color: starData.color,
        transparent: true,
        opacity: 0.6
    });
    const innerGlow = new THREE.Mesh(innerGlowGeometry, innerGlowMaterial);
    innerGlow.position.copy(star.position);
    glowLayers.push(innerGlow);
    
    // Outer glow
    const outerGlowGeometry = new THREE.SphereGeometry(2, 8, 8);
    const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: starData.color,
        transparent: true,
        opacity: 0.3
    });
    const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
    outerGlow.position.copy(star.position);
    glowLayers.push(outerGlow);
    
    // Distant glow
    const distantGlowGeometry = new THREE.SphereGeometry(3.5, 6, 6);
    const distantGlowMaterial = new THREE.MeshBasicMaterial({
        color: starData.color,
        transparent: true,
        opacity: 0.1
    });
    const distantGlow = new THREE.Mesh(distantGlowGeometry, distantGlowMaterial);
    distantGlow.position.copy(star.position);
    glowLayers.push(distantGlow);
    
    scene.add(star);
    glowLayers.forEach(glow => scene.add(glow));
    starMeshes.push({ star, glowLayers, data: starData });
}

function focusOnStar(starData) {
    const targetFocus = new THREE.Vector3(
        starData.position.x,
        starData.position.y,
        starData.position.z
    );
    
    animateFocusTo(targetFocus);
}

function animateFocusTo(targetFocus) {
    const startFocus = focusTarget.clone();
    const startTime = Date.now();
    const duration = 2000;

    function updateFocus() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easing = 1 - Math.pow(1 - progress, 3);

        focusTarget.lerpVectors(startFocus, targetFocus, easing);

        if (progress < 1) {
            requestAnimationFrame(updateFocus);
        }
    }

    updateFocus();
}

function setupEventListeners() {
    let hasMouseMoved = false;
    
    document.addEventListener('mousedown', (event) => {
        if (event.target.closest('#ui-overlay')) return;
        isDragging = true;
        hasMouseMoved = false;
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
        document.getElementById('canvas-container').style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (event) => {
        if (!isDragging) return;
        
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;
        
        if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
            hasMouseMoved = true;
        }
        
        cameraRotation.y -= deltaX * rotationSpeed;
        cameraRotation.x -= deltaY * rotationSpeed;
        cameraRotation.x = Math.max(-Math.PI/2 + 0.1, Math.min(Math.PI/2 - 0.1, cameraRotation.x));
        
        previousMousePosition.x = event.clientX;
        previousMousePosition.y = event.clientY;
    });

    document.addEventListener('mouseup', (event) => {
        if (isDragging && !hasMouseMoved) {
            onStarClick(event);
        }
        isDragging = false;
        hasMouseMoved = false;
        document.getElementById('canvas-container').style.cursor = 'grab';
    });

    document.addEventListener('wheel', (event) => {
        cameraDistance += event.deltaY * 0.1;
        cameraDistance = Math.max(5, Math.min(200, cameraDistance));
    });

    document.getElementById('search-input').addEventListener('input', onSearch);
    document.getElementById('star-color').addEventListener('input', (e) => {
        document.getElementById('color-preview').style.backgroundColor = e.target.value;
    });

    window.addEventListener('resize', onWindowResize);
    document.getElementById('user-name').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createUserStar();
    });

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();
            animateFocusTo(new THREE.Vector3(0, 0, 0));
        }
    });

    // Resize listener for black hole shader
    window.addEventListener('resize', function(event){
        if (blackholeCanvas && blackholeGl) {
            // Resize canvas to match window
            blackholeCanvas.width = window.innerWidth;
            blackholeCanvas.height = window.innerHeight;
            blackholeCanvas.style.width = window.innerWidth + 'px';
            blackholeCanvas.style.height = window.innerHeight + 'px';
            
            // Update WebGL viewport
            blackholeGl.viewport(0, 0, blackholeCanvas.width, blackholeCanvas.height);
            
            // Update resolution uniform
            blackholeGl.uniform2f(locationOfResolution, blackholeCanvas.width, blackholeCanvas.height);
            
            // Reset mouse to center if not moved
            if (!blackholeMouse.moved) {
                blackholeMouse.x = window.innerWidth / 2;
                blackholeMouse.y = window.innerHeight / 2;
            }
        }
    });
}

function onStarClick(event) {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const starObjects = starMeshes.map(s => s.star);
    const intersects = raycaster.intersectObjects(starObjects);

    if (intersects.length > 0) {
        const starData = intersects[0].object.userData;
        showStarInfo(starData);
        focusOnStar(starData);
    }
}

function showStarInfo(starData) {
    const starInfoContent = document.getElementById('star-info-content');
    const createdDate = starData.timestamp ? new Date(starData.timestamp).toLocaleDateString() : 'Unknown';
    
    starInfoContent.innerHTML = `
        <p class="star-name">⭐ ${starData.name}</p>
        <p><span class="star-color-badge" style="background-color: ${starData.color};"></span>Color: ${starData.color}</p>
        <p>📅 Created: ${createdDate}</p>
        <p>📍 Position: (${Math.round(starData.position.x)}, ${Math.round(starData.position.y)}, ${Math.round(starData.position.z)})</p>
    `;
}

function onSearch(event) {
    const query = event.target.value.toLowerCase();
    const resultsContainer = document.getElementById('search-results');
    
    if (query.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }

    const matches = galaxyData.stars.filter(star => 
        star.name.toLowerCase().includes(query)
    );

    resultsContainer.innerHTML = matches.map(star => 
        `<div class="search-result" onclick="focusOnStarByName('${star.name}')" style="color: ${star.color}">
            ⭐ ${star.name}
        </div>`
    ).join('');
}

function focusOnStarByName(name) {
    const star = galaxyData.stars.find(s => s.name === name);
    if (star) {
        focusOnStar(star);
        document.getElementById('search-input').value = '';
        document.getElementById('search-results').innerHTML = '';
    }
}

function updateCounters() {
    document.getElementById('star-count').textContent = galaxyData.stars.length;
    document.getElementById('visitor-count').textContent = galaxyData.visitCount;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    camera.position.x = focusTarget.x + cameraDistance * Math.sin(cameraRotation.y) * Math.cos(cameraRotation.x);
    camera.position.y = focusTarget.y + cameraDistance * Math.sin(cameraRotation.x);
    camera.position.z = focusTarget.z + cameraDistance * Math.cos(cameraRotation.y) * Math.cos(cameraRotation.x);
    
    camera.lookAt(focusTarget);

    starMeshes.forEach((starObj, index) => {
        const time = Date.now() * 0.001;
        
        starObj.glowLayers.forEach((glow, layerIndex) => {
            glow.material.opacity = (0.6 - layerIndex * 0.25) + Math.sin(time + index) * 0.1;
            glow.rotation.y += 0.002 * (layerIndex + 1);
            glow.rotation.x += 0.001 * (layerIndex + 1);
        });
        
        starObj.star.rotation.y += 0.01;
        starObj.star.rotation.x += 0.005;
    });

    renderer.render(scene, camera);
}

// Start the application
init();