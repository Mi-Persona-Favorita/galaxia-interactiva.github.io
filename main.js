// ===== VARIABLES GLOBALES Y CONTROL DE FLUJO =====

// Variables Three.js principales
let scene, camera, renderer, controls;
let planetScene, planetCamera, planetControls;

// Arreglos de entidades
let hearts = [];
let planets = [];
let explosionParticles = [];
let constellationLines = [];
let constellationPoints = [];

// Estado de la aplicación
let animationId;
let isPaused = false;
let globalSpeed = 0.5;
let lastTime = 0;
let frameCount = 0;
let fps = 60;
let constellationVisible = false;
let isInPlanetView = false;
let currentColor = 'ff1493';

// Materiales compartidos
let heartTexture, heartMat;

// Elementos de la galaxia
let sun, sunLabel, comet;

// Variables para animación fly-to de cámara
let isAnimatingCamera = false;
let camStartPos = new THREE.Vector3();
let camEndPos = new THREE.Vector3();
let camStartLook = new THREE.Vector3();
let camEndLook = new THREE.Vector3();
let camAnimProgress = 0;
let onCamAnimComplete = null;

// Reloj global
const clock = new THREE.Clock();

// ===== INICIALIZACIÓN DE LA GALAXIA =====
function initGalaxy() {
    // Configurar escena, cámara y renderizador de la Galaxia
    scene = new THREE.Scene();
    
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    camera.position.set(0, 150, 650); // Vista inicial amplia y majestuosa
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Evitar caídas de frame en pantallas 4K
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.querySelector('.main-content').appendChild(renderer.domElement);
    
    // Controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 120;
    controls.maxDistance = 1800;

    // Luces de la galaxia
    const sunLight = new THREE.PointLight(0xffffff, 2, 4000); // Luz potente del Sol
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    const ambientLight = new THREE.AmbientLight(0x1a1a3a, 0.5); // Luz de fondo cósmico azulada
    scene.add(ambientLight);

    // Luces de relleno lejanas
    const fillLight1 = new THREE.DirectionalLight(0xffb6c1, 0.3); // Luz rosa suave
    fillLight1.position.set(1, 1, 1).normalize();
    scene.add(fillLight1);

    // Cargar nubes de nebulosa y estrellas
    createNebulae();
    createStars();
    
    // Inicializar texturas de corazones flotantes
    heartTexture = createHeartTexture();
    heartMat = new THREE.SpriteMaterial({ 
        map: heartTexture, 
        transparent: true,
        color: 0xff1493,
        blending: THREE.AdditiveBlending
    });
    
    // Crear Sol, Planetas y Cometa
    createSun();
    createPlanets();
    createComet();
    
    // Inicializar corazones
    initHearts();
    
    // Inicializar el Mundo Interior (oculto en segundo plano)
    initPlanetScene();

    // Bucle principal de animación
    animate();
    
    // Eventos del sistema
    window.addEventListener("resize", onWindowResize);
    window.addEventListener("click", onClick);
    
    // Configurar paneles de control lateral
    setupControls();
}

// ===== ANIMACIÓN DEL CÁMARA (FLY-TO) =====
function flyTo(targetPosition, lookAtTarget, onComplete) {
    isAnimatingCamera = true;
    camAnimProgress = 0;
    camStartPos.copy(camera.position);
    
    // Calcular distancia de zoom óptima y altura según el tipo de objeto
    const direction = new THREE.Vector3().subVectors(camera.position, targetPosition).normalize();
    
    // Mantener la cámara a unas 110 unidades de distancia
    camEndPos.copy(targetPosition).addScaledVector(direction, 110);
    camEndPos.y += 25; // Pequeño ángulo cenital

    camStartLook.copy(controls.target);
    camEndLook.copy(lookAtTarget);
    
    onCamAnimComplete = onComplete;
}

