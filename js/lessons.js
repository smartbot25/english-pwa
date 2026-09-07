const LessonsManager = {
    lessons: [
        {
            id: 1,
            title: 'Saludos Básicos',
            level: 'beginner',
            category: 'speaking',
            content: {
                phrases: [
                    { en: 'Hello', es: 'Hola', audio: 'hello.mp3' },
                    { en: 'Good morning', es: 'Buenos días', audio: 'good-morning.mp3' },
                    { en: 'How are you?', es: '¿Cómo estás?', audio: 'how-are-you.mp3' }
                ]
            },
            completed: false
        },
        {
            id: 2,
            title: 'Presentaciones',
            level: 'beginner',
            category: 'speaking',
            content: {
                phrases: [
                    { en: 'My name is...', es: 'Mi nombre es...', audio: 'my-name-is.mp3' },
                    { en: 'I am from...', es: 'Soy de...', audio: 'i-am-from.mp3' },
                    { en: 'Nice to meet you', es: 'Encantado de conocerte', audio: 'nice-to-meet.mp3' }
                ]
            },
            completed: false
        }
    ],

    async init() {
        this.lessons = await StorageManager.getLessons() || this.lessons;
        this.renderLessons();
    },

    renderLessons() {
        const container = document.getElementById('lessons-container');
        container.innerHTML = this.lessons.map(lesson => `
            <div class="lesson-card ${lesson.completed ? 'completed' : ''}" 
                 onclick="LessonsManager.openLesson(${lesson.id})">
                <h3>${lesson.title}</h3>
                <p>Nivel: ${this.translateLevel(lesson.level)}</p>
                <p>Categoría: ${this.translateCategory(lesson.category)}</p>
                ${lesson.completed ? '<span class="badge">✓ Completado</span>' : ''}
            </div>
        `).join('');
    },

    translateLevel(level) {
        const levels = {
            beginner: 'Principiante',
            intermediate: 'Intermedio',
            advanced: 'Avanzado'
        };
        return levels[level] || level;
    },

    translateCategory(category) {
        const categories = {
            speaking: 'Hablar',
            listening: 'Escuchar',
            writing: 'Escribir',
            reading: 'Leer'
        };
        return categories[category] || category;
    },

    async openLesson(lessonId) {
        const lesson = this.lessons.find(l => l.id === lessonId);
        if (!lesson) return;

        navigateTo('practice');
        // Implementar lógica de lección interactiva
        console.log('Opening lesson:', lesson);
    },

    async getWritingExercise() {
        return `
            <div class="exercise writing-exercise">
                <h3>✍️ Ejercicio de Escritura</h3>
                <p>Traduce esta frase al inglés:</p>
                <div class="prompt">"Buenos días, ¿cómo estás?"</div>
                <textarea id="writing-input" placeholder="Escribe tu respuesta en inglés..."></textarea>
                <button onclick="LessonsManager.checkWritingAnswer()" class="cta-button">Verificar</button>
                <div id="writing-feedback" class="feedback"></div>
            </div>
        `;
    },

    async getReadingExercise() {
        return `
            <div class="exercise reading-exercise">
                <h3>📖 Ejercicio de Lectura</h3>
                <div class="reading-passage">
                    <p><strong>My Daily Routine</strong></p>
                    <p>I wake up at 7:00 AM every day. First, I brush my teeth and take a shower. 
                    Then, I have breakfast with my family. I usually eat eggs and toast.</p>
                    <p>After breakfast, I go to work by bus. The journey takes about 30 minutes. 
                    I start work at 9:00 AM and finish at 5:00 PM.</p>
                </div>
                <div class="comprehension-questions">
                    <h4>Preguntas de comprensión:</h4>
                    <ol>
                        <li>What time does the person wake up?</li>
                        <li>How do they go to work?</li>
                        <li>What time do they finish work?</li>
                    </ol>
                </div>
                <button onclick="LessonsManager.showReadingAnswers()" class="cta-button">Ver Respuestas</button>
                <div id="reading-answers" class="answers hidden"></div>
            </div>
        `;
    },

    checkWritingAnswer() {
        const input = document.getElementById('writing-input').value.toLowerCase();
        const correctAnswers = ['good morning, how are you?', 'good morning how are you'];
        const feedback = document.getElementById('writing-feedback');
        
        if (correctAnswers.includes(input.trim())) {
            feedback.innerHTML = '<p class="success">✓ ¡Correcto! "Good morning, how are you?"</p>';
            StorageManager.saveProgress('writing', 1);
        } else {
            feedback.innerHTML = '<p class="error">✗ Intenta de nuevo. Pista: "Good morning, how are you?"</p>';
        }
        
        updateStats();
    },

    showReadingAnswers() {
        const answers = document.getElementById('reading-answers');
        answers.classList.remove('hidden');
        answers.innerHTML = `
            <div class="answer-item">1. The person wakes up at 7:00 AM</div>
            <div class="answer-item">2. They go to work by bus</div>
            <div class="answer-item">3. They finish work at 5:00 PM</div>
        `;
    }
};

window.LessonsManager = LessonsManager;
