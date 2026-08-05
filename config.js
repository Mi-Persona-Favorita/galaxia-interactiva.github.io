// ===== CONFIGURACIONES GLOBALES DE LA GALAXIA =====

// Credenciales del sistema
const GALAXY_CREDENTIALS = {
    username: "", // Permite cualquier usuario
    password: "Bendito2206"
};

// Mensajes románticos para los planetas y el modal
const romanticMessages = [
    "Eres el latido más hermoso de mi corazón 💖",
    "Cada día contigo es un regalo del universo ✨",
    "Tu sonrisa ilumina mis galaxias 🌌",
    "Espero que te encante mi galaxia romántica ❤️",
    "En tus ojos encuentro mi infinito 🌠",
    "Eres la melodía más dulce de mi vida 🎶",
    "Mi mundo gira solo alrededor de ti 🌍",
    "Eres el amor que nunca dejaré de cuidar 🌹",
    "Eres más brillante que todas mis estrellas juntas ✨",
    "Mi amor por ti es más vasto que esta galaxia 💫"
];

// Mensaje secreto especial del cometa
const cometMessage = "Mi amor, hoy y siempre, en cada estrella, en cada planeta, en cada latido, mi corazón late por ti. Que este universo que he creado sea un pequeño reflejo de la inmensidad de mi amor por ti. ¡Feliz día del amor y la amistad! Te amo con todo mi ser.";

// URL del documento de mensaje especial
const SPECIAL_DOC_URL = "https://docs.google.com/document/d/1Ra7TIKJKuIbjm16MZ0C9dy25kCyHYYh2sqrRU-IWEyU/edit?pli=1&tab=t.0";

// Configuración de los Planetas
const PLANETS_CONFIG = [
    { name: "Eres mi sol", size: 8, distance: 100, rotationSpeed: 0.005, orbitSpeed: 0.001, color: 0xff6b6b, pattern: "radial" },
    { name: "Mi amor eterno", size: 10, distance: 150, rotationSpeed: 0.0055, orbitSpeed: 0.0012, color: 0x4ecdc4, pattern: "stripes", hasMoon: true },
    { name: "La más hermosa", size: 12, distance: 200, rotationSpeed: 0.006, orbitSpeed: 0.0014, color: 0xffe66d, pattern: "spots" },
    { name: "Mi estrella brillante", size: 14, distance: 250, rotationSpeed: 0.0065, orbitSpeed: 0.0016, color: 0x6a0572, pattern: "rings", hasRings: true },
    { name: "Mi vida", size: 16, distance: 300, rotationSpeed: 0.007, orbitSpeed: 0.0018, color: 0x5fa8d3, pattern: "waves", hasMoon: true },
    { name: "Mi universo", size: 18, distance: 350, rotationSpeed: 0.0075, orbitSpeed: 0.002, color: 0xf79d65, pattern: "cracks" },
    { name: "Te amo", size: 20, distance: 400, rotationSpeed: 0.008, orbitSpeed: 0.0022, color: 0x5c80bc, pattern: "swirls", hasRings: true },
    { name: "Siempre tú", size: 22, distance: 450, rotationSpeed: 0.0085, orbitSpeed: 0.0024, color: 0x9be564, pattern: "grid" },
    { name: "Mi luz", size: 24, distance: 500, rotationSpeed: 0.009, orbitSpeed: 0.0026, color: 0xf25c54, pattern: "dots" },
    { name: "Mi corazón", size: 26, distance: 550, rotationSpeed: 0.0095, orbitSpeed: 0.0028, color: 0xbc00dd, pattern: "mix" }
];

// Genera una textura de brillo circular de forma procedimental para evitar problemas de CORS locales.
function createCircularGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    return new THREE.CanvasTexture(canvas);
}