// ===== SISTEMA DE CLICKS (RAYCASTING) =====
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick(event) {
    // Evitar que haga click en objetos 3D si interactúa con la barra lateral o modales
    if (event.target.tagName !== 'CANVAS') return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (isInPlanetView) {
        // Interacciones en el Mundo Interior
        const intersects = raycaster.intersectObjects(planetScene.children, true);
        if (intersects.length > 0) {
            const hitObj = intersects.find(obj => obj.object === bigCrystalHeart);
            if (hitObj) {
                // Hacer latir más rápido temporalmente al hacer click en el corazón central
                createLoveExplosion(); // Explosión en la galaxia (invisible aquí)
                showMessageWithTypewriter("¡Has tocado el núcleo de mi amor eterno! Late con más fuerza por ti. 💖");
            }
        }
    } else {
        // Interacciones en la Galaxia
        const intersects = raycaster.intersectObjects(scene.children, true); 
        
        if (intersects.length > 0) {
            // Encontrar si se hizo click en un objeto interactuable (Sun, Comet, o Planet)
            const clickableObject = intersects.find(obj => {
                const parent = obj.object.parent;
                return obj.object.userData.clickable || (parent && parent.userData.clickable);
            });
            
            if (clickableObject) {
                let actualObj = clickableObject.object;
                
                // Si hizo click en lunas, anillos o textos, usar el ancestro interactuable
                if (!actualObj.userData.clickable && actualObj.parent && actualObj.parent.userData.clickable) {
                    actualObj = actualObj.parent;
                }

                const type = actualObj.userData.type;
                const pos = new THREE.Vector3();
                actualObj.getWorldPosition(pos);

                if (type === 'comet' || type === 'sun') {
                    // Animación de cámara volando al Sol/Cometa
                    flyTo(pos, pos, () => {
                        showMessageWithTypewriter(cometMessage);
                    });
                } else if (type === 'planet') {
                    // Animación de cámara volando al planeta seleccionado
                    flyTo(pos, pos, () => {
                        showMessageWithTypewriter(actualObj.userData.message || romanticMessages[Math.floor(Math.random() * romanticMessages.length)]);
                    });
                }
            }
        }
    }
}

