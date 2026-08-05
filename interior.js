// ===== SISTEMA DEL MUNDO INTERIOR DE FANTASÍA =====

let meadowParticles;
let forestTrees = [];
let bigCrystalHeart;
let heartbeatRings = [];
const ringCount = 3;

// Inicializar la escena del Mundo Interior
function initPlanetScene() {
    planetScene = new THREE.Scene();
    
    // Configurar cámara de este mundo
    planetCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1500);
    planetCamera.position.set(0, 20, 80);
    
    // Controles para el mundo interior
    planetControls = new THREE.OrbitControls(planetCamera, renderer.domElement);
    planetControls.enableDamping = true;
    planetControls.dampingFactor = 0.05;
    planetControls.maxPolarAngle = Math.PI / 2 - 0.02; // No traspasar el suelo
    planetControls.minDistance = 30;
    planetControls.maxDistance = 250;

    // Luces mágicas del Mundo Interior
    const ambientLight = new THREE.AmbientLight(0x0c092a, 0.6);
    planetScene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xff1493, 2.5, 300); // Luz rosa del corazón
    pointLight1.position.set(0, 15, 0);
    planetScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x4b0082, 2, 200); // Luz índigo
    pointLight2.position.set(50, 20, 50);
    planetScene.add(pointLight2);

    // Suelo: Pradera de fantasía oscura
    const groundGeometry = new THREE.PlaneGeometry(300, 300);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x051307, // Verde bosque extremadamente oscuro
        roughness: 0.9,
        metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    planetScene.add(ground);

    // Domo de cielo estrellado de fantasía
    createInteriorSky();

    // Pradera de luciérnagas y polvo de hadas
    createInteriorMeadow();

    // Bosque de árboles de cristal luminosos
    createInteriorForest();

    // Corazón de cristal central que late
    createBeatingHeart();
}

// Crear domo del cielo con estrellas
function createInteriorSky() {
    const skyGeometry = new THREE.SphereGeometry(600, 32, 32);
    // Usar material de doble cara para poder ver el interior de la esfera
    const skyMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x090518, // Indigo profundo
        side: THREE.BackSide,
        fog: false
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    planetScene.add(sky);

    // Añadir estrellas adicionales específicas de esta cúpula
    const starGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = [];
    for (let i = 0; i < starCount; i++) {
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 580; // Justo dentro de la esfera
        
        // Mantener las estrellas sólo en el hemisferio superior
        const y = Math.abs(Math.cos(phi) * r);
        
        starPos.push(
            Math.sin(phi) * Math.cos(theta) * r,
            y - 5,
            Math.sin(phi) * Math.sin(theta) * r
        );
    }
    starGeo.setAttribute("position", new THREE.Float32BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
        color: 0xffd700,
        size: 1.5,
        transparent: true,
        opacity: 0.8
    });
    const domeStars = new THREE.Points(starGeo, starMat);
    planetScene.add(domeStars);
}

