import { VisionSystem } from './vision';
import { OllamaClient } from './ollama';
import { SpeechSystem } from './speech';
import { ui } from './ui';

export class AIPipeline {
    constructor(
        private vision: VisionSystem,
        private ollama: OllamaClient,
        private speech: SpeechSystem
    ) { }

    async run() {
        ui.analyzeBtn.disabled = true;
        ui.modelSelect.disabled = true;
        ui.setStatus('Capturing...');

        try {
            // 0. Get Selected Model
            const selectedModel = ui.getSelectedModel();
            if (!selectedModel) {
                throw new Error('No model selected');
            }

            // 1. Capture Frame (Base64)
            const base64Frame = await this.vision.captureBase64Frame();
            if (!base64Frame) {
                throw new Error('Failed to capture frame');
            }

            // Show captured frame
            ui.showCapture(base64Frame);

            // 2. Ollama Multimodal Reasoning
            // Send image directly to Ollama
            const response = await this.ollama.reason(selectedModel, base64Frame);

            // 3. TTS
            await this.speech.speak(response);

        } catch (error) {
            ui.log(`Pipeline error: ${error}`, 'error');
            ui.resetCamera();
        } finally {
            ui.analyzeBtn.disabled = false;
            ui.modelSelect.disabled = false;
            ui.setStatus('Analysis Complete');
        }
    }
}
