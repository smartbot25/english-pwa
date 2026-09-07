const CACHE_NAME = 'english-pwa-v1';
const OFFLINE_URL = 'offline.html';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/offline.html',
    '/manifest.json',
    '/css/styles.css',
    '/js/app.js',
    '/js/lessons.js',
    '/js/speech.js',
    '/js/storage.js',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Install - precache app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Precaching app shell');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate - cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch - network first with cache fallback
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(OFFLINE_URL))
        );
    } else {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
    }
});

// Background sync for practice data
self.addEventListener('sync', (event) => {
    if (event.tag === 'save-practice') {
        event.waitUntil(savePracticeData());
    }
});

async function savePracticeData() {
    // Logic para sincronizar datos cuando haya conexión
    console.log('Syncing practice data...');
}