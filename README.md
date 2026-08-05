# Galaxia Interactiva Katia Yesenia 🌌💖

Una experiencia web interactiva en 3D creada con HTML, CSS, JavaScript y la biblioteca tridimensional **Three.js**. Este proyecto incluye un sistema de acceso interactivo (login con animación de corazón) y una galaxia interactiva con planetas orbitantes, estrellas tridimensionales, constelaciones, cometas y mensajes secretos románticos.

---

## 📁 Estructura del Proyecto

Los archivos necesarios se han dividido de forma modular para un desarrollo limpio, estructurado y fácil despliegue:

*   **`index.html`**: Estructura base del sitio web y punto de entrada principal. Enlaza el CSS y los scripts de forma secuencial.
*   **`index.css`**: Hoja de estilos completa con diseño premium *glassmorphism*, sliders de neón y efectos adaptables.
*   **`config.js`**: Base de datos de mensajes románticos, configuraciones individuales de planetas y credenciales.
*   **`login.js`**: Manejo de la pantalla de inicio de sesión y la animación del fondo de partículas interactivas de corazones.
*   **`galaxy.js`**: Toda la simulación tridimensional del espacio (nebulosas, estrellas parpadeantes, sol, órbitas y planetas).
*   **`interior.js`**: Lógica de la escena del "Mundo Interior" (cielo nocturno, pradera de luces flotantes, árboles de cristal y el corazón latiente).
*   **`main.js`**: Bucle principal de renderizado, controladores de controles HTML, eventos de ventana y la animación suave de cámara.
*   **`README.md`**: Esta documentación explicativa con las instrucciones de uso y subida a GitHub.

---

## 🚀 Cómo Subir y Publicar en GitHub (GitHub Pages)

Para subir esta página a tu repositorio de GitHub y habilitar **GitHub Pages** (lo que te dará un enlace web público para compartir), sigue estos sencillos pasos:

### Paso 1: Crear un nuevo repositorio en GitHub
1. Inicia sesión en tu cuenta de [GitHub](https://github.com).
2. Haz clic en el botón **New** (Nuevo) o ve a [github.com/new](https://github.com/new).
3. Escribe un nombre para tu repositorio (por ejemplo: `galaxia-interactiva`).
4. Déjalo en modo **Public** (Público) para que GitHub Pages pueda hospedar tu sitio de manera gratuita.
5. **No** selecciones "Add a README file" ni "Add .gitignore" (ya tenemos nuestro propio README).
6. Haz clic en **Create repository** (Crear repositorio).

### Paso 2: Subir los archivos
Tienes dos métodos para subir los archivos:

#### Método A: Arrastrar y soltar (Sin usar la terminal)
1. En la página de tu nuevo repositorio en GitHub, haz clic en el enlace que dice **"uploading an existing file"** (subir un archivo existente).
2. Abre la carpeta `galaxia-interactiva` en tu computadora.
3. Selecciona los siguientes **8 archivos**:
   - `index.html`
   - `index.css`
   - `config.js`
   - `login.js`
   - `galaxy.js`
   - `interior.js`
   - `main.js`
   - `README.md`
4. Arrástralos y suéltalos en la zona de carga de GitHub.
5. Espera a que termine de cargarse y haz clic en el botón verde **Commit changes** (Confirmar cambios).

#### Método B: Usando Git desde la consola (Si tienes Git instalado)
1. Abre tu terminal de Git (Git Bash o Command Prompt) en la carpeta `galaxia-interactiva`:
   ```bash
   git init
   git add .
   git commit -m "Primer commit: Galaxia Interactiva modular"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
   *(Reemplaza `TU_USUARIO` y `TU_REPOSITORIO` por los tuyos).*

---

### Paso 3: Activar GitHub Pages 🌐
Una vez que los archivos estén subidos en tu repositorio de GitHub:
1. Ve a la pestaña **Settings** (Configuración) en la barra superior de tu repositorio.
2. En el menú lateral izquierdo, en la sección "Code and automation", haz clic en **Pages**.
3. En la sección **Build and deployment**:
   - Bajo **Source**, asegúrate de que esté seleccionado **Deploy from a branch**.
   - Bajo **Branch**, cambia el valor a **`main`** (o `master`) y la carpeta déjala en **`/ (root)`**.
4. Haz clic en el botón **Save** (Guardar).
5. Espera aproximadamente 1 o 2 minutos. Actualiza la página de Pages y verás un mensaje en la parte superior con tu dirección URL pública:
   > **"Your site is live at: https://tu-usuario.github.io/tu-repositorio/"**

---

## 🛠️ Cómo abrir y probar el proyecto en tu computadora
1. Simplemente haz doble clic en el archivo `index.html` para abrirlo en cualquier navegador web moderno (Google Chrome, Firefox, Microsoft Edge, Safari).
2. Ingresa la contraseña correspondiente para acceder a la galaxia:
   *   **Contraseña de acceso:** `Bendito2206`
3. ¡Interactúa con los controles laterales para lanzar cometas, provocar explosiones estelares y viajar por el espacio!
