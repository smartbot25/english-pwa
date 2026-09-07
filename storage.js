const StorageManager = {
    DB_NAME: 'EnglishPWA',
    DB_VERSION: 1,
    db: null,

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
            
            request.onerror = () => reject(request.error);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('progress')) {
                    db.createObjectStore('progress', { keyPath: 'id', autoIncrement: true });
                }
                
                if (!db.objectStoreNames.contains('lessons')) {
                    db.createObjectStore('lessons', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                this.initializeDefaultData();
                resolve();
            };
        });
    },

    async initializeDefaultData() {
        const stats = await this.getStats();
        if (stats.lessonsCompleted === 0 && stats.wordsLearned === 0) {
            // Primer uso - inicializar datos por defecto
            await this.saveLessonProgress(1, false);
        }
    },

    async saveProgress(skill, count = 1) {
        const transaction = this.db.transaction(['progress'], 'readwrite');
        const store = transaction.objectStore('progress');
        
        const record = {
            skill,
            count,
            timestamp: new Date().toISOString()
        };
        
        store.add(record);
        
        // Actualizar estadísticas
        this.updateStatsCache(skill, count);
    },

    async getStats() {
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['progress'], 'readonly');
            const store = transaction.objectStore('progress');
            const request = store.getAll();
            
            request.onsuccess = () => {
                const records = request.result || [];
                const stats = {
                    lessonsCompleted: records.filter(r => r.skill === 'lesson').length,
                    wordsLearned: records.filter(r => r.skill === 'vocabulary').length,
                    practiceMinutes: Math.floor(records.length / 10), // Estimado
                    speaking: records.filter(r => r.skill === 'speaking').length,
                    listening: records.filter(r => r.skill === 'listening').length,
                    writing: records.filter(r => r.skill === 'writing').length,
                    reading: records.filter(r => r.skill === 'reading').length
                };
                resolve(stats);
            };
            
            request.onerror = () => resolve({ lessonsCompleted: 0, wordsLearned: 0, practiceMinutes: 0 });
        });
    },

    async getLessons() {
        return new Promise((resolve) => {
            const transaction = this.db.transaction(['lessons'], 'readonly');
            const store = transaction.objectStore('lessons');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
        });
    },

    async saveLessonProgress(lessonId, completed) {
        const transaction = this.db.transaction(['lessons'], 'readwrite');
        const store = transaction.objectStore('lessons');
        
        const lesson = {
            id: lessonId,
            completed,
            completedAt: completed ? new Date().toISOString() : null
        };
        
        store.put(lesson);
    },

    updateStatsCache(skill, count) {
        // Actualizar localStorage para acceso rápido
        const stats = JSON.parse(localStorage.getItem('english_stats') || '{}');
        stats[skill] = (stats[skill] || 0) + count;
        localStorage.setItem('english_stats', JSON.stringify(stats));
    }
};

window.StorageManager = StorageManager;