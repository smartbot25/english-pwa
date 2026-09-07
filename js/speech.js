const SpeechManager = {
    recognition: null,
    isListening: false,

    async init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const transcript = Array.from(event.results)
                    .map(result => result[0])
                    .map(result => result.transcript)
                    .join('');
                
                this.handleSpeechResult(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
            };
        }
    },

    async getSpeakingExercise() {
        return `
            <div class="exercise speaking-exercise">
                <h3>🎤 Práctica de Speaking</h3>
                <p>Repite esta frase en inglés:</p>
                <div class="phrase-prompt">"Hello, my name is John"</div>
                <button id="record-btn" class="cta-button" onclick="SpeechManager.toggleRecording()">
                    🎤 Grabar
                </button>
                <div id="speech-visualizer" class="speech-visualizer hidden">
                    ${Array(20).fill('<div class="speech-bar"></div>').join('')}
                </div>
                <div id="speech-result" class="speech-result"></div>
                <div id="speech-feedback" class="feedback"></div>
            </div>
        `;
    },

    async getListeningExercise() {
        return `
            <div class="exercise listening-exercise">
                <h3>👂 Ejercicio de Listening</h3>
                <p>Escucha y escribe lo que oyes:</p>
                <button onclick="SpeechManager.playAudio()" class="cta-button">
                    🔊 Reproducir Audio
                </button>
                <audio id="audio-player" src="data:audio/wav;base64,UklG..." style="display:none"></audio>
                <textarea id="listening-input" placeholder="Escribe lo que escuchaste..."></textarea>
                <button onclick="SpeechManager.checkListeningAnswer()" class="cta-button">Verificar</button>
                <div id="listening-feedback" class="feedback"></div>
            </div>
        `;
    },

    toggleRecording() {
        if (!this.recognition) {
            alert('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            document.getElementById('record-btn').textContent = '🎤 Grabar';
            document.getElementById('speech-visualizer').classList.add('hidden');
        } else {
            this.recognition.start();
            this.isListening = true;
            document.getElementById('record-btn').textContent = '⏹️ Detener';
            document.getElementById('speech-visualizer').classList.remove('hidden');
        }
    },

    handleSpeechResult(transcript) {
        const resultDiv = document.getElementById('speech-result');
        const feedbackDiv = document.getElementById('speech-feedback');
        
        resultDiv.innerHTML = `<p><strong>Dijiste:</strong> "${transcript}"</p>`;
        
        const correctPhrase = "hello my name is john";
        if (transcript.toLowerCase().includes(correctPhrase)) {
            feedbackDiv.innerHTML = '<p class="success">✓ ¡Excelente pronunciación!</p>';
            StorageManager.saveProgress('speaking', 1);
            updateStats();
        } else {
            feedbackDiv.innerHTML = '<p class="error">✗ Intenta de nuevo. Escucha la pronunciación correcta.</p>';
        }
    },

    playAudio() {
        // Implementar audio real o usar Web Speech API para TTS
        const utterance = new SpeechSynthesisUtterance("Good morning, how are you today?");
        utterance.lang = 'en-US';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
    },

    checkListeningAnswer() {
        const input = document.getElementById('listening-input').value.toLowerCase();
        const correctAnswer = "good morning how are you today";
        const feedback = document.getElementById('listening-feedback');
        
        if (input.includes('good morning') && input.includes('how are you')) {
            feedback.innerHTML = '<p class="success">✓ ¡Muy bien! Entendiste correctamente.</p>';
            StorageManager.saveProgress('listening', 1);
        } else {
            feedback.innerHTML = '<p class="error">✗ La frase correcta es: "Good morning, how are you today?"</p>';
        }
        
        updateStats();
    }
};

window.SpeechManager = SpeechManager;
