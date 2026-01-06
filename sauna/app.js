// ===== Global Variables =====
let scene, camera, renderer;
let saunaGroup;

let orbitRadius = 8;
let orbitTheta = Math.PI / 4;
let orbitPhi = Math.PI / 3;
let orbitTarget = new THREE.Vector3(0, 1.1, 0);

let isMouseDown = false;
let prevMouseX = 0;
let prevMouseY = 0;

let wallPlanksCount = 0;
let innerWallPlanksCount = 0;
let roofPlanksCount = 0;
let floorPlanksCount = 0;
let gablePlanksCount = 0;
let insulationPanelsCount = 0;

let updateTimeout = null;

// Measurement system
let measurementsEnabled = false;
let measurementLabels = [];
let measurementGroup = null;

// Insulation colors
const insulationColors = {
    rockwool: 0xFFD700,
    fiberglass: 0xFFB6C1,
    foam: 0xFFF8DC,
    none: null
};

// ===== Initialization =====
function init() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5EDE4);

    camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    updateCameraFromOrbit();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    const fillLight = new THREE.DirectionalLight(0xD4A574, 0.3);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0xEDE5DC, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    const gridHelper = new THREE.GridHelper(10, 20, 0xBCAA99, 0xDDD5CC);
    scene.add(gridHelper);

    saunaGroup = new THREE.Group();
    scene.add(saunaGroup);

    // Event listeners
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('mouseleave', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());

    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTouchMove, { passive: false });
    renderer.domElement.addEventListener('touchend', onTouchEnd);

    window.addEventListener('resize', onResize);

    setupRealTimeUpdates();
    setupRoofDirectionToggle();

    generateSauna();
    animate();
}

// ===== Camera Controls =====
function updateCameraFromOrbit() {
    const x = orbitRadius * Math.sin(orbitPhi) * Math.sin(orbitTheta);
    const y = orbitRadius * Math.cos(orbitPhi);
    const z = orbitRadius * Math.sin(orbitPhi) * Math.cos(orbitTheta);
    
    camera.position.set(
        orbitTarget.x + x,
        orbitTarget.y + y,
        orbitTarget.z + z
    );
    camera.lookAt(orbitTarget);
}

function onMouseDown(e) {
    isMouseDown = true;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
    renderer.domElement.style.cursor = 'grabbing';
}

function onMouseMove(e) {
    if (!isMouseDown) return;
    
    const deltaX = e.clientX - prevMouseX;
    const deltaY = e.clientY - prevMouseY;
    
    orbitTheta -= deltaX * 0.01;
    orbitPhi -= deltaY * 0.01;
    orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitPhi));
    
    updateCameraFromOrbit();
    
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;
}

function onMouseUp() {
    isMouseDown = false;
    renderer.domElement.style.cursor = 'grab';
}

function onWheel(e) {
    e.preventDefault();
    orbitRadius += e.deltaY * 0.01;
    orbitRadius = Math.max(2, Math.min(25, orbitRadius));
    updateCameraFromOrbit();
}

// Touch controls
let lastTouchDistance = 0;
let lastTouchX = 0;
let lastTouchY = 0;

function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        lastTouchDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
    }
}

function onTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - lastTouchX;
        const deltaY = e.touches[0].clientY - lastTouchY;
        
        orbitTheta -= deltaX * 0.01;
        orbitPhi -= deltaY * 0.01;
        orbitPhi = Math.max(0.1, Math.min(Math.PI - 0.1, orbitPhi));
        
        updateCameraFromOrbit();
        
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
        const distance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        const delta = lastTouchDistance - distance;
        
        orbitRadius += delta * 0.02;
        orbitRadius = Math.max(2, Math.min(25, orbitRadius));
        
        updateCameraFromOrbit();
        lastTouchDistance = distance;
    }
}

function onTouchEnd() {
    lastTouchDistance = 0;
}

// ===== UI Setup =====
function setupRealTimeUpdates() {
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        if (input.type === 'range' || input.type === 'number') {
            input.addEventListener('input', scheduleUpdate);
        }
        if (input.tagName === 'SELECT' || input.type === 'checkbox') {
            input.addEventListener('change', scheduleUpdate);
        }
    });

    document.getElementById('doorPosition').addEventListener('input', function() {
        const val = this.value;
        document.getElementById('doorPosValue').textContent = val == 50 ? 'Center' : val + '%';
    });
}

function setupRoofDirectionToggle() {
    const roofTypeSelect = document.getElementById('roofType');
    roofTypeSelect.addEventListener('change', updateRoofDirectionVisibility);
    updateRoofDirectionVisibility();
}

function updateRoofDirectionVisibility() {
    const roofType = document.getElementById('roofType').value;
    const directionGroup = document.getElementById('roofDirectionGroup');
    const directionInfo = document.getElementById('roofDirectionInfo');
    
    if (roofType === 'shed' || roofType === 'gable') {
        directionGroup.style.display = 'block';
        directionInfo.style.display = 'block';
    } else {
        directionGroup.style.display = 'none';
        directionInfo.style.display = 'none';
    }
}

function scheduleUpdate() {
    if (updateTimeout) {
        clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
        generateSauna(true);
    }, 50);
}

function toggleCollapsible(header) {
    header.parentElement.classList.toggle('open');
}

function toggleWindowConfig(side) {
    const checkbox = document.getElementById('window' + side);
    const config = document.getElementById('window' + side + 'Config');
    config.classList.toggle('active', checkbox.checked);
    scheduleUpdate();
}

function toggleDoubleWallConfig() {
    const checkbox = document.getElementById('doubleWall');
    const config = document.getElementById('doubleWallConfig');
    config.classList.toggle('active', checkbox.checked);
    scheduleUpdate();
}

function onResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ===== Texture & Material Creation =====
function createWoodTexture(darker = false) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const baseColor = darker ? '#9B7653' : '#C4956A';
    const midColor = darker ? '#B8956A' : '#D4A574';
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, baseColor);
    gradient.addColorStop(0.3, midColor);
    gradient.addColorStop(0.5, baseColor);
    gradient.addColorStop(0.7, midColor);
    gradient.addColorStop(1, baseColor);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 64);

    ctx.strokeStyle = 'rgba(139, 90, 43, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        const y = Math.random() * 64;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x < 256; x += 10) {
            ctx.lineTo(x, y + Math.sin(x * 0.05) * 2 + Math.random() * 2);
        }
        ctx.stroke();
    }

    for (let i = 0; i < 2; i++) {
        const x = Math.random() * 200 + 28;
        const y = Math.random() * 40 + 12;
        const radius = Math.random() * 4 + 3;
        const knotGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        knotGradient.addColorStop(0, '#6B4423');
        knotGradient.addColorStop(0.5, '#8B5A2B');
        knotGradient.addColorStop(1, '#A0784C');
        ctx.fillStyle = knotGradient;
        ctx.beginPath();
        ctx.ellipse(x, y, radius, radius * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
}

function createPlank(width, height, depth, darker = false) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const texture = createWoodTexture(darker);
    texture.repeat.set(Math.max(width, depth) / 0.25, 1);

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.0
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

function createInsulationPanel(width, height, depth, type) {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const color = insulationColors[type] || 0xFFD700;
    
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.9,
        metalness: 0.0,
        transparent: true,
        opacity: 0.7
    });

    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createGlassMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0x88ccff,
        metalness: 0,
        roughness: 0,
        transmission: 0.9,
        transparent: true,
        opacity: 0.3
    });
}

// ===== Save/Load Design =====
function getDesignData() {
    return {
        version: '1.0',
        dimensions: {
            width: parseFloat(document.getElementById('width').value),
            length: parseFloat(document.getElementById('length').value),
            height: parseFloat(document.getElementById('height').value)
        },
        doubleWall: {
            enabled: document.getElementById('doubleWall').checked,
            wallGap: parseFloat(document.getElementById('wallGap').value),
            insulationType: document.getElementById('insulationType').value,
            showInsulation: document.getElementById('showInsulation').checked
        },
        roof: {
            type: document.getElementById('roofType').value,
            height: parseFloat(document.getElementById('roofHeight').value),
            overhang: parseFloat(document.getElementById('roofOverhang').value),
            direction: document.getElementById('roofDirection').value
        },
        door: {
            width: parseFloat(document.getElementById('doorWidth').value),
            height: parseFloat(document.getElementById('doorHeight').value),
            wall: document.getElementById('doorWall').value,
            position: parseFloat(document.getElementById('doorPosition').value)
        },
        windows: {
            front: getWindowConfigForSave('Front'),
            back: getWindowConfigForSave('Back'),
            left: getWindowConfigForSave('Left'),
            right: getWindowConfigForSave('Right')
        },
        planks: {
            width: parseFloat(document.getElementById('plankWidth').value),
            thickness: parseFloat(document.getElementById('plankThickness').value),
            length: parseFloat(document.getElementById('plankLength').value)
        }
    };
}

function getWindowConfigForSave(side) {
    return {
        enabled: document.getElementById('window' + side).checked,
        width: parseFloat(document.getElementById('window' + side + 'Width').value),
        height: parseFloat(document.getElementById('window' + side + 'Height').value),
        y: parseFloat(document.getElementById('window' + side + 'Y').value),
        position: parseFloat(document.getElementById('window' + side + 'X').value)
    };
}

function saveDesign() {
    const data = getDesignData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sauna-design.sauna';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function loadDesign(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            applyDesignData(data);
            generateSauna();
        } catch (err) {
            alert('Error loading design file: ' + err.message);
        }
    };
    reader.readAsText(file);
    
    // Reset file input
    event.target.value = '';
}

function applyDesignData(data) {
    // Dimensions
    document.getElementById('width').value = data.dimensions.width;
    document.getElementById('length').value = data.dimensions.length;
    document.getElementById('height').value = data.dimensions.height;
    
    // Double wall
    document.getElementById('doubleWall').checked = data.doubleWall.enabled;
    document.getElementById('wallGap').value = data.doubleWall.wallGap;
    document.getElementById('insulationType').value = data.doubleWall.insulationType;
    document.getElementById('showInsulation').checked = data.doubleWall.showInsulation;
    toggleDoubleWallConfig();
    
    // Roof
    document.getElementById('roofType').value = data.roof.type;
    document.getElementById('roofHeight').value = data.roof.height;
    document.getElementById('roofOverhang').value = data.roof.overhang;
    document.getElementById('roofDirection').value = data.roof.direction || 'left-right';
    updateRoofDirectionVisibility();
    
    // Door
    document.getElementById('doorWidth').value = data.door.width;
    document.getElementById('doorHeight').value = data.door.height;
    document.getElementById('doorWall').value = data.door.wall;
    document.getElementById('doorPosition').value = data.door.position;
    document.getElementById('doorPosValue').textContent = data.door.position == 50 ? 'Center' : data.door.position + '%';
    
    // Windows
    applyWindowConfig('Front', data.windows.front);
    applyWindowConfig('Back', data.windows.back);
    applyWindowConfig('Left', data.windows.left);
    applyWindowConfig('Right', data.windows.right);
    
    // Planks
    document.getElementById('plankWidth').value = data.planks.width;
    document.getElementById('plankThickness').value = data.planks.thickness;
    document.getElementById('plankLength').value = data.planks.length;
}

function applyWindowConfig(side, config) {
    document.getElementById('window' + side).checked = config.enabled;
    document.getElementById('window' + side + 'Width').value = config.width;
    document.getElementById('window' + side + 'Height').value = config.height;
    document.getElementById('window' + side + 'Y').value = config.y;
    document.getElementById('window' + side + 'X').value = config.position;
    toggleWindowConfig(side);
}

// ===== Main Generation =====
function generateSauna(keepCamera = false) {
    // Clear existing geometry
    while (saunaGroup.children.length > 0) {
        const child = saunaGroup.children[0];
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (child.material.map) child.material.map.dispose();
            child.material.dispose();
        }
        saunaGroup.remove(child);
    }

    // Reset counters
    wallPlanksCount = 0;
    innerWallPlanksCount = 0;
    roofPlanksCount = 0;
    floorPlanksCount = 0;
    gablePlanksCount = 0;
    insulationPanelsCount = 0;

    // Get dimensions
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;

    const plankWidth = (parseFloat(document.getElementById('plankWidth').value) || 10) / 100;
    const plankThickness = (parseFloat(document.getElementById('plankThickness').value) || 2) / 100;

    const doorWidth = parseFloat(document.getElementById('doorWidth').value) || 0.8;
    const doorHeight = parseFloat(document.getElementById('doorHeight').value) || 1.9;
    const doorWall = document.getElementById('doorWall').value;
    const doorPosition = (parseFloat(document.getElementById('doorPosition').value) || 50) / 100;

    const roofType = document.getElementById('roofType').value;
    const roofHeight = parseFloat(document.getElementById('roofHeight').value) || 0.6;
    const roofOverhang = parseFloat(document.getElementById('roofOverhang').value) || 0.15;
    const roofDirection = document.getElementById('roofDirection').value || 'left-right';

    // Double wall settings
    const doubleWallEnabled = document.getElementById('doubleWall').checked;
    const wallGap = doubleWallEnabled ? (parseFloat(document.getElementById('wallGap').value) || 10) / 100 : 0;
    const insulationType = document.getElementById('insulationType').value;
    const showInsulation = document.getElementById('showInsulation').checked;

    const gap = 0.002;

    const windows = {
        front: getWindowConfig('Front'),
        back: getWindowConfig('Back'),
        left: getWindowConfig('Left'),
        right: getWindowConfig('Right')
    };

    // Calculate wall heights based on roof type and direction
    const wallHeights = calculateWallHeights(saunaWidth, saunaLength, saunaHeight, roofHeight, roofType, roofDirection);

    // Generate outer walls with variable heights for shed roof
    generateWall('front', saunaWidth, wallHeights.front, saunaLength, plankWidth, plankThickness, gap, 
                doorWall === 'front' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                windows.front, false, 0, saunaWidth);
    generateWall('back', saunaWidth, wallHeights.back, saunaLength, plankWidth, plankThickness, gap,
                doorWall === 'back' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                windows.back, false, 0, saunaWidth);
    generateWall('left', saunaLength, wallHeights.left, saunaWidth, plankWidth, plankThickness, gap,
                doorWall === 'left' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                windows.left, false, 0, saunaLength);
    generateWall('right', saunaLength, wallHeights.right, saunaWidth, plankWidth, plankThickness, gap,
                doorWall === 'right' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                windows.right, false, 0, saunaLength);

    // Generate inner walls if double wall is enabled
    if (doubleWallEnabled) {
        const innerOffset = plankThickness + wallGap;
        
        generateWall('front', saunaWidth - 2 * innerOffset, wallHeights.front, saunaLength, plankWidth, plankThickness, gap, 
                    doorWall === 'front' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                    windows.front, true, innerOffset, saunaWidth - 2 * innerOffset);
        generateWall('back', saunaWidth - 2 * innerOffset, wallHeights.back, saunaLength, plankWidth, plankThickness, gap,
                    doorWall === 'back' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                    windows.back, true, innerOffset, saunaWidth - 2 * innerOffset);
        generateWall('left', saunaLength - 2 * innerOffset, wallHeights.left, saunaWidth, plankWidth, plankThickness, gap,
                    doorWall === 'left' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                    windows.left, true, innerOffset, saunaLength - 2 * innerOffset);
        generateWall('right', saunaLength - 2 * innerOffset, wallHeights.right, saunaWidth, plankWidth, plankThickness, gap,
                    doorWall === 'right' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                    windows.right, true, innerOffset, saunaLength - 2 * innerOffset);

        // Generate insulation if enabled and visible
        if (showInsulation && insulationType !== 'none') {
            generateInsulation(saunaWidth, saunaHeight, saunaLength, plankThickness, wallGap, insulationType,
                              doorWall === 'front' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                              doorWall === 'back' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                              doorWall === 'left' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                              doorWall === 'right' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
                              windows);
        }
    }

    generateFloor(saunaWidth, saunaLength, plankWidth, plankThickness, gap);
    generateRoof(roofType, saunaWidth, saunaLength, saunaHeight, roofHeight, roofOverhang, plankWidth, plankThickness, gap, roofDirection);

    // Corner posts - adjusted for roof height
    generateCornerPosts(saunaWidth, saunaLength, saunaHeight, roofHeight, roofType, roofDirection);

    // Update stats
    document.getElementById('wallPlanks').textContent = wallPlanksCount;
    document.getElementById('innerWallPlanks').textContent = innerWallPlanksCount;
    document.getElementById('roofPlanks').textContent = roofPlanksCount;
    document.getElementById('floorPlanks').textContent = floorPlanksCount;
    document.getElementById('gablePlanks').textContent = gablePlanksCount;
    document.getElementById('insulationPanels').textContent = insulationPanelsCount;
    document.getElementById('totalPlanks').textContent = wallPlanksCount + innerWallPlanksCount + roofPlanksCount + floorPlanksCount + gablePlanksCount;

    // Show window hole size discrepancies
    showWindowHoleSizes();
    
    // Regenerate measurements if enabled
    if (measurementsEnabled) {
        generateMeasurements();
    }

    orbitTarget.set(0, saunaHeight / 2, 0);
    
    if (!keepCamera) {
        orbitRadius = Math.max(saunaWidth, saunaLength, saunaHeight) * 2.5;
        orbitTheta = Math.PI / 4;
        orbitPhi = Math.PI / 3;
    }
    
    updateCameraFromOrbit();
}

// ===== Wall Height Calculation =====
function calculateWallHeights(width, length, baseHeight, roofHeight, roofType, roofDirection) {
    const heights = {
        front: baseHeight,
        back: baseHeight,
        left: baseHeight,
        right: baseHeight
    };

    if (roofType === 'shed') {
        switch (roofDirection) {
            case 'left-right':
                heights.right = baseHeight + roofHeight;
                break;
            case 'right-left':
                heights.left = baseHeight + roofHeight;
                break;
            case 'front-back':
                heights.back = baseHeight + roofHeight;
                break;
            case 'back-front':
                heights.front = baseHeight + roofHeight;
                break;
        }
    }

    return heights;
}

// ===== Corner Posts =====
function generateCornerPosts(width, length, baseHeight, roofHeight, roofType, roofDirection) {
    const postSize = 0.05;
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0x8B5A2B, roughness: 0.7 });

    // Calculate corner heights based on roof type
    let cornerHeights = {
        frontLeft: baseHeight,
        frontRight: baseHeight,
        backLeft: baseHeight,
        backRight: baseHeight
    };

    if (roofType === 'shed') {
        switch (roofDirection) {
            case 'left-right':
                cornerHeights.frontRight = baseHeight + roofHeight;
                cornerHeights.backRight = baseHeight + roofHeight;
                break;
            case 'right-left':
                cornerHeights.frontLeft = baseHeight + roofHeight;
                cornerHeights.backLeft = baseHeight + roofHeight;
                break;
            case 'front-back':
                cornerHeights.backLeft = baseHeight + roofHeight;
                cornerHeights.backRight = baseHeight + roofHeight;
                break;
            case 'back-front':
                cornerHeights.frontLeft = baseHeight + roofHeight;
                cornerHeights.frontRight = baseHeight + roofHeight;
                break;
        }
    }

    const corners = [
        { x: -width/2, z: -length/2, height: cornerHeights.frontLeft },
        { x: width/2, z: -length/2, height: cornerHeights.frontRight },
        { x: -width/2, z: length/2, height: cornerHeights.backLeft },
        { x: width/2, z: length/2, height: cornerHeights.backRight }
    ];

    corners.forEach(corner => {
        const postGeometry = new THREE.BoxGeometry(postSize, corner.height, postSize);
        const post = new THREE.Mesh(postGeometry, postMaterial);
        post.position.set(corner.x, corner.height / 2, corner.z);
        post.castShadow = true;
        saunaGroup.add(post);
    });
}

// ===== Insulation Generation =====
function generateInsulation(width, height, length, plankThickness, wallGap, type, doorFront, doorBack, doorLeft, doorRight, windows) {
    const insulationThickness = wallGap - 0.01;
    const offset = plankThickness + wallGap / 2;

    // Front wall insulation with holes
    generateWallInsulation('front', width - plankThickness * 2, height, insulationThickness, 
        0, height / 2, -length / 2 + offset,
        doorFront, windows.front, type);

    // Back wall insulation with holes
    generateWallInsulation('back', width - plankThickness * 2, height, insulationThickness,
        0, height / 2, length / 2 - offset,
        doorBack, windows.back, type);

    // Left wall insulation with holes
    generateWallInsulation('left', length - plankThickness * 2, height, insulationThickness,
        -width / 2 + offset, height / 2, 0,
        doorLeft, windows.left, type);

    // Right wall insulation with holes
    generateWallInsulation('right', length - plankThickness * 2, height, insulationThickness,
        width / 2 - offset, height / 2, 0,
        doorRight, windows.right, type);
}

function generateWallInsulation(side, panelWidth, panelHeight, thickness, posX, posY, posZ, door, window, type) {
    // Collect all holes (door and window)
    const holes = [];
    
    if (door) {
        holes.push({
            left: panelWidth * door.position - door.width / 2,
            right: panelWidth * door.position + door.width / 2,
            bottom: 0,
            top: door.height
        });
    }
    
    if (window) {
        holes.push({
            left: panelWidth * window.position - window.width / 2,
            right: panelWidth * window.position + window.width / 2,
            bottom: window.y,
            top: window.y + window.height
        });
    }
    
    if (holes.length === 0) {
        // No holes, create full panel
        const panel = createInsulationPanel(
            side === 'left' || side === 'right' ? thickness : panelWidth,
            panelHeight,
            side === 'left' || side === 'right' ? panelWidth : thickness,
            type
        );
        panel.position.set(posX, posY, posZ);
        saunaGroup.add(panel);
        insulationPanelsCount++;
        return;
    }
    
    // Create insulation panels around the holes
    // We'll create panels for: left of hole, right of hole, above hole, below hole
    
    holes.forEach(hole => {
        const holeLeft = Math.max(0, hole.left);
        const holeRight = Math.min(panelWidth, hole.right);
        const holeBottom = Math.max(0, hole.bottom);
        const holeTop = Math.min(panelHeight, hole.top);
        
        // Left panel (from wall start to hole left)
        if (holeLeft > 0.05) {
            const leftPanelWidth = holeLeft;
            const panel = createInsulationPanel(
                side === 'left' || side === 'right' ? thickness : leftPanelWidth,
                panelHeight,
                side === 'left' || side === 'right' ? leftPanelWidth : thickness,
                type
            );
            const offsetX = side === 'left' || side === 'right' ? 0 : (-panelWidth/2 + leftPanelWidth/2);
            const offsetZ = side === 'left' || side === 'right' ? (-panelWidth/2 + leftPanelWidth/2) : 0;
            panel.position.set(posX + offsetX, posY, posZ + offsetZ);
            saunaGroup.add(panel);
            insulationPanelsCount++;
        }
        
        // Right panel (from hole right to wall end)
        if (panelWidth - holeRight > 0.05) {
            const rightPanelWidth = panelWidth - holeRight;
            const panel = createInsulationPanel(
                side === 'left' || side === 'right' ? thickness : rightPanelWidth,
                panelHeight,
                side === 'left' || side === 'right' ? rightPanelWidth : thickness,
                type
            );
            const offsetX = side === 'left' || side === 'right' ? 0 : (panelWidth/2 - rightPanelWidth/2);
            const offsetZ = side === 'left' || side === 'right' ? (panelWidth/2 - rightPanelWidth/2) : 0;
            panel.position.set(posX + offsetX, posY, posZ + offsetZ);
            saunaGroup.add(panel);
            insulationPanelsCount++;
        }
        
        // Top panel (above the hole, between hole edges)
        if (panelHeight - holeTop > 0.05) {
            const topPanelHeight = panelHeight - holeTop;
            const topPanelWidth = holeRight - holeLeft;
            if (topPanelWidth > 0.05) {
                const panel = createInsulationPanel(
                    side === 'left' || side === 'right' ? thickness : topPanelWidth,
                    topPanelHeight,
                    side === 'left' || side === 'right' ? topPanelWidth : thickness,
                    type
                );
                const holeCenter = (holeLeft + holeRight) / 2 - panelWidth / 2;
                const offsetX = side === 'left' || side === 'right' ? 0 : holeCenter;
                const offsetZ = side === 'left' || side === 'right' ? holeCenter : 0;
                panel.position.set(posX + offsetX, holeTop + topPanelHeight/2, posZ + offsetZ);
                saunaGroup.add(panel);
                insulationPanelsCount++;
            }
        }
        
        // Bottom panel (below the hole, between hole edges) - only for windows, not doors
        if (holeBottom > 0.05) {
            const bottomPanelHeight = holeBottom;
            const bottomPanelWidth = holeRight - holeLeft;
            if (bottomPanelWidth > 0.05) {
                const panel = createInsulationPanel(
                    side === 'left' || side === 'right' ? thickness : bottomPanelWidth,
                    bottomPanelHeight,
                    side === 'left' || side === 'right' ? bottomPanelWidth : thickness,
                    type
                );
                const holeCenter = (holeLeft + holeRight) / 2 - panelWidth / 2;
                const offsetX = side === 'left' || side === 'right' ? 0 : holeCenter;
                const offsetZ = side === 'left' || side === 'right' ? holeCenter : 0;
                panel.position.set(posX + offsetX, bottomPanelHeight/2, posZ + offsetZ);
                saunaGroup.add(panel);
                insulationPanelsCount++;
            }
        }
    });
}

// ===== Window Config =====
function getWindowConfig(side) {
    const checkbox = document.getElementById('window' + side);
    if (!checkbox || !checkbox.checked) return null;
    return {
        width: parseFloat(document.getElementById('window' + side + 'Width').value) || 0.6,
        height: parseFloat(document.getElementById('window' + side + 'Height').value) || 0.5,
        y: parseFloat(document.getElementById('window' + side + 'Y').value) || 1.2,
        position: (parseFloat(document.getElementById('window' + side + 'X').value) || 50) / 100
    };
}

// ===== Calculate Actual Window Hole =====
function calculateActualWindowHole(wallWidth, wallHeight, plankWidth, gap, window) {
    if (!window) return null;
    
    const winCenter = wallWidth * window.position;
    const winLeft = winCenter - window.width / 2;
    const winRight = winCenter + window.width / 2;
    const winBottom = window.y;
    const winTop = window.y + window.height;
    
    // Find the actual plank boundaries that create the hole
    let actualLeft = null;
    let actualRight = null;
    let actualBottom = null;
    let actualTop = null;
    
    const planksNeeded = Math.ceil(wallHeight / (plankWidth + gap));
    
    for (let i = 0; i < planksNeeded; i++) {
        const y = i * (plankWidth + gap) + plankWidth / 2;
        if (y > wallHeight) break;
        
        const plankBottom = y - plankWidth / 2;
        const plankTop = y + plankWidth / 2;
        
        // Check if this plank row intersects with the window
        if (plankBottom < winTop && plankTop > winBottom) {
            // This plank row has a hole for the window
            if (actualBottom === null) {
                actualBottom = plankBottom;
            }
            actualTop = plankTop;
        }
    }
    
    // For horizontal bounds, the cut is made exactly at window edges
    // but we need to find what actual segments remain
    actualLeft = winLeft;
    actualRight = winRight;
    
    // The actual hole is where planks were cut
    if (actualBottom === null || actualTop === null) {
        return null; // No planks were cut
    }
    
    return {
        width: actualRight - actualLeft,
        height: actualTop - actualBottom,
        y: actualBottom,
        centerX: (actualLeft + actualRight) / 2
    };
}

// ===== Auto-Adapt Window to Match Actual Hole =====
function autoAdaptWindow(side) {
    const checkbox = document.getElementById('window' + side);
    if (!checkbox || !checkbox.checked) {
        alert('Please enable the window first.');
        return;
    }
    
    // Get current settings
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;
    const plankWidth = (parseFloat(document.getElementById('plankWidth').value) || 10) / 100;
    const gap = 0.002;
    
    // Determine wall width based on side
    let wallWidth;
    if (side === 'Front' || side === 'Back') {
        wallWidth = saunaWidth;
    } else {
        wallWidth = saunaLength;
    }
    
    const window = getWindowConfig(side);
    if (!window) return;
    
    // Calculate the actual hole
    const actualHole = calculateActualWindowHole(wallWidth, saunaHeight, plankWidth, gap, window);
    
    if (!actualHole) {
        alert('Could not calculate window hole. Make sure the window is within wall bounds.');
        return;
    }
    
    // Update window dimensions to match the actual hole
    document.getElementById('window' + side + 'Width').value = actualHole.width.toFixed(3);
    document.getElementById('window' + side + 'Height').value = actualHole.height.toFixed(3);
    document.getElementById('window' + side + 'Y').value = actualHole.y.toFixed(3);
    
    // Update the actual size display
    updateActualSizeDisplay(side, actualHole);
    
    // Regenerate
    scheduleUpdate();
}

// ===== Update Actual Size Display =====
function updateActualSizeDisplay(side, actualHole) {
    const infoDiv = document.getElementById('window' + side + 'Actual');
    if (infoDiv && actualHole) {
        infoDiv.innerHTML = `✓ Adapted: ${(actualHole.width * 100).toFixed(1)}cm × ${(actualHole.height * 100).toFixed(1)}cm at ${(actualHole.y * 100).toFixed(1)}cm from floor`;
        infoDiv.classList.add('visible');
    }
}

// ===== Show Current Hole Size (called during generation) =====
function showWindowHoleSizes() {
    const sides = ['Front', 'Back', 'Left', 'Right'];
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;
    const plankWidth = (parseFloat(document.getElementById('plankWidth').value) || 10) / 100;
    const gap = 0.002;
    
    sides.forEach(side => {
        const checkbox = document.getElementById('window' + side);
        const infoDiv = document.getElementById('window' + side + 'Actual');
        
        if (!checkbox || !checkbox.checked || !infoDiv) {
            if (infoDiv) infoDiv.classList.remove('visible');
            return;
        }
        
        let wallWidth;
        if (side === 'Front' || side === 'Back') {
            wallWidth = saunaWidth;
        } else {
            wallWidth = saunaLength;
        }
        
        const window = getWindowConfig(side);
        const actualHole = calculateActualWindowHole(wallWidth, saunaHeight, plankWidth, gap, window);
        
        if (actualHole) {
            const widthDiff = Math.abs(actualHole.width - window.width);
            const heightDiff = Math.abs(actualHole.height - window.height);
            
            if (widthDiff > 0.001 || heightDiff > 0.001) {
                infoDiv.innerHTML = `⚠️ Actual hole: ${(actualHole.width * 100).toFixed(1)}cm × ${(actualHole.height * 100).toFixed(1)}cm (differs from window)`;
                infoDiv.classList.add('visible');
            } else {
                infoDiv.innerHTML = `✓ Window matches hole: ${(actualHole.width * 100).toFixed(1)}cm × ${(actualHole.height * 100).toFixed(1)}cm`;
                infoDiv.classList.add('visible');
            }
        }
    });
}

// ===== Wall Generation =====
function generateWall(side, wallWidth, wallHeight, depth, plankWidth, plankThickness, gap, door, window, isInner, innerOffset, originalWallWidth) {
    const planksNeeded = Math.ceil(wallHeight / (plankWidth + gap));
    const offsetAmount = isInner ? innerOffset : 0;

    for (let i = 0; i < planksNeeded; i++) {
        const y = i * (plankWidth + gap) + plankWidth / 2;
        if (y > wallHeight) break;

        const plankBottom = y - plankWidth / 2;
        const plankTop = y + plankWidth / 2;

        let segments = [{ start: 0, end: wallWidth }];

        if (door) {
            // Calculate door position relative to this wall's width
            const doorCenter = wallWidth * door.position;
            const doorLeft = doorCenter - door.width / 2;
            const doorRight = doorCenter + door.width / 2;

            if (plankTop <= door.height) {
                segments = cutSegment(segments, doorLeft, doorRight);
            }
        }

        if (window) {
            // Calculate window position relative to this wall's width
            const winCenter = wallWidth * window.position;
            const winLeft = winCenter - window.width / 2;
            const winRight = winCenter + window.width / 2;
            const winBottom = window.y;
            const winTop = window.y + window.height;

            // Fixed: Check if plank overlaps with window area
            if (plankBottom < winTop && plankTop > winBottom) {
                segments = cutSegment(segments, winLeft, winRight);
            }
        }

        segments.forEach(seg => {
            const segWidth = seg.end - seg.start;
            if (segWidth < 0.05) return;

            const plank = createPlank(segWidth, plankWidth, plankThickness, isInner);
            const centerX = seg.start + segWidth / 2 - wallWidth / 2;

            switch(side) {
                case 'front':
                    plank.position.set(centerX, y, -depth/2 + offsetAmount);
                    break;
                case 'back':
                    plank.position.set(-centerX, y, depth/2 - offsetAmount);
                    break;
                case 'left':
                    plank.rotation.y = Math.PI / 2;
                    plank.position.set(-depth/2 + offsetAmount, y, -centerX);
                    break;
                case 'right':
                    plank.rotation.y = Math.PI / 2;
                    plank.position.set(depth/2 - offsetAmount, y, centerX);
                    break;
            }
            saunaGroup.add(plank);
            if (isInner) {
                innerWallPlanksCount++;
            } else {
                wallPlanksCount++;
            }
        });
    }

    // Only add window glass and frame to outer wall
    if (window && !isInner) {
        addWindowGlassAndFrame(side, wallWidth, depth, window);
    }
}

// ===== Window Glass and Frame =====
function addWindowGlassAndFrame(side, wallWidth, depth, window) {
    const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(window.width, window.height),
        createGlassMaterial()
    );
    
    // Calculate window center position consistently
    const winCenter = wallWidth * window.position - wallWidth / 2;
    const winY = window.y + window.height / 2;

    switch(side) {
        case 'front':
            glass.position.set(winCenter, winY, -depth/2 + 0.01);
            break;
        case 'back':
            glass.position.set(-winCenter, winY, depth/2 - 0.01);
            glass.rotation.y = Math.PI;
            break;
        case 'left':
            glass.rotation.y = Math.PI / 2;
            glass.position.set(-depth/2 + 0.01, winY, -winCenter);
            break;
        case 'right':
            glass.rotation.y = -Math.PI / 2;
            glass.position.set(depth/2 - 0.01, winY, winCenter);
            break;
    }
    saunaGroup.add(glass);

    // Window frame
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x5D4037, roughness: 0.6 });
    const frameThickness = 0.03;
    const frameDepth = 0.04;

    const framePositions = [
        { w: window.width + frameThickness*2, h: frameThickness, x: 0, y: window.height/2 + frameThickness/2 },
        { w: window.width + frameThickness*2, h: frameThickness, x: 0, y: -window.height/2 - frameThickness/2 },
        { w: frameThickness, h: window.height, x: -window.width/2 - frameThickness/2, y: 0 },
        { w: frameThickness, h: window.height, x: window.width/2 + frameThickness/2, y: 0 }
    ];

    framePositions.forEach(fp => {
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(fp.w, fp.h, frameDepth),
            frameMaterial
        );
        switch(side) {
            case 'front':
                frame.position.set(winCenter + fp.x, winY + fp.y, -depth/2);
                break;
            case 'back':
                frame.position.set(-winCenter - fp.x, winY + fp.y, depth/2);
                break;
            case 'left':
                frame.rotation.y = Math.PI / 2;
                frame.position.set(-depth/2, winY + fp.y, -winCenter - fp.x);
                break;
            case 'right':
                frame.rotation.y = Math.PI / 2;
                frame.position.set(depth/2, winY + fp.y, winCenter + fp.x);
                break;
        }
        frame.castShadow = true;
        saunaGroup.add(frame);
    });
}

// ===== Segment Cutting =====
function cutSegment(segments, cutStart, cutEnd) {
    const result = [];
    segments.forEach(seg => {
        if (cutEnd <= seg.start || cutStart >= seg.end) {
            result.push(seg);
        } else {
            if (cutStart > seg.start) {
                result.push({ start: seg.start, end: cutStart });
            }
            if (cutEnd < seg.end) {
                result.push({ start: cutEnd, end: seg.end });
            }
        }
    });
    return result;
}

// ===== Floor Generation =====
function generateFloor(width, length, plankWidth, plankThickness, gap) {
    const planksNeeded = Math.ceil(width / (plankWidth + gap));
    for (let i = 0; i < planksNeeded; i++) {
        const x = -width/2 + i * (plankWidth + gap) + plankWidth/2;
        if (x > width/2) break;

        const plank = createPlank(plankWidth, plankThickness, length);
        plank.position.set(x, plankThickness/2, 0);
        saunaGroup.add(plank);
        floorPlanksCount++;
    }
}

// ===== Roof Generation =====
function generateRoof(type, width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap, direction) {
    switch(type) {
        case 'flat':
            generateFlatRoof(width, length, height, overhang, plankWidth, plankThickness, gap);
            break;
        case 'gable':
            generateGableRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap, direction);
            break;
        case 'shed':
            generateShedRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap, direction);
            break;
        case 'hip':
            generateHipRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap);
            break;
    }
}

function generateFlatRoof(width, length, height, overhang, plankWidth, plankThickness, gap) {
    const roofWidth = width + overhang * 2;
    const roofLength = length + overhang * 2;
    const planksNeeded = Math.ceil(roofWidth / (plankWidth + gap));

    for (let i = 0; i < planksNeeded; i++) {
        const x = -roofWidth/2 + i * (plankWidth + gap) + plankWidth/2;
        if (x > roofWidth/2) break;

        const plank = createPlank(plankWidth, plankThickness, roofLength, true);
        plank.position.set(x, height + plankThickness/2, 0);
        saunaGroup.add(plank);
        roofPlanksCount++;
    }
}

function generateGableRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap, direction) {
    const roofLength = length + overhang * 2;
    const halfWidth = width / 2 + overhang;
    const slopeLength = Math.sqrt(halfWidth * halfWidth + roofHeight * roofHeight);
    const angle = Math.atan2(roofHeight, halfWidth);

    // Determine if we're doing front-back or left-right ridge
    const isFrontBack = direction === 'front-back' || direction === 'back-front';

    if (isFrontBack) {
        // Ridge runs front-to-back (along Z axis)
        const roofWidth = width + overhang * 2;
        const halfLength = length / 2 + overhang;
        const slopeLengthFB = Math.sqrt(halfLength * halfLength + roofHeight * roofHeight);
        const angleFB = Math.atan2(roofHeight, halfLength);

        // Front side
        const frontPlanks = Math.ceil(slopeLengthFB / (plankWidth + gap));
        for (let i = 0; i < frontPlanks; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLengthFB) break;

            const plank = createPlank(roofWidth, plankThickness, plankWidth, true);
            plank.rotation.x = -angleFB;
            const z = -halfLength + dist * Math.cos(angleFB) + (plankWidth/2) * Math.sin(angleFB);
            const y = height + dist * Math.sin(angleFB) + (plankThickness/2) * Math.cos(angleFB);
            plank.position.set(0, y, z);
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        // Back side
        for (let i = 0; i < frontPlanks; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLengthFB) break;

            const plank = createPlank(roofWidth, plankThickness, plankWidth, true);
            plank.rotation.x = angleFB;
            const z = halfLength - dist * Math.cos(angleFB) - (plankWidth/2) * Math.sin(angleFB);
            const y = height + dist * Math.sin(angleFB) + (plankThickness/2) * Math.cos(angleFB);
            plank.position.set(0, y, z);
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        // Gable ends (left and right)
        generateGableEndLR(length, height, roofHeight, plankWidth, plankThickness, gap, -width/2);
        generateGableEndLR(length, height, roofHeight, plankWidth, plankThickness, gap, width/2);
    } else {
        // Default: Ridge runs left-to-right (along X axis)
        const leftPlanks = Math.ceil(slopeLength / (plankWidth + gap));
        for (let i = 0; i < leftPlanks; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLength) break;

            const plank = createPlank(plankWidth, plankThickness, roofLength, true);
            plank.rotation.z = angle;
            const x = -halfWidth + dist * Math.cos(angle) + (plankWidth/2) * Math.sin(angle);
            const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
            plank.position.set(x, y, 0);
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        for (let i = 0; i < leftPlanks; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLength) break;

            const plank = createPlank(plankWidth, plankThickness, roofLength, true);
            plank.rotation.z = -angle;
            const x = halfWidth - dist * Math.cos(angle) - (plankWidth/2) * Math.sin(angle);
            const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
            plank.position.set(x, y, 0);
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        generateGableEnd(width, height, roofHeight, plankWidth, plankThickness, gap, -length/2);
        generateGableEnd(width, height, roofHeight, plankWidth, plankThickness, gap, length/2);
    }
}

function generateGableEnd(width, height, roofHeight, plankWidth, plankThickness, gap, zPos) {
    const planksNeeded = Math.ceil(roofHeight / (plankWidth + gap));

    for (let i = 0; i < planksNeeded; i++) {
        const y = height + i * (plankWidth + gap) + plankWidth/2;
        const progress = (i * (plankWidth + gap)) / roofHeight;
        const currentWidth = width * (1 - progress);

        if (currentWidth < 0.1) break;

        const plank = createPlank(currentWidth, plankWidth, plankThickness);
        plank.position.set(0, y, zPos);
        saunaGroup.add(plank);
        gablePlanksCount++;
    }
}

function generateGableEndLR(length, height, roofHeight, plankWidth, plankThickness, gap, xPos) {
    const planksNeeded = Math.ceil(roofHeight / (plankWidth + gap));

    for (let i = 0; i < planksNeeded; i++) {
        const y = height + i * (plankWidth + gap) + plankWidth/2;
        const progress = (i * (plankWidth + gap)) / roofHeight;
        const currentLength = length * (1 - progress);

        if (currentLength < 0.1) break;

        const plank = createPlank(plankThickness, plankWidth, currentLength);
        plank.position.set(xPos, y, 0);
        saunaGroup.add(plank);
        gablePlanksCount++;
    }
}

function generateShedRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap, direction) {
    const roofWidth = width + overhang * 2;
    const roofLength = length + overhang * 2;

    // Determine slope direction
    const isLeftRight = direction === 'left-right' || direction === 'right-left';
    const isReversed = direction === 'right-left' || direction === 'back-front';

    if (isLeftRight) {
        // Slope along X axis
        const slopeLength = Math.sqrt(roofWidth * roofWidth + roofHeight * roofHeight);
        const angle = Math.atan2(roofHeight, roofWidth);
        const planksNeeded = Math.ceil(slopeLength / (plankWidth + gap));

        for (let i = 0; i < planksNeeded; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLength) break;

            const plank = createPlank(plankWidth, plankThickness, roofLength, true);
            
            if (isReversed) {
                plank.rotation.z = -angle;
                const x = roofWidth/2 - dist * Math.cos(angle) - (plankWidth/2) * Math.sin(angle);
                const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
                plank.position.set(x, y, 0);
            } else {
                plank.rotation.z = angle;
                const x = -roofWidth/2 + dist * Math.cos(angle) + (plankWidth/2) * Math.sin(angle);
                const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
                plank.position.set(x, y, 0);
            }
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        // Front and back triangular gable fills
        generateShedTriangle(width, length, height, roofHeight, plankWidth, plankThickness, gap, -length/2, isReversed);
        generateShedTriangle(width, length, height, roofHeight, plankWidth, plankThickness, gap, length/2, isReversed);

    } else {
        // Slope along Z axis
        const slopeLength = Math.sqrt(roofLength * roofLength + roofHeight * roofHeight);
        const angle = Math.atan2(roofHeight, roofLength);
        const planksNeeded = Math.ceil(slopeLength / (plankWidth + gap));

        for (let i = 0; i < planksNeeded; i++) {
            const dist = i * (plankWidth + gap) + plankWidth/2;
            if (dist > slopeLength) break;

            const plank = createPlank(roofWidth, plankThickness, plankWidth, true);
            
            if (isReversed) {
                plank.rotation.x = angle;
                const z = roofLength/2 - dist * Math.cos(angle) - (plankWidth/2) * Math.sin(angle);
                const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
                plank.position.set(0, y, z);
            } else {
                plank.rotation.x = -angle;
                const z = -roofLength/2 + dist * Math.cos(angle) + (plankWidth/2) * Math.sin(angle);
                const y = height + dist * Math.sin(angle) + (plankThickness/2) * Math.cos(angle);
                plank.position.set(0, y, z);
            }
            saunaGroup.add(plank);
            roofPlanksCount++;
        }

        // Left and right triangular gable fills
        generateShedTriangleLR(width, length, height, roofHeight, plankWidth, plankThickness, gap, -width/2, isReversed);
        generateShedTriangleLR(width, length, height, roofHeight, plankWidth, plankThickness, gap, width/2, isReversed);
    }
}

function generateShedTriangle(width, length, height, roofHeight, plankWidth, plankThickness, gap, zPos, isReversed) {
    const planksNeeded = Math.ceil(roofHeight / (plankWidth + gap));
    
    for (let i = 0; i < planksNeeded; i++) {
        const y = height + i * (plankWidth + gap) + plankWidth/2;
        if (y > height + roofHeight) break;
        
        // Calculate the roof line at this height
        const heightAboveBase = y - height - plankWidth/2;
        const roofX = isReversed 
            ? width/2 - (heightAboveBase / roofHeight) * width
            : -width/2 + (heightAboveBase / roofHeight) * width;
        
        // Plank goes from roofX to the appropriate side
        let plankStartX, plankEndX;
        if (isReversed) {
            plankStartX = -width/2;
            plankEndX = roofX;
        } else {
            plankStartX = roofX;
            plankEndX = width/2;
        }
        const plankLength = plankEndX - plankStartX;
        
        if (plankLength < 0.05) continue;
        
        const plank = createPlank(plankLength, plankWidth, plankThickness);
        const xPos = plankStartX + plankLength/2;
        plank.position.set(xPos, y, zPos);
        saunaGroup.add(plank);
        gablePlanksCount++;
    }
}

