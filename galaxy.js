// ===== SISTEMAS TRIDIMENSIONALES DE LA GALAXIA =====

// Grupo de estrellas que parpadearán
let twinklingStars;
let stableStars;
let nebulae = [];

// Crear las nubes de polvo cósmico (nebulosa)
function createNebulae() {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255, 255, 255, 1)");
    grad.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
    grad.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
    grad.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);

    const colors = [0xff1493, 0x8b008b, 0x4169e1, 0x00ffff]; // Rosa, Púrpura, Azul, Cian
    const count = 16;
    
    for (let i = 0; i < count; i++) {
        const material = new THREE.SpriteMaterial({
            map: texture,
            color: colors[i % colors.length],
            transparent: true,
            opacity: 0.05 + Math.random() * 0.06,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        const radius = 250 + Math.random() * 500;
        const angle = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 300;
        
        sprite.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
        const scale = 400 + Math.random() * 400;
        sprite.scale.set(scale, scale, 1);
        
        scene.add(sprite);
        nebulae.push(sprite);
    }
}

// Crear sistema de estrellas (estables y parpadeantes)
function createStars() {
    const starCount = 3000;
    
    // 1. Estrellas estables
    const stableGeo = new THREE.BufferGeometry();
    const stablePositions = [];
    const stableColors = [];
    
    // 2. Estrellas parpadeantes
    const twinkleGeo = new THREE.BufferGeometry();
    const twinklePositions = [];
    const twinkleColors = [];
    
    const starColorsPalette = [0xffffff, 0xffb6c1, 0x87cefa, 0xffe4b5]; // Blanco, Rosa, Azul, Dorado

    for (let i = 0; i < starCount; i++) {
        const x = (Math.random() - 0.5) * 4000;
        const y = (Math.random() - 0.5) * 4000;
        const z = (Math.random() - 0.5) * 4000;
        
        const colorObj = new THREE.Color(starColorsPalette[Math.floor(Math.random() * starColorsPalette.length)]);
        
        if (Math.random() > 0.4) {
            stablePositions.push(x, y, z);
            stableColors.push(colorObj.r, colorObj.g, colorObj.b);
        } else {
            twinklePositions.push(x, y, z);
            twinkleColors.push(colorObj.r, colorObj.g, colorObj.b);
        }
    }
    
    // Configurar estrellas estables
    stableGeo.setAttribute("position", new THREE.Float32BufferAttribute(stablePositions, 3));
    stableGeo.setAttribute("color", new THREE.Float32BufferAttribute(stableColors, 3));
    const stableMat = new THREE.PointsMaterial({
        size: 1.2,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    stableStars = new THREE.Points(stableGeo, stableMat);
    scene.add(stableStars);
    
    // Configurar estrellas parpadeantes
    twinkleGeo.setAttribute("position", new THREE.Float32BufferAttribute(twinklePositions, 3));
    twinkleGeo.setAttribute("color", new THREE.Float32BufferAttribute(twinkleColors, 3));
    const twinkleMat = new THREE.PointsMaterial({
        size: 1.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    twinklingStars = new THREE.Points(twinkleGeo, twinkleMat);
    scene.add(twinklingStars);
}

// Crear el Sol central
function createSun() {
    const fragmentShader = `
        uniform float u_time;
        varying vec2 vUv;
        varying vec3 vNormal;
        vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
        vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
        vec2 fade(vec2 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
        float dot2(vec2 g) { return dot(g,g); }
        float snoise(vec2 P){
            vec4 Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
            vec4 Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
            Pi = mod(Pi, 289.0);
            vec4 ix = Pi.xzxz;
            vec4 iy = Pi.wwyy;
            vec4 fx = Pf.xzxz;
            vec4 fy = Pf.wwyy;
            vec4 i = permute(permute(ix) + iy);
            vec4 gx = fract(i * (1.0 / 7.0)) * 2.0 - 1.0;
            vec4 gy = fract(floor(i * (1.0 / 7.0)) / 7.0) * 2.0 - 1.0;
            vec4 g00 = vec4(gx.x,gy.x,gx.y,gy.y);
            vec4 g10 = vec4(gx.z,gy.z,gx.w,gy.w);
            vec4 norm0 = taylorInvSqrt(dot2(g00));
            vec4 norm1 = taylorInvSqrt(dot2(g10));
            g00 *= norm0;
            g10 *= norm1;
            float n00 = dot(g00, vec2(fx.x, fy.x));
            float n10 = dot(g10, vec2(fx.y, fy.y));
            float n01 = dot(g10.zw, vec2(fx.z, fy.z));
            float n11 = dot(g00.zw, vec2(fx.w, fy.w));
            vec2 m = max(vec2(dot2(vec2(fx.x, fy.x)), dot2(vec2(fx.y, fy.y))),
                                vec2(dot2(vec2(fx.z, fy.z)), dot2(vec2(fx.w, fy.w))));
            float a = m.x;
            vec2 r = fade(fx.xy);
            return 2.0 * mix(mix(n00, n10, r.x), mix(n01, n11, r.y), fade(fy.y));
        }
        void main() {
            vec2 uv = vUv * 4.0 + u_time * 0.15;
            float noise = snoise(uv);
            noise += snoise(uv * 2.0) * 0.5;
            noise = pow(noise * 0.5 + 0.5, 2.0);
            vec3 color1 = vec3(1.0, 0.08, 0.38); // Magenta/Rosa intenso
            vec3 color2 = vec3(1.0, 0.6, 0.0);  // Naranja brillante
            vec3 color3 = vec3(1.0, 0.9, 0.4);  // Amarillo suave
            vec3 finalColor = mix(color1, color2, noise);
            finalColor = mix(finalColor, color3, noise * noise);
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `;

    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vNormal;
        void main() {
            vUv = uv;
            vNormal = normal;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const sunGeometry = new THREE.SphereGeometry(42, 64, 64);
    const sunMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
    });
    
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    sun.userData.clickable = true;
    sun.userData.type = 'sun';
    scene.add(sun);

    // Corona y aureola resplandeciente del Sol
    const coronaGeometry = new THREE.SphereGeometry(62, 64, 64);
    const coronaMaterial = new THREE.MeshBasicMaterial({
        color: 0xff1493,
        transparent: true,
        opacity: 0.25,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
    sun.add(corona);

    // Aureola de luz dorada exterior
    const glowGeometry = new THREE.SphereGeometry(80, 64, 64);
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff8c00,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    // Nombre flotante sobre el Sol
    sunLabel = createTextLabel("Katia Yesenia", 36, "#FFD700");
    sunLabel.position.set(0, 75, 0);
    sunLabel.userData.clickable = true;
    sunLabel.userData.type = 'sun';
    scene.add(sunLabel);
}

// Crear planetas con atmósferas y órbitas brillantes
function createPlanets() {
    PLANETS_CONFIG.forEach((config, i) => {
        const geometry = new THREE.SphereGeometry(config.size, 32, 32);
        const material = createPlanetTextureMaterial(config.size * 10, config.color, config.pattern);
        const planet = new THREE.Mesh(geometry, material);
        
        planet.userData.clickable = true;
        planet.userData.type = 'planet';
        planet.userData.message = romanticMessages[i % romanticMessages.length];
        planet.userData.name = config.name;
        planet.userData.size = config.size;
        
        // Posicionar el planeta en su órbita
        const angle = Math.random() * Math.PI * 2;
        planet.position.set(Math.cos(angle) * config.distance, 0, Math.sin(angle) * config.distance);
        scene.add(planet);

        // Añadir atmósfera de color brillante
        createPlanetAtmosphere(planet, config.color);

        // Añadir nombre flotante
        const label = createTextLabel(config.name, 18, "#FFFFFF");
        label.position.set(0, config.size + 8, 0);
        planet.add(label);

        // Órbita brillante de neón
        const orbitGeometry = new THREE.RingGeometry(config.distance - 0.4, config.distance + 0.4, 128);
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: config.color,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending
        });
        const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
        orbit.rotation.x = Math.PI / 2;
        scene.add(orbit);

        // Añadir Lunas si están configuradas
        if (config.hasMoon) {
            const moonGeo = new THREE.SphereGeometry(config.size * 0.35, 16, 16);
            const moonMat = new THREE.MeshPhongMaterial({
                color: 0xcccccc,
                emissive: 0x333333
            });
            const moon = new THREE.Mesh(moonGeo, moonMat);
            moon.position.x = config.size + 12;
            planet.add(moon);
            planet.userData.moon = moon;
            planet.userData.moonAngle = Math.random() * Math.PI * 2;
        }

        // Añadir Anillos si están configurados
        if (config.hasRings) {
            const ringGeo = new THREE.RingGeometry(config.size * 1.3, config.size * 1.9, 64);
            const ringMat = new THREE.MeshBasicMaterial({
                color: config.color,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.rotation.x = Math.PI / 2;
            ring.rotation.y = Math.PI / 6;
            planet.add(ring);
        }

        planets.push({
            mesh: planet,
            label: label,
            distance: config.distance,
            orbitSpeed: config.orbitSpeed,
            rotationSpeed: config.rotationSpeed,
            orbitAngle: angle
        });
    });
}

function createPlanetAtmosphere(planetMesh, colorHex) {
    const size = planetMesh.userData.size;
    const geometry = new THREE.SphereGeometry(size * 1.15, 32, 32);
    const material = new THREE.MeshBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(geometry, material);
    planetMesh.add(atmosphere);
}

// Crear texturas personalizadas hermosas en canvas 2D
function createPlanetTextureMaterial(size, baseColor, pattern) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    gradient.addColorStop(0, `hsl(${(baseColor >> 16) & 0xff}, 85%, 65%)`);
    gradient.addColorStop(1, `hsl(${(baseColor >> 16) & 0xff}, 85%, 25%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
    ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
    
    switch(pattern) {
        case "stripes":
            for (let i = 0; i < size; i += 12) {
                ctx.fillRect(0, i, size, 4);
            }
            break;
        case "spots":
            for (let i = 0; i < 15; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 12 + 4, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case "rings":
            for (let i = 0; i < 4; i++) {
                ctx.beginPath();
                ctx.arc(size/2, size/2, (i + 1) * (size / 8), 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            break;
        case "waves":
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.arc(size/2, size/2, (i + 1) * (size / 10), 0, Math.PI * 2);
                ctx.stroke();
            }
            break;
        case "cracks":
            ctx.lineWidth = 1.5;
            for (let i = 0; i < 12; i++) {
                ctx.beginPath();
                ctx.moveTo(Math.random() * size, Math.random() * size);
                ctx.lineTo(Math.random() * size, Math.random() * size);
                ctx.stroke();
            }
            break;
        case "swirls":
            ctx.lineWidth = 2;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 20 + 8, 0, Math.PI * 1.5);
                ctx.stroke();
            }
            break;
        case "grid":
            ctx.lineWidth = 1;
            for (let i = 0; i < size; i += 20) {
                ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, size); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(size, i); ctx.stroke();
            }
            break;
        case "dots":
            for (let i = 0; i < 40; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 3 + 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            break;
        case "mix":
            // Mezcla de puntos y anillos concéntricos
            for (let i = 0; i < 10; i++) {
                ctx.beginPath();
                ctx.arc(Math.random() * size, Math.random() * size, Math.random() * 8 + 3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    return new THREE.MeshPhongMaterial({
        map: texture,
        shininess: 30,
        bumpScale: 0.05
    });
}

// Crear un cometa
function createComet() {
    const cometCoreGeometry = new THREE.SphereGeometry(8, 16, 16);
    const cometCoreMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const cometCore = new THREE.Mesh(cometCoreGeometry, cometCoreMaterial);
    cometCore.userData.clickable = true;
    cometCore.userData.type = 'comet';

    const trailParticleCount = 100;
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = new Float32Array(trailParticleCount * 3);
    const trailSizes = new Float32Array(trailParticleCount);
    const trailAlphas = new Float32Array(trailParticleCount);

    for (let i = 0; i < trailParticleCount; i++) {
        trailPositions[i * 3] = (Math.random() - 0.5) * 10;
        trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        trailPositions[i * 3 + 2] = -Math.random() * 50;
        trailSizes[i] = Math.random() * 12 + 6;
        trailAlphas[i] = Math.random() * 0.8 + 0.2;
    }
    trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('size', new THREE.Float32BufferAttribute(trailSizes, 1));
    trailGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute(trailAlphas, 1));

    const particleTexture = createCircularGlowTexture();
    
    const trailMaterial = new THREE.ShaderMaterial({
        uniforms: {
            color: { value: new THREE.Color(0xff69b4) }, // Rastro rosa brillante
            pointTexture: { value: particleTexture }
        },
        vertexShader: `
            attribute float size;
            attribute float alpha;
            varying float vAlpha;
            void main() {
                vAlpha = alpha;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            uniform sampler2D pointTexture;
            varying float vAlpha;
            void main() {
                gl_FragColor = vec4(color, vAlpha * texture2D(pointTexture, gl_PointCoord).a);
            }
        `,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false
    });
    const trailParticles = new THREE.Points(trailGeometry, trailMaterial);

    comet = new THREE.Group();
    comet.add(cometCore);
    comet.add(trailParticles);
    comet.userData.trailParticles = trailParticles;
    comet.userData.clickable = true;
    comet.userData.type = 'comet';

    const cometText = createTextLabel("Siempre contigo mi amor", 22, "#FFFFFF");
    comet.add(cometText);
    cometText.position.set(0, 0, 20);

    resetCometPosition();
    scene.add(comet);
}

function resetCometPosition() {
    const initialDistance = 1500;
    const startZ = camera.position.z - initialDistance;
    const startY = (Math.random() * 200) + 50;
    const startX = (Math.random() > 0.5 ? 1 : -1) * (initialDistance + Math.random() * 200);

    comet.position.set(startX, startY, startZ);

    comet.userData.speedX = -Math.sign(startX) * (2 + Math.random() * 2.0);
    comet.userData.speedY = (Math.random() - 0.5) * 3;
    comet.userData.speedZ = (2.5 + Math.random() * 2.0);

    comet.userData.life = 0;
    comet.userData.maxLife = 5000;
}

// Crear texto flotante como Sprite
function createTextLabel(message, size = 24, color = "#FFD700") {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${size}px 'Outfit', sans-serif`;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 5;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(message, canvas.width / 2, canvas.height / 2);
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(150, 75, 1);
    return sprite;
}

// Explosión de amor con partículas de estrellas brillantes doradas
function createLoveExplosion() {
    const explosionParticleCount = 200;
    const explosionGeometry = new THREE.BufferGeometry();
    const explosionPositions = new Float32Array(explosionParticleCount * 3);
    const explosionColors = new Float32Array(explosionParticleCount * 3);
    const explosionSizes = new Float32Array(explosionParticleCount);
    const explosionSpeeds = new Float32Array(explosionParticleCount * 3);

    const color = new THREE.Color(0xffd700); // Color dorado
    
    for (let i = 0; i < explosionParticleCount; i++) {
        explosionPositions[i * 3] = sun.position.x;
        explosionPositions[i * 3 + 1] = sun.position.y;
        explosionPositions[i * 3 + 2] = sun.position.z;

        explosionColors[i * 3] = color.r;
        explosionColors[i * 3 + 1] = color.g * (0.8 + Math.random() * 0.2);
        explosionColors[i * 3 + 2] = 0.2;

        explosionSizes[i] = Math.random() * 25 + 15;

        // Vector de velocidad esférico
        const u = Math.random();
        const v = Math.random();
        const theta = u * 2.0 * Math.PI;
        const phi = Math.acos(2.0 * v - 1.0);
        const r = 20 + Math.random() * 30; // Fuerza de la explosión

        explosionSpeeds[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
        explosionSpeeds[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * r;
        explosionSpeeds[i * 3 + 2] = Math.cos(phi) * r;
    }

    explosionGeometry.setAttribute('position', new THREE.BufferAttribute(explosionPositions, 3));
    explosionGeometry.setAttribute('color', new THREE.BufferAttribute(explosionColors, 3));
    explosionGeometry.setAttribute('size', new THREE.Float32BufferAttribute(explosionSizes, 1));

    const particleTexture = createCircularGlowTexture();
    
    const explosionMaterial = new THREE.PointsMaterial({
        size: 35,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        depthWrite: false
    });

    const explosion = new THREE.Points(explosionGeometry, explosionMaterial);
    explosion.userData.life = 0;
    explosion.userData.maxLife = 150;
    explosion.userData.speeds = explosionSpeeds;
    
    scene.add(explosion);
    explosionParticles.push(explosion);
}

// Crear constelación de letras T-A-V-M
function createConstellation() {
    removeConstellation();
    
    const letterPoints = {
        'T': [
            new THREE.Vector3(-1000, 400, -800),
            new THREE.Vector3(-1000, 100, -800),
            new THREE.Vector3(-1100, 400, -800),
            new THREE.Vector3(-900, 400, -800)
        ],
        'A': [
            new THREE.Vector3(-500, 100, 500),
            new THREE.Vector3(-400, 400, 500),
            new THREE.Vector3(-300, 100, 500),
            new THREE.Vector3(-450, 250, 500),
            new THREE.Vector3(-350, 250, 500)
        ],
        'V': [
            new THREE.Vector3(200, 400, -300),
            new THREE.Vector3(300, 100, -300),
            new THREE.Vector3(400, 400, -300),
            new THREE.Vector3(350, 250, -300)
        ],
        'M': [
            new THREE.Vector3(700, 100, 600),
            new THREE.Vector3(800, 400, 600),
            new THREE.Vector3(900, 200, 600),
            new THREE.Vector3(1000, 400, 600),
            new THREE.Vector3(1100, 100, 600)
        ]
    };
    
    const color = new THREE.Color('#' + currentColor);
    
    for (const letter in letterPoints) {
        const points = letterPoints[letter];
        
        points.forEach(point => {
            const starGeometry = new THREE.SphereGeometry(10, 16, 16);
            const starMaterial = new THREE.MeshBasicMaterial({ 
                color: color,
                transparent: true,
                opacity: 0.9,
                blending: THREE.AdditiveBlending
            });
            const star = new THREE.Mesh(starGeometry, starMaterial);
            star.position.copy(point);
            scene.add(star);
            constellationPoints.push(star);
        });
        
        if (letter === 'T') {
            createConstellationLine(points[0], points[1], color);
            createConstellationLine(points[2], points[3], color);
        } else if (letter === 'A') {
            createConstellationLine(points[0], points[1], color);
            createConstellationLine(points[1], points[2], color);
            createConstellationLine(points[3], points[4], color);
        } else if (letter === 'V') {
            createConstellationLine(points[0], points[1], color);
            createConstellationLine(points[1], points[2], color);
        } else if (letter === 'M') {
            createConstellationLine(points[0], points[1], color);
            createConstellationLine(points[1], points[2], color);
            createConstellationLine(points[2], points[3], color);
            createConstellationLine(points[3], points[4], color);
        }
    }
    
    constellationVisible = true;
}

function createConstellationLine(point1, point2, color) {
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
        point1.x, point1.y, point1.z,
        point2.x, point2.y, point2.z
    ]), 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6,
        linewidth: 4,
        blending: THREE.AdditiveBlending
    });
    
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    constellationLines.push(line);
}

function removeConstellation() {
    constellationLines.forEach(line => scene.remove(line));
    constellationLines = [];
    constellationPoints.forEach(point => scene.remove(point));
    constellationPoints = [];
    constellationVisible = false;
}