// ===== BUCLE DE ANIMACIÓN PRINCIPAL =====
function animate() {
    if (isPaused) return;

    animationId = requestAnimationFrame(animate);

    // Calcular FPS
    const now = performance.now();
    frameCount++;
    if (now >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        lastTime = now;
        frameCount = 0;
        document.getElementById('fps-counter').textContent = fps;
    }

    const time = clock.getElapsedTime();

    if (isInPlanetView) {
        // 1. Renderizar Escena del Mundo Interior
        planetControls.update();
        updateInteriorWorld(time);
        renderer.render(planetScene, planetCamera);
    } else {
        // 2. Renderizar Escena de la Galaxia
        
        // Animación fluida de cámara (Fly-To)
        if (isAnimatingCamera) {
            camAnimProgress += 0.03; // Velocidad del vuelo
            if (camAnimProgress >= 1) {
                camAnimProgress = 1;
                isAnimatingCamera = false;
                camera.position.copy(camEndPos);
                controls.target.copy(camEndLook);
                if (onCamAnimComplete) {
                    onCamAnimComplete();
                    onCamAnimComplete = null;
                }
            } else {
                // Easing cúbico para aceleración y frenado suaves
                const t = camAnimProgress * camAnimProgress * (3 - 2 * camAnimProgress);
                camera.position.lerpVectors(camStartPos, camEndPos, t);
                controls.target.lerpVectors(camStartLook, camEndLook, t);
            }
        }

        controls.update();

        // Asegurar que las etiquetas miren siempre a la cámara
        if (sunLabel) sunLabel.lookAt(camera.position);
        
        const delta = clock.getDelta();
        if (sun && sun.material && sun.material.uniforms && sun.material.uniforms.u_time) {
            sun.material.uniforms.u_time.value += delta * globalSpeed;
        }

        // Rotación y órbita de los Planetas
        planets.forEach((p) => {
            p.mesh.rotation.y += p.rotationSpeed * globalSpeed;
            p.orbitAngle += p.orbitSpeed * globalSpeed;
            p.mesh.position.set(
                Math.cos(p.orbitAngle) * p.distance, 
                0, 
                Math.sin(p.orbitAngle) * p.distance
            );

            // Rotación de las lunas alrededor de los planetas
            if (p.mesh.userData.moon) {
                const moon = p.mesh.userData.moon;
                p.mesh.userData.moonAngle += 0.05 * globalSpeed;
                const radius = p.mesh.userData.size + 10;
                moon.position.set(
                    Math.cos(p.mesh.userData.moonAngle) * radius,
                    Math.sin(p.mesh.userData.moonAngle) * 2, // Inclinación en Y
                    Math.sin(p.mesh.userData.moonAngle) * radius
                );
                moon.rotation.y += 0.03 * globalSpeed;
            }
        });

        // Rotación lenta de nebulosas y polvo estelar
        nebulae.forEach((neb, index) => {
            neb.rotation.z += 0.0002 * (index % 2 === 0 ? 1 : -1) * globalSpeed;
        });

        // Twinkle (parpadeo) de las estrellas de fondo
        if (twinklingStars && twinklingStars.material) {
            twinklingStars.material.opacity = 0.5 + Math.sin(time * 3) * 0.3;
        }
        if (stableStars) {
            stableStars.rotation.y += 0.0002 * globalSpeed;
        }

        // Movimiento de cometa
        if (comet) {
            comet.position.x += comet.userData.speedX * globalSpeed;
            comet.position.y += comet.userData.speedY * globalSpeed;
            comet.position.z += comet.userData.speedZ * globalSpeed;
            comet.userData.life++;

            // Rotar cometa para que el rastro siga su dirección
            const velocityDir = new THREE.Vector3(comet.userData.speedX, comet.userData.speedY, comet.userData.speedZ).normalize();
            comet.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), velocityDir);

            if (comet.position.z > camera.position.z + 500) {
                resetCometPosition();
            }

            const trail = comet.userData.trailParticles;
            if (trail && trail.geometry && trail.geometry.attributes) {
                const trailPositions = trail.geometry.attributes.position.array;
                const trailAlphas = trail.geometry.attributes.alpha.array;

                for (let i = 0; i < trailPositions.length / 3; i++) {
                    // Mover rastro hacia atrás en relación a su movimiento
                    trailPositions[i * 3 + 2] -= 0.5 * globalSpeed;

                    if (trailAlphas[i] < 0.03) {
                        trailPositions[i * 3] = (Math.random() - 0.5) * 6;
                        trailPositions[i * 3 + 1] = (Math.random() - 0.5) * 6;
                        trailPositions[i * 3 + 2] = -Math.random() * 40;
                        trailAlphas[i] = Math.random() * 0.8 + 0.2;
                    } else {
                        trailAlphas[i] *= 0.96;
                    }
                }
                trail.geometry.attributes.position.needsUpdate = true;
                trail.geometry.attributes.alpha.needsUpdate = true;
            }
        }

        // Corazones flotantes
        const verticalRiseSpeed = 1.8;
        hearts.forEach(heart => {
            heart.position.y += verticalRiseSpeed * globalSpeed;
            heart.userData.life++;
            
            const particles = heart.userData.particles;
            if (particles && particles.geometry && particles.geometry.attributes) {
                const positions = particles.geometry.attributes.position.array;
                const sizes = particles.geometry.attributes.size.array;

                for (let i = 0; i < particles.geometry.attributes.position.count; i++) {
                    positions[i * 3 + 1] -= 0.3 * globalSpeed; // Rastro cae
                    sizes[i] *= 0.94;
                    if (sizes[i] < 0.1) {
                        positions[i * 3] = (Math.random() - 0.5) * 6;
                        positions[i * 3 + 1] = 0;
                        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
                        sizes[i] = Math.random() * 8 + 4;
                    }
                }
                particles.geometry.attributes.position.needsUpdate = true;
                particles.geometry.attributes.size.needsUpdate = true;
            }

            if (heart.position.y > 600 || heart.userData.life > heart.userData.maxLife) {
                scene.remove(heart);
                hearts.splice(hearts.indexOf(heart), 1);
                updateHeartsCounter();
            }
        });

        // Partículas de explosión de amor
        explosionParticles.forEach((explosion, index) => {
            explosion.userData.life++;
            
            const positions = explosion.geometry.attributes.position.array;
            const speeds = explosion.userData.speeds;
            
            for (let i = 0; i < positions.length / 3; i++) {
                positions[i * 3] += speeds[i * 3] * globalSpeed * 0.1;
                positions[i * 3 + 1] += speeds[i * 3 + 1] * globalSpeed * 0.1;
                positions[i * 3 + 2] += speeds[i * 3 + 2] * globalSpeed * 0.1;
                
                speeds[i * 3] *= 0.96;
                speeds[i * 3 + 1] *= 0.96;
                speeds[i * 3 + 2] *= 0.96;
            }
            
            explosion.geometry.attributes.position.needsUpdate = true;
            explosion.material.opacity = 1 - (explosion.userData.life / explosion.userData.maxLife);
            
            if (explosion.userData.life > explosion.userData.maxLife) {
                scene.remove(explosion);
                explosionParticles.splice(index, 1);
            }
        });

        renderer.render(scene, camera);
    }
}