function generateShedTriangleLR(width, length, height, roofHeight, plankWidth, plankThickness, gap, xPos, isReversed) {
    const planksNeeded = Math.ceil(roofHeight / (plankWidth + gap));
    
    for (let i = 0; i < planksNeeded; i++) {
        const y = height + i * (plankWidth + gap) + plankWidth/2;
        if (y > height + roofHeight) break;
        
        // Calculate the roof line at this height
        const heightAboveBase = y - height - plankWidth/2;
        const roofZ = isReversed 
            ? length/2 - (heightAboveBase / roofHeight) * length
            : -length/2 + (heightAboveBase / roofHeight) * length;
        
        // Plank goes from roofZ to the appropriate side
        let plankStartZ, plankEndZ;
        if (isReversed) {
            plankStartZ = -length/2;
            plankEndZ = roofZ;
        } else {
            plankStartZ = roofZ;
            plankEndZ = length/2;
        }
        const plankLen = plankEndZ - plankStartZ;
        
        if (plankLen < 0.05) continue;
        
        const plank = createPlank(plankThickness, plankWidth, plankLen);
        const zPosCenter = plankStartZ + plankLen/2;
        plank.position.set(xPos, y, zPosCenter);
        saunaGroup.add(plank);
        gablePlanksCount++;
    }
}

function generateHipRoof(width, length, height, roofHeight, overhang, plankWidth, plankThickness, gap) {
    const roofWidth = width + overhang * 2;
    const roofLength = length + overhang * 2;
    
    const halfWidth = roofWidth / 2;
    const halfLength = roofLength / 2;
    const ridgeLength = Math.max(0, roofLength - roofWidth);
    
    const slopeLengthSide = Math.sqrt(halfWidth * halfWidth + roofHeight * roofHeight);
    const angleSide = Math.atan2(roofHeight, halfWidth);

    const slopeLengthEnd = Math.sqrt(halfWidth * halfWidth + roofHeight * roofHeight);
    const angleEnd = Math.atan2(roofHeight, halfWidth);

    const sidePlanks = Math.ceil(slopeLengthSide / (plankWidth + gap));
    
    // Left slope
    for (let i = 0; i < sidePlanks; i++) {
        const dist = i * (plankWidth + gap) + plankWidth/2;
        if (dist > slopeLengthSide) break;

        const progress = dist / slopeLengthSide;
        const currentLength = roofLength - (roofLength - ridgeLength) * progress;
        if (currentLength < 0.1) break;

        const plank = createPlank(plankWidth, plankThickness, currentLength, true);
        plank.rotation.z = angleSide;
        const x = -halfWidth + dist * Math.cos(angleSide) + (plankWidth/2) * Math.sin(angleSide);
        const y = height + dist * Math.sin(angleSide) + (plankThickness/2) * Math.cos(angleSide);
        plank.position.set(x, y, 0);
        saunaGroup.add(plank);
        roofPlanksCount++;
    }

    // Right slope
    for (let i = 0; i < sidePlanks; i++) {
        const dist = i * (plankWidth + gap) + plankWidth/2;
        if (dist > slopeLengthSide) break;

        const progress = dist / slopeLengthSide;
        const currentLength = roofLength - (roofLength - ridgeLength) * progress;
        if (currentLength < 0.1) break;

        const plank = createPlank(plankWidth, plankThickness, currentLength, true);
        plank.rotation.z = -angleSide;
        const x = halfWidth - dist * Math.cos(angleSide) - (plankWidth/2) * Math.sin(angleSide);
        const y = height + dist * Math.sin(angleSide) + (plankThickness/2) * Math.cos(angleSide);
        plank.position.set(x, y, 0);
        saunaGroup.add(plank);
        roofPlanksCount++;
    }

    // Front hip
    const frontPlanks = Math.ceil(slopeLengthEnd / (plankWidth + gap));
    for (let i = 0; i < frontPlanks; i++) {
        const dist = i * (plankWidth + gap) + plankWidth/2;
        if (dist > slopeLengthEnd) break;

        const progress = dist / slopeLengthEnd;
        const currentWidth = roofWidth * (1 - progress);
        if (currentWidth < 0.1) break;

        const plank = createPlank(currentWidth, plankThickness, plankWidth, true);
        plank.rotation.x = -angleEnd;
        const z = -halfLength + dist * Math.cos(angleEnd) + (plankWidth/2) * Math.sin(angleEnd);
        const y = height + dist * Math.sin(angleEnd) + (plankThickness/2) * Math.cos(angleEnd);
        plank.position.set(0, y, z);
        saunaGroup.add(plank);
        roofPlanksCount++;
    }

    // Back hip
    for (let i = 0; i < frontPlanks; i++) {
        const dist = i * (plankWidth + gap) + plankWidth/2;
        if (dist > slopeLengthEnd) break;

        const progress = dist / slopeLengthEnd;
        const currentWidth = roofWidth * (1 - progress);
        if (currentWidth < 0.1) break;

        const plank = createPlank(currentWidth, plankThickness, plankWidth, true);
        plank.rotation.x = angleEnd;
        const z = halfLength - dist * Math.cos(angleEnd) - (plankWidth/2) * Math.sin(angleEnd);
        const y = height + dist * Math.sin(angleEnd) + (plankThickness/2) * Math.cos(angleEnd);
        plank.position.set(0, y, z);
        saunaGroup.add(plank);
        roofPlanksCount++;
    }
}

// ===== View Controls =====
function setView(view) {
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const maxDim = Math.max(saunaWidth, saunaLength, saunaHeight);

    orbitTarget.set(0, saunaHeight / 2, 0);

    switch(view) {
        case 'perspective':
            orbitTheta = Math.PI / 4;
            orbitPhi = Math.PI / 3;
            orbitRadius = maxDim * 2.5;
            break;
        case 'front':
            orbitTheta = 0;
            orbitPhi = Math.PI / 2;
            orbitRadius = maxDim * 2;
            break;
        case 'side':
            orbitTheta = Math.PI / 2;
            orbitPhi = Math.PI / 2;
            orbitRadius = maxDim * 2;
            break;
        case 'top':
            orbitTheta = 0;
            orbitPhi = 0.01;
            orbitRadius = maxDim * 2;
            break;
    }

    updateCameraFromOrbit();
}

function resetCamera() {
    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const maxDim = Math.max(saunaWidth, saunaLength, saunaHeight);

    orbitTarget.set(0, saunaHeight / 2, 0);
    orbitTheta = Math.PI / 4;
    orbitPhi = Math.PI / 3;
    orbitRadius = maxDim * 2.5;
    
    updateCameraFromOrbit();
    
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.view-btn').classList.add('active');
}

// ===== Measurement System =====
function toggleMeasurements() {
    measurementsEnabled = !measurementsEnabled;
    const btn = document.getElementById('measureBtn');
    btn.classList.toggle('active', measurementsEnabled);
    
    if (measurementsEnabled) {
        generateMeasurements();
    } else {
        clearMeasurements();
    }
}

function clearMeasurements() {
    if (measurementGroup) {
        scene.remove(measurementGroup);
        measurementGroup.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (child.material.map) child.material.map.dispose();
                child.material.dispose();
            }
        });
        measurementGroup = null;
    }
    measurementLabels = [];
}

function createTextSprite(text, fontSize = 48, color = '#ffffff', bgColor = 'rgba(44, 36, 22, 0.85)') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    // Set canvas size based on text
    context.font = `bold ${fontSize}px Arial`;
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    const padding = 12;
    canvas.width = textWidth + padding * 2;
    canvas.height = textHeight + padding * 2;
    
    // Background
    context.fillStyle = bgColor;
    context.roundRect(0, 0, canvas.width, canvas.height, 6);
    context.fill();
    
    // Border
    context.strokeStyle = 'rgba(212, 165, 116, 0.6)';
    context.lineWidth = 2;
    context.roundRect(0, 0, canvas.width, canvas.height, 6);
    context.stroke();
    
    // Text
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false,
        depthWrite: false
    });
    
    const sprite = new THREE.Sprite(spriteMaterial);
    
    // Scale sprite based on canvas aspect ratio
    const aspectRatio = canvas.width / canvas.height;
    const baseScale = 0.15;
    sprite.scale.set(baseScale * aspectRatio, baseScale, 1);
    
    return sprite;
}

