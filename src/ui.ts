export const ui = {
    get cameraFeed() { return document.getElementById('camera-feed') as HTMLVideoElement; },
    capturedFrame: document.getElementById('captured-frame') as HTMLImageElement,
    analyzeBtn: document.getElementById('analyze-btn') as HTMLButtonElement,
    resetBtn: document.getElementById('reset-btn') as HTMLButtonElement,
    visionOutput: document.getElementById('vision-output') as HTMLElement,
    ollamaOutput: document.getElementById('ollama-output') as HTMLElement,
    voiceStatus: document.getElementById('voice-status') as HTMLElement,
    ollamaStatus: document.getElementById('ollama-status') as HTMLElement,
    statusOverlay: document.getElementById('status-overlay') as HTMLElement,
    logConsole: document.getElementById('log-console') as HTMLElement,
    modelSelect: document.getElementById('model-select') as HTMLSelectElement,

    updateVision(text: string) {
        this.visionOutput.textContent = text;
        this.visionOutput.classList.remove('placeholder');
    },

    updateOllama(text: string) {
        this.ollamaOutput.textContent = text;
        this.ollamaOutput.classList.remove('placeholder');
    },

    updateVoice(text: string) {
        this.voiceStatus.textContent = text;
        this.voiceStatus.classList.remove('placeholder');
    },

    setOllamaStatus(online: boolean, message: string) {
        this.ollamaStatus.textContent = message;
        this.ollamaStatus.className = `status-badge ${online ? 'online' : 'offline'}`;
        this.analyzeBtn.disabled = !online;
        this.modelSelect.disabled = !online;
    },

    updateModelList(models: string[]) {
        this.modelSelect.innerHTML = '';
        if (models.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'No models found';
            this.modelSelect.appendChild(option);
            return;
        }

        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model;
            option.textContent = model;
            this.modelSelect.appendChild(option);
        });

        // Set default to llama3 if available
        if (models.includes('llama3:latest')) {
            this.modelSelect.value = 'llama3:latest';
        } else if (models.includes('llama3')) {
            this.modelSelect.value = 'llama3';
        }
    },

    getSelectedModel(): string {
        return this.modelSelect.value;
    },

    showCapture(base64Image: string) {
        this.cameraFeed.style.display = 'none';
        this.capturedFrame.style.display = 'block';
        this.capturedFrame.src = `data:image/jpeg;base64,${base64Image}`;
        this.analyzeBtn.style.display = 'none';
        this.resetBtn.style.display = 'block';
    },

    resetCamera() {
        this.capturedFrame.style.display = 'none';
        this.capturedFrame.src = '';
        this.cameraFeed.style.display = 'block';
        this.resetBtn.style.display = 'none';
        this.analyzeBtn.style.display = 'block';
        this.setStatus('System Ready');
    },

    setStatus(text: string) {
        this.statusOverlay.textContent = text;
    },

    log(message: string, type: 'info' | 'error' = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type === 'error' ? 'log-error' : 'log-info'}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.logConsole.appendChild(entry);
        this.logConsole.scrollTop = this.logConsole.scrollHeight;
        console.log(`[local-ai] ${message}`);
    }
};
