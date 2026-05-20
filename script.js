/* ============================================================
   Radio Serviclic — +51986661093 
   ============================================================ */

const STREAM_URL = 'https://radios03.audiostreaming.ar/9128/stream';
const METADATA_API = 'https://radios03.audiostreaming.ar/cp/get_info.php?p=9128'; // Posible endpoint, verificar

const audio = new Audio(STREAM_URL);

/* ---------- RELOJ ---------- */
function updateClock() {
    const now = new Date();
    const dateOpts = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };

    document.getElementById('clock-date').textContent =
        now.toLocaleDateString('es-ES', dateOpts);

    document.getElementById('clock-time').textContent =
        now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
}

updateClock();
setInterval(updateClock, 1000);


/* ---------- TEMA CLARO / OSCURO ---------- */
let isDark = true;

document.getElementById('btn-theme').addEventListener('click', () => {
    isDark = !isDark;
    document.body.classList.toggle('light', !isDark);
    document.getElementById('icon-sun').style.display = isDark ? '' : 'none';
    document.getElementById('icon-moon').style.display = isDark ? 'none' : '';
});


/* ---------- PLAY / PAUSE ---------- */
let isPlaying = false;

const wave1 = document.querySelector('.wave1');
const wave2 = document.querySelector('.wave2');

document.getElementById('btn-play').addEventListener('click', () => {
    if (!isPlaying) {
        audio.play().then(() => {
            isPlaying = true;
            updatePlayIcon();
        }).catch(error => {
            console.error("Error al reproducir audio:", error);
        });
    } else {
        audio.pause();
        isPlaying = false;
        updatePlayIcon();
    }
});

function updatePlayIcon() {
    document.getElementById('icon-play').style.display = isPlaying ? 'none' : '';
    document.getElementById('icon-pause').style.display = isPlaying ? '' : 'none';

    wave1.classList.toggle('playing', isPlaying);
    wave2.classList.toggle('playing', isPlaying);
}


/* ---------- VOLUMEN & MUTE ---------- */
let isMuted = false;

const slider = document.getElementById('volume-slider');
const pctEl = document.getElementById('vol-pct');
const iconVol = document.getElementById('icon-vol');
const iconMute = document.getElementById('icon-mute');

/**
 * Sincroniza el texto del porcentaje y los iconos de volumen.
 * @param {string|number} val   - Valor actual del slider (0-100).
 * @param {boolean}       muted - Si el audio está silenciado.
 */
function syncVolume(val, muted) {
    pctEl.textContent = muted ? '0%' : val + '%';
    const showMute = muted || +val === 0;
    iconVol.style.display = showMute ? 'none' : '';
    iconMute.style.display = showMute ? '' : 'none';

    // Controlar volumen del objeto Audio
    if (audio) {
        audio.volume = val / 100;
        audio.muted = muted;
    }
}

/* Cambio de slider → actualiza porcentaje */
slider.addEventListener('input', () => {
    if (isMuted) isMuted = false;
    syncVolume(slider.value, false);
});

/* Botón mute → activa/desactiva silencio */
document.getElementById('btn-mute').addEventListener('click', () => {
    isMuted = !isMuted;
    syncVolume(slider.value, isMuted);
});


/* ---------- CORAZÓN (ME GUSTA) ---------- */
document.querySelector('.heart-btn').addEventListener('click', function () {
    const svg = this.querySelector('svg');
    const active = svg.style.fill === 'rgb(239, 68, 68)';

    svg.style.fill = active ? 'none' : '#ef4444';
    svg.style.stroke = active ? 'currentColor' : '#ef4444';
});


/* ---------- METADATOS (Título, Artista, Carátula) ---------- */

/**
 * Función para obtener y actualizar los metadatos desde una API.
 * Ajustar la lógica según la respuesta de tu servidor de streaming (Icecast, Shoutcast, Zeno, etc.)
 */
async function fetchMetadata() {
    try {
        // Ejemplo genérico. Descomentar y ajustar si tienes una API real.
        /*
        const response = await fetch(METADATA_API);
        const data = await response.json();
        
        // Supongamos que la API devuelve { artist: "...", title: "...", cover: "..." }
        if (data.artist && data.title) {
             updateTrackInfo(data.artist, data.title, data.cover);
        }
        */

        // NOTA: Muchos servicios de streaming no permiten leer metadatos directamente desde el cliente (CORS).
        // A veces se requiere un proxy o usar la API específica del proveedor (Zeno, AzuraCast, etc.)

        console.log("Buscando metadatos... (Configurar URL API)");

    } catch (error) {
        console.error("Error al obtener metadatos:", error);
    }
}

/**
 * Actualiza la información en el DOM
 * @param {string} artist 
 * @param {string} title 
 * @param {string} coverUrl (opcional)
 */
function updateTrackInfo(artist, title, coverUrl) {
    const artistEl = document.querySelector('.track-artist');
    const titleEl = document.querySelector('.track-title');
    const coverImg = document.querySelector('.cover-card img');
    const miniCover = document.querySelector('.mini-info img');
    const miniTitle = document.querySelector('.mini-info h4');

    if (artistEl) artistEl.textContent = artist;
    if (titleEl) titleEl.textContent = title;

    if (coverUrl) {
        if (coverImg) coverImg.src = coverUrl;
        if (miniCover) miniCover.src = coverUrl;
    }

    // Actualizar título en mini player también si se desea
    if (miniTitle) miniTitle.textContent = title;

    // Actualizar MediaSession (para controles de notificación/bloqueo en móviles)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: artist,
            artwork: [
                { src: coverUrl || 'https://via.placeholder.com/512', sizes: '512x512', type: 'image/png' }
            ]
        });
    }
}

// Actualizar cada 10 segundos
setInterval(fetchMetadata, 10000);
// Llamada inicial
fetchMetadata();