// ===== SISTEMA DE MÁQUINA DE ESCRIBIR EN MODAL =====
let typewriterInterval = null;

function showMessageWithTypewriter(message) {
    const modal = document.getElementById("modal");
    const messageBox = document.getElementById("modal-message");
    
    modal.style.display = "flex";
    
    // Detener cualquier animación de escritura anterior
    if (typewriterInterval) clearInterval(typewriterInterval);
    messageBox.innerHTML = ""; // Vaciar mensaje
    
    let index = 0;
    
    typewriterInterval = setInterval(() => {
        if (index < message.length) {
            messageBox.innerHTML += message.charAt(index);
            index++;
        } else {
            clearInterval(typewriterInterval);
            typewriterInterval = null;
        }
    }, 25); // Velocidad: 25ms por letra para suavidad
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
    if (typewriterInterval) {
        clearInterval(typewriterInterval);
        typewriterInterval = null;
    }
}

// ===== FUNCIONES AUXILIARES =====

function initHearts() {
    hearts.forEach(h => scene.remove(h));
    hearts = [];
    updateHeartsCounter();
}

function updateHeartsCounter() {
    document.getElementById("hearts-count").textContent = hearts.length;
}

// Crear un Corazón 3D que sube al espacio
function createHeart() {
    const heartShape = new THREE.Shape();
    const x = 0, y = 0;
    heartShape.moveTo(x, y);
    heartShape.bezierCurveTo(x - 5, y - 5, x - 10, y - 2, x - 10, y + 3);
    heartShape.bezierCurveTo(x - 10, y + 8, x - 5, y + 10, x, y + 12);
    heartShape.bezierCurveTo(x + 5, y + 10, x + 10, y + 8, x + 10, y + 3);
    heartShape.bezierCurveTo(x + 10, y - 2, x + 5, y - 5, x, y);
    
    const heartGeometry = new THREE.ShapeGeometry(heartShape);
    const heartMesh = new THREE.Mesh(heartGeometry, new THREE.MeshBasicMaterial({ 
        color: 0xff1493, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.8
    }));
    heartMesh.scale.set(1.5, 1.5, 1.5);
    heartMesh.rotation.x = Math.PI; // Invertir orientación para apuntar al piso
    
    // Crear el rastro brillante del corazón
    const particleSystem = new THREE.Group();
    const particleCount = 30;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 4;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
        sizes[i] = Math.random() * 6 + 3;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    const particleTexture = createCircularGlowTexture();
    const particleMaterial = new THREE.PointsMaterial({
        size: 10,
        map: particleTexture,
        color: 0xffe66d, // Rastro dorado
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particleSystem.add(particles);

    const group = new THREE.Group();
    group.add(heartMesh);
    group.add(particleSystem);
    group.userData.particles = particles;
    group.userData.life = 0;
    group.userData.maxLife = 400;

    // Posicionar el corazón en el piso de la galaxia aleatoriamente
    group.position.set(
        (Math.random() - 0.5) * 800,
        -250, // Iniciar abajo en la pantalla
        (Math.random() - 0.5) * 400
    );
    group.rotation.y = Math.random() * Math.PI * 2;
    
    scene.add(group);
    hearts.push(group);
    updateHeartsCounter();
}

// Alternar entre Galaxia y Mundo Interior
function togglePlanetView() {
    isInPlanetView = !isInPlanetView;
    const btn = document.getElementById("travel-btn");
    
    if (isInPlanetView) {
        btn.textContent = "🚀 Volver a la Galaxia";
        btn.style.boxShadow = "0 0 15px #ff1493";
        controls.enabled = false;
        planetControls.enabled = true;
    } else {
        btn.textContent = "🌍 Viajar al Mundo Interior";
        btn.style.boxShadow = "0 0 15px #ffa500";
        controls.enabled = true;
        planetControls.enabled = false;
    }
}

// Cambiar el color de acento y tema
function changeThemeColor(color) {
    currentColor = color;
    const colorHex = '#' + color;
    
    document.querySelector('h1').style.color = colorHex;
    document.querySelector('h1').style.textShadow = `0 0 12px ${colorHex}`;
    document.querySelector('.subtitle').style.color = colorHex + 'DD';
    document.querySelector('.footer').style.borderTopColor = colorHex;
    document.querySelector('.footer').style.color = colorHex + 'CC';
    
    document.querySelectorAll('.control-group').forEach(group => {
        group.style.borderColor = colorHex;
        group.style.boxShadow = `inset 0 0 8px ${colorHex}22`;
    });
    
    document.querySelectorAll('.color-btn').forEach(btn => {
        if (btn.getAttribute('data-color') === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    if (constellationVisible) {
        removeConstellation();
        createConstellation();
    }
}

// Redimensionar pantalla
function onWindowResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    
    planetCamera.aspect = w / h;
    planetCamera.updateProjectionMatrix();
    
    renderer.setSize(w, h);
}

// Configurar controles laterales e interacciones HTML
function setupControls() {
    // Viaje Espacial
    document.getElementById("travel-btn").addEventListener("click", togglePlanetView);
    
    // Corazones
    document.getElementById("love-btn").addEventListener("click", () => {
        for (let i = 0; i < 15; i++) {
            createHeart();
        }
    });
    document.getElementById("clear-hearts-btn").addEventListener("click", initHearts);
    
    // Cámara
    document.getElementById("reset-camera-btn").addEventListener("click", () => {
        isAnimatingCamera = false;
        camera.position.set(0, 150, 650);
        controls.reset();
        controls.target.set(0, 0, 0);
    });
    
    // Pausa
    document.getElementById("pause-play-btn").addEventListener("click", function() {
        isPaused = !isPaused;
        this.textContent = isPaused ? '▶️ Reproducir' : '⏸️ Pausar';
        if (!isPaused) animate();
    });
    
    // Efectos
    document.getElementById("comet-btn").addEventListener("click", resetCometPosition);
    document.getElementById("explosion-btn").addEventListener("click", createLoveExplosion);
    
    document.getElementById("constellation-btn").addEventListener("click", function() {
        if (constellationVisible) {
            removeConstellation();
            this.textContent = "🔭 Mostrar Constelación";
        } else {
            createConstellation();
            this.textContent = "🔭 Ocultar Constelación";
        }
    });
    
    // Sliders
    document.getElementById("global-speed").addEventListener("input", function() {
        globalSpeed = parseFloat(this.value);
    });
    
    // Modal
    document.getElementById("close-btn").addEventListener("click", closeModal);
    
    document.getElementById("new-message-btn").addEventListener("click", function() {
        const messageBox = document.getElementById("modal-message");
        const currentMessage = messageBox.textContent;
        let newMessage = currentMessage;
        while (newMessage === currentMessage) {
            newMessage = romanticMessages[Math.floor(Math.random() * romanticMessages.length)];
        }
        showMessageWithTypewriter(newMessage);
    });
    
    // Botones de colores del tema
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            changeThemeColor(this.getAttribute('data-color'));
        });
    });

    // Comunicador Especial
    document.getElementById("comunicador-btn").addEventListener("click", function() {
        document.getElementById("comunicadorOverlay").style.display = "flex";
    });

    document.getElementById("abrirDocumentoBtn").addEventListener("click", function() {
        document.getElementById("docIframe").src = SPECIAL_DOC_URL;
        document.getElementById("docViewer").style.display = "block";
        document.getElementById("comunicadorOverlay").style.display = "none";
    });

    document.getElementById("closeComunicadorBtn").addEventListener("click", function() {
        document.getElementById("docViewer").style.display = "none";
        document.getElementById("docIframe").src = "";
    });

    // Tooltip
    const tooltip = document.getElementById('tooltip');
    document.querySelectorAll('.btn, .slider, .modal-btn, .color-btn').forEach(element => {
        element.addEventListener('mouseover', (e) => {
            tooltip.textContent = e.target.title || e.target.parentElement.title;
            tooltip.style.opacity = '1';
            tooltip.style.left = (e.pageX + 12) + 'px';
            tooltip.style.top = (e.pageY + 12) + 'px';
        });
        
        element.addEventListener('mousemove', (e) => {
            tooltip.style.left = (e.pageX + 12) + 'px';
            tooltip.style.top = (e.pageY + 12) + 'px';
        });
        
        element.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });
    });
}