function generateMeasurements() {
    clearMeasurements();
    
    measurementGroup = new THREE.Group();
    scene.add(measurementGroup);
    
    const saunaWidth = parseFloat(document.getElementById('width').value) || 2.5;
    const saunaLength = parseFloat(document.getElementById('length').value) || 3;
    const saunaHeight = parseFloat(document.getElementById('height').value) || 2.2;
    const plankWidth = (parseFloat(document.getElementById('plankWidth').value) || 10) / 100;
    const plankThickness = (parseFloat(document.getElementById('plankThickness').value) || 2) / 100;
    const roofType = document.getElementById('roofType').value;
    const roofHeight = parseFloat(document.getElementById('roofHeight').value) || 0.6;
    const roofDirection = document.getElementById('roofDirection').value || 'left-right';
    
    const doorWidth = parseFloat(document.getElementById('doorWidth').value) || 0.8;
    const doorHeight = parseFloat(document.getElementById('doorHeight').value) || 1.9;
    const doorWall = document.getElementById('doorWall').value;
    const doorPosition = (parseFloat(document.getElementById('doorPosition').value) || 50) / 100;
    
    const gap = 0.002;
    
    const windows = {
        front: getWindowConfig('Front'),
        back: getWindowConfig('Back'),
        left: getWindowConfig('Left'),
        right: getWindowConfig('Right')
    };
    
    // Calculate wall heights for shed roofs
    const wallHeights = calculateWallHeights(saunaWidth, saunaLength, saunaHeight, roofHeight, roofType, roofDirection);
    
    // Generate measurements for each wall
    generateWallMeasurements('front', saunaWidth, wallHeights.front, saunaLength, plankWidth, plankThickness, gap,
        doorWall === 'front' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
        windows.front);
    
    generateWallMeasurements('back', saunaWidth, wallHeights.back, saunaLength, plankWidth, plankThickness, gap,
        doorWall === 'back' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
        windows.back);
    
    generateWallMeasurements('left', saunaLength, wallHeights.left, saunaWidth, plankWidth, plankThickness, gap,
        doorWall === 'left' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
        windows.left);
    
    generateWallMeasurements('right', saunaLength, wallHeights.right, saunaWidth, plankWidth, plankThickness, gap,
        doorWall === 'right' ? { width: doorWidth, height: doorHeight, position: doorPosition } : null,
        windows.right);
    
    // Add overall dimension labels
    addOverallDimensions(saunaWidth, saunaLength, saunaHeight, roofHeight, roofType);
}

function generateWallMeasurements(side, wallWidth, wallHeight, depth, plankWidth, plankThickness, gap, door, window) {
    const planksNeeded = Math.ceil(wallHeight / (plankWidth + gap));
    const labelOffset = 0.08; // Offset from wall surface
    
    for (let i = 0; i < planksNeeded; i++) {
        const y = i * (plankWidth + gap) + plankWidth / 2;
        if (y > wallHeight) break;
        
        const plankBottom = y - plankWidth / 2;
        const plankTop = y + plankWidth / 2;
        
        let segments = [{ start: 0, end: wallWidth }];
        
        if (door) {
            const doorCenter = wallWidth * door.position;
            const doorLeft = doorCenter - door.width / 2;
            const doorRight = doorCenter + door.width / 2;
            if (plankTop <= door.height) {
                segments = cutSegment(segments, doorLeft, doorRight);
            }
        }
        
        if (window) {
            const winCenter = wallWidth * window.position;
            const winLeft = winCenter - window.width / 2;
            const winRight = winCenter + window.width / 2;
            const winBottom = window.y;
            const winTop = window.y + window.height;
            if (plankBottom < winTop && plankTop > winBottom) {
                segments = cutSegment(segments, winLeft, winRight);
            }
        }
        
        // Create labels for each segment
        segments.forEach((seg, segIndex) => {
            const segWidth = seg.end - seg.start;
            if (segWidth < 0.05) return;
            
            const lengthCm = Math.round(segWidth * 100);
            const centerX = seg.start + segWidth / 2 - wallWidth / 2;
            
            // Create label showing length
            const label = createTextSprite(`${lengthCm}cm`, 36);
            
            // Position based on wall side
            switch(side) {
                case 'front':
                    label.position.set(centerX, y, -depth/2 - labelOffset);
                    break;
                case 'back':
                    label.position.set(-centerX, y, depth/2 + labelOffset);
                    break;
                case 'left':
                    label.position.set(-depth/2 - labelOffset, y, -centerX);
                    break;
                case 'right':
                    label.position.set(depth/2 + labelOffset, y, centerX);
                    break;
            }
            
            // Store wall info for visibility culling
            label.userData = { wall: side, row: i, segment: segIndex };
            measurementLabels.push(label);
            measurementGroup.add(label);
        });
    }
}

function addOverallDimensions(width, length, height, roofHeight, roofType) {
    const offset = 0.5;
    
    // Width dimension (bottom, front)
    const widthLabel = createTextSprite(`Width: ${(width * 100).toFixed(0)}cm`, 42, '#4ade80', 'rgba(0, 50, 0, 0.85)');
    widthLabel.position.set(0, -0.15, -length/2 - offset);
    widthLabel.userData = { type: 'dimension', axis: 'width' };
    measurementLabels.push(widthLabel);
    measurementGroup.add(widthLabel);
    
    // Length dimension (bottom, side)
    const lengthLabel = createTextSprite(`Length: ${(length * 100).toFixed(0)}cm`, 42, '#4ade80', 'rgba(0, 50, 0, 0.85)');
    lengthLabel.position.set(-width/2 - offset, -0.15, 0);
    lengthLabel.userData = { type: 'dimension', axis: 'length' };
    measurementLabels.push(lengthLabel);
    measurementGroup.add(lengthLabel);
    
    // Height dimension (corner)
    const totalHeight = roofType === 'flat' ? height : height + roofHeight;
    const heightLabel = createTextSprite(`Height: ${(height * 100).toFixed(0)}cm`, 42, '#4ade80', 'rgba(0, 50, 0, 0.85)');
    heightLabel.position.set(-width/2 - offset, height/2, -length/2 - offset);
    heightLabel.userData = { type: 'dimension', axis: 'height' };
    measurementLabels.push(heightLabel);
    measurementGroup.add(heightLabel);
    
    // Roof height if applicable
    if (roofType !== 'flat') {
        const roofLabel = createTextSprite(`Roof: ${(roofHeight * 100).toFixed(0)}cm`, 42, '#f59e0b', 'rgba(50, 30, 0, 0.85)');
        roofLabel.position.set(0, height + roofHeight/2, -length/2 - offset);
        roofLabel.userData = { type: 'dimension', axis: 'roof' };
        measurementLabels.push(roofLabel);
        measurementGroup.add(roofLabel);
    }
}

function updateMeasurementVisibility() {
    if (!measurementsEnabled || !measurementGroup) return;
    
    const cameraDir = new THREE.Vector3();
    camera.getWorldDirection(cameraDir);
    
    // Wall normals
    const wallNormals = {
        front: new THREE.Vector3(0, 0, -1),
        back: new THREE.Vector3(0, 0, 1),
        left: new THREE.Vector3(-1, 0, 0),
        right: new THREE.Vector3(1, 0, 0)
    };
    
    measurementLabels.forEach(label => {
        if (label.userData.type === 'dimension') {
            // Always show dimension labels
            label.visible = true;
            return;
        }
        
        const wall = label.userData.wall;
        if (wall && wallNormals[wall]) {
            // Show label if camera is facing the wall (dot product < 0 means facing)
            const dot = cameraDir.dot(wallNormals[wall]);
            label.visible = dot < 0.1; // Show if mostly facing the wall
        }
    });
}

// ===== Animation Loop =====
function animate() {
    requestAnimationFrame(animate);
    
    // Update measurement visibility based on camera angle
    if (measurementsEnabled) {
        updateMeasurementVisibility();
    }
    
    renderer.render(scene, camera);
}

// ===== Initialize on Load =====
window.addEventListener('load', init);