// ===== SISTEMA DE ACCESO INTERACTIVO (LOGIN) =====

document.addEventListener("DOMContentLoaded", () => {
    initLoginBackground();
    setupLoginForm();
});

// Inicializar el fondo animado de corazones del Login
function initLoginBackground() {
    const canvas = document.getElementById("loginBackgroundCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const particleCount = 60;
    const mouse = { x: null, y: null, radius: 100 };

    // Redimensionar canvas
    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Detectar movimiento del ratón
    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Clase para partículas de corazones y estrellas
    class CosmicParticle {
        constructor() {
            this.reset();
            this.y = Math.random() * height; // Iniciar en puntos aleatorios al principio
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 20; // Iniciar justo abajo
            this.size = Math.random() * 12 + 4;
            this.speedX = (Math.random() - 0.5) * 1;
            this.speedY = -(Math.random() * 1.5 + 0.5);
            this.type = Math.random() > 0.4 ? "heart" : "star";
            this.color = this.type === "heart" 
                ? `hsla(${340 + Math.random() * 20}, 100%, 75%, ${Math.random() * 0.4 + 0.3})`
                : `hsla(${50 + Math.random() * 20}, 100%, 80%, ${Math.random() * 0.5 + 0.3})`;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = (Math.random() - 0.5) * 0.02;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.angle) * 0.2;
            this.angle += this.spin;

            // Reacción al ratón (repulsión suave)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x += (dx / distance) * force * 3;
                    this.y += (dy / distance) * force * 3;
                }
            }

            // Si sale de la pantalla, reiniciar
            if (this.y < -20 || this.x < -20 || this.x > width + 20) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = this.color;
            ctx.shadowBlur = this.size / 2;
            ctx.shadowColor = this.color;

            if (this.type === "heart") {
                // Dibujar corazón 2D
                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Lado izquierdo del corazón
                ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, -this.size/4, -this.size, this.size/4);
                ctx.bezierCurveTo(-this.size, this.size*0.7, -this.size/4, this.size*0.9, 0, this.size*1.3);
                // Lado derecho del corazón
                ctx.bezierCurveTo(this.size/4, this.size*0.9, this.size, this.size*0.7, this.size, this.size/4);
                ctx.bezierCurveTo(this.size, -this.size/4, this.size/2, -this.size/2, 0, 0);
                ctx.fill();
            } else {
                // Dibujar estrella brillante
                ctx.beginPath();
                for (let i = 0; i < 4; i++) {
                    ctx.lineTo(0, -this.size);
                    ctx.rotate(Math.PI / 4);
                    ctx.lineTo(0, -this.size / 3);
                    ctx.rotate(Math.PI / 4);
                }
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Inicializar el arreglo de partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push(new CosmicParticle());
    }

    // Loop de animación del canvas
    function animateBackground() {
        ctx.fillStyle = "rgba(10, 10, 25, 0.2)"; // Color oscuro cósmico con estela
        ctx.fillRect(0, 0, width, height);

        // Dibujar un gradiente radial sutil para simular el brillo galáctico
        const grad = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height));
        grad.addColorStop(0, "rgba(255, 20, 147, 0.05)");
        grad.addColorStop(0.5, "rgba(138, 43, 226, 0.02)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        particles.forEach((p) => {
            p.update();
            p.draw();
        });

        requestAnimationFrame(animateBackground);
    }

    animateBackground();
}

// Configurar el formulario de Login y sus efectos de sonido/animaciones
function setupLoginForm() {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const messageDiv = document.getElementById("message");
        const heartLock = document.querySelector(".heart-lock");

        // Limpiar mensajes anteriores
        messageDiv.style.display = "none";
        messageDiv.className = "message";

        if (password === GALAXY_CREDENTIALS.password) {
            // ÉXITO
            messageDiv.textContent = `¡Inicio de sesión exitoso! Abriendo tu universo, ${username || "amor"}...`;
            messageDiv.classList.add("success");
            messageDiv.style.display = "block";

            // Animación de desbloqueo premium
            heartLock.classList.add("unlocked");
            
            // Añadir destello de neón al desbloquear
            const keyhole = document.querySelector(".lock-keyhole");
            if (keyhole) {
                keyhole.style.boxShadow = "0 0 30px #ffd700, 0 0 60px #ff1493";
                keyhole.style.background = "#ffd700";
            }

            // Desvanecer el panel de login suavemente y cargar la galaxia
            setTimeout(() => {
                const loginContainer = document.getElementById("loginContainer");
                loginContainer.style.transition = "opacity 1.5s ease, transform 1.5s ease";
                loginContainer.style.opacity = "0";
                loginContainer.style.transform = "scale(1.1)";
                
                // Mostrar contenedor de la galaxia con fade-in
                const galaxyContainer = document.getElementById("galaxyContainer");
                galaxyContainer.style.display = "flex";
                galaxyContainer.style.opacity = "0";
                
                setTimeout(() => {
                    loginContainer.style.display = "none";
                    galaxyContainer.style.transition = "opacity 1.5s ease";
                    galaxyContainer.style.opacity = "1";
                    
                    // Inicializar la galaxia en 3D
                    if (typeof initGalaxy === "function") {
                        initGalaxy();
                    }
                }, 1000);
            }, 1800);

        } else {
            // ERROR
            messageDiv.textContent = "Contraseña incorrecta. Inténtalo de nuevo, mi amor.";
            messageDiv.classList.add("error");
            messageDiv.style.display = "block";

            // Animación de denegación (sacudida)
            const formContainer = document.querySelector(".login-form");
            formContainer.classList.add("shake-animation");
            setTimeout(() => {
                formContainer.classList.remove("shake-animation");
            }, 500);

            heartLock.classList.remove("unlocked");
        }
    });

    // Soporte para pruebas automatizadas (Auto-login)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('autologin') === '1') {
        document.getElementById("username").value = "Tester";
        document.getElementById("password").value = GALAXY_CREDENTIALS.password;
        setTimeout(() => {
            loginForm.dispatchEvent(new Event('submit'));
        }, 500);
    }
}
