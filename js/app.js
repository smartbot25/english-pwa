// Estado global de la app
const AppState = {
    currentSection: 'home',
    currentPracticeMode: 'speaking',
    installPrompt: null,
    isOnline: navigator.onLine
};

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    await StorageManager.init();
    await SpeechManager.init();
    await LessonsManager.init();
    
    setupNavigation();
    setupPracticeModes();
    setupInstallPrompt();
    setupConnectionListener();
    updateStats();
    
    // Registrar service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker registrado'));
    }
});

// Navegación entre secciones
function setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const section = btn.dataset.section;
            navigateTo(section);
        });
    });
    
    document.getElementById('start-learning').addEventListener('click', () => {
        navigateTo('lessons');
    });
}

function navigateTo(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    document.getElementById(section).classList.add('active');
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    AppState.currentSection = section;
}

// Modos de práctica
function setupPracticeModes() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            setPracticeMode(mode);
        });
    });
    
    setPracticeMode('speaking');
}

async function setPracticeMode(mode) {
    AppState.currentPracticeMode = mode;
    
    document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    
    const practiceArea = document.getElementById('practice-area');
    
    switch(mode) {
        case 'speaking':
            practiceArea.innerHTML = await SpeechManager.getSpeakingExercise();
            break;
        case 'listening':
            practiceArea.innerHTML = await SpeechManager.getListeningExercise();
            break;
        case 'writing':
            practiceArea.innerHTML = await LessonsManager.getWritingExercise();
            break;
        case 'reading':
            practiceArea.innerHTML = await LessonsManager.getReadingExercise();
            break;
    }
}

// Prompt de instalación PWA
function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        AppState.installPrompt = e;
        document.getElementById('install-prompt').classList.remove('hidden');
    });
    
    document.getElementById('install-btn').addEventListener('click', async () => {
        if (AppState.installPrompt) {
            AppState.installPrompt.prompt();
            const { outcome } = await AppState.installPrompt.userChoice;
            console.log(`Install ${outcome}`);
            AppState.installPrompt = null;
            document.getElementById('install-prompt').classList.add('hidden');
        }
    });
    
    document.getElementById('dismiss-install').addEventListener('click', () => {
        document.getElementById('install-prompt').classList.add('hidden');
    });
}

// Listener de conexión
function setupConnectionListener() {
    window.addEventListener('online', () => {
        document.getElementById('connection-status').textContent = '● Online';
        document.getElementById('connection-status').className = 'status online';
        AppState.isOnline = true;
    });
    
    window.addEventListener('offline', () => {
        document.getElementById('connection-status').textContent = '● Offline';
        document.getElementById('connection-status').className = 'status offline';
        AppState.isOnline = false;
    });
}

// Actualizar estadísticas
function updateStats() {
    const stats = StorageManager.getStats();
    document.getElementById('total-lessons').textContent = stats.lessonsCompleted;
    document.getElementById('words-learned').textContent = stats.wordsLearned;
    document.getElementById('practice-time').textContent = stats.practiceMinutes;
}

// Exportar para otros módulos
window.AppState = AppState;
window.navigateTo = navigateTo;
window.setPracticeMode = setPracticeMode;
window.updateStats = updateStats;