// Pradera con luciérnagas mágicas flotantes
function createInteriorMeadow() {
    const particleCount = 250;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const speeds = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        // Distribuir en círculo sobre el suelo
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * 120;
        positions[i * 3] = Math.cos(angle) * r;
        positions[i * 3 + 1] = -5 + Math.random() * 15; // Flotando a baja altura
        positions[i * 3 + 2] = Math.sin(angle) * r;

        speeds[i] = Math.random() * 0.05 + 0.02; // Velocidad de oscilación
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    
    const spriteTexture = createCircularGlowTexture();
    const material = new THREE.PointsMaterial({
        size: 5,
        map: spriteTexture,
        color: 0x9be564, // Luciérnagas verdes/doradas
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    meadowParticles = new THREE.Points(geometry, material);
    meadowParticles.userData.speeds = speeds;
    meadowParticles.userData.initialY = new Float32Array(positions); // Copia para oscilar
    planetScene.add(meadowParticles);
}

// Bosque de árboles de cristal
function createInteriorForest() {
    for (let i = 0; i < 24; i++) {
        const tree = createCrystalTree();
        
        // Evitar el centro exacto donde está el corazón
        let x, z;
        do {
            x = Math.random() * 200 - 100;
            z = Math.random() * 200 - 100;
        } while (Math.sqrt(x*x + z*z) < 30); // Radio seguro de 30 unidades
        
        tree.position.set(x, -5, z);
        const scale = 0.6 + Math.random() * 0.6;
        tree.scale.set(scale, scale, scale);
        
        planetScene.add(tree);
        forestTrees.push(tree);
    }
}

// Crear un árbol de cristal tridimensional
function createCrystalTree() {
    const treeGroup = new THREE.Group();

    // Tronco cristalino retorcido
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 1.2, 10, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({
        color: 0x4b0082, // Índigo
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.8
    });
    
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 5;
    treeGroup.add(trunk);

    // Copa hecha de nubes de partículas brillantes (sakura de luz)
    const leafCount = 120;
    const leafGeo = new THREE.BufferGeometry();
    const leafPositions = [];
    
    // Distribuir hojas tridimensionalmente en esferas
    for (let i = 0; i < leafCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * 5 + 1; // Radio de la copa
        
        leafPositions.push(
            Math.sin(phi) * Math.cos(theta) * r,
            10 + Math.sin(phi) * Math.sin(theta) * r * 0.7, // Centrado arriba del tronco
            Math.sin(phi) * Math.sin(theta) * r
        );
    }
    
    leafGeo.setAttribute("position", new THREE.Float32BufferAttribute(leafPositions, 3));
    
    const spriteTexture = createCircularGlowTexture();
    const leafMaterial = new THREE.PointsMaterial({
        size: 6,
        map: spriteTexture,
        color: Math.random() > 0.5 ? 0xff1493 : 0xee82ee, // Hojas rosas o violetas
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    const leaves = new THREE.Points(leafGeo, leafMaterial);
    treeGroup.add(leaves);
    
    return treeGroup;
}

// Crear corazón de cristal gigante latiente
function createBeatingHeart() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    
    heartShape.moveTo(x + 2.5, y + 2.5);
    heartShape.bezierCurveTo(x + 2.5, y + 2.5, x + 2, y, x, y);
    heartShape.bezierCurveTo(x - 3, y, x - 3, y + 3.5, x - 3, y + 3.5);
    heartShape.bezierCurveTo(x - 3, y + 5.5, x - 1.5, y + 7.7, x + 2.5, y + 9.5);
    heartShape.bezierCurveTo(x + 6.5, y + 7.7, x + 8, y + 5.5, x + 8, y + 3.5);
    heartShape.bezierCurveTo(x + 8, y + 3.5, x + 8, y, x + 5, y);
    heartShape.bezierCurveTo(x + 3.5, y, x + 2.5, y + 2.5, x + 2.5, y + 2.5);
    
    const extrudeSettings = {
        depth: 3,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 4
    };
    
    const heartGeometry = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
    
    // Centrar la geometría
    heartGeometry.center();

    // Material de cristal brillante rosa neón
    const heartMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xff1493,
        emissive: 0xff007f,
        emissiveIntensity: 0.6,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.9
    });
    
    bigCrystalHeart = new THREE.Mesh(heartGeometry, heartMaterial);
    bigCrystalHeart.scale.set(3, 3, 3);
    bigCrystalHeart.position.set(0, 15, 0);
    bigCrystalHeart.rotation.x = Math.PI; // Corregir rotación para que apunte hacia abajo
    planetScene.add(bigCrystalHeart);

    // Crear ondas expansivas de latido (aros)
    for (let i = 0; i < ringCount; i++) {
        const ringGeo = new THREE.RingGeometry(0.1, 1, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0xff1493,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 0;
        planetScene.add(ring);
        
        heartbeatRings.push({
            mesh: ring,
            scale: 1,
            maxScale: 60 + i * 20,
            speed: 0.4 + i * 0.1
        });
    }
}

// Bucle interno de actualización del Mundo Interior (llamado por main.js)
function updateInteriorWorld(time) {
    // 1. Latido rítmico del corazón (Doble pulso humano)
    const basePulse = Math.sin(time * 5);
    const secondaryPulse = Math.sin(time * 10) * 0.2;
    const pulseFactor = 2.8 + (basePulse > 0 ? basePulse * 0.35 : basePulse * 0.1) + secondaryPulse;
    
    if (bigCrystalHeart) {
        bigCrystalHeart.scale.set(pulseFactor, pulseFactor, pulseFactor);
        bigCrystalHeart.rotation.y = Math.sin(time * 0.2) * 0.15; // Rotación lenta y coqueta
    }

    // 2. Animar anillos expansivos en el latido
    // Disparar expansión coincidiendo con el pico de latido
    heartbeatRings.forEach((ring, index) => {
        ring.scale += ring.speed * 2.0;
        ring.mesh.scale.set(ring.scale, ring.scale, 1);
        
        // Fading de opacidad proporcional a la distancia recorrida
        const ratio = ring.scale / ring.maxScale;
        ring.mesh.material.opacity = Math.max(0, (1 - ratio) * 0.5);

        // Si se expandió al máximo, reiniciar
        if (ring.scale >= ring.maxScale) {
            ring.scale = 1;
        }
    });

    // 3. Oscilación y flotación de luciérnagas en el prado
    if (meadowParticles) {
        const positions = meadowParticles.geometry.attributes.position.array;
        const initialY = meadowParticles.userData.initialY;
        const speeds = meadowParticles.userData.speeds;
        
        for (let i = 0; i < positions.length / 3; i++) {
            // Movimiento sinusoidal en Y
            positions[i * 3 + 1] = initialY[i * 3 + 1] + Math.sin(time * 2 + i) * 2;
            
            // Ligera deriva horizontal en X y Z
            positions[i * 3] += Math.sin(time * speeds[i] * 5 + i) * 0.05;
            positions[i * 3 + 2] += Math.cos(time * speeds[i] * 5 + i) * 0.05;
        }
        meadowParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 4. Oscilación sutil de la copa de los árboles (efecto viento mágico)
    forestTrees.forEach((tree, index) => {
        const leaves = tree.children[1];
        if (leaves) {
            leaves.rotation.y = Math.sin(time * 0.3 + index) * 0.05;
            leaves.rotation.z = Math.cos(time * 0.4 + index) * 0.03;
        }
    });
}
