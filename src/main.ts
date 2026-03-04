import { RunAnywhere, SDKEnvironment, ModelCategory, LLMFramework } from '@runanywhere/web';
import { ONNX } from '@runanywhere/web-onnx';
import { VisionSystem } from './vision';
import { OllamaClient } from './ollama';
import { SpeechSystem } from './speech';
import { AIPipeline } from './pipeline';
import { ui } from './ui';

async function init() {
    ui.log('Initializing Local AI Mission Console...');

    try {
        // Initialize RunAnywhere
        await RunAnywhere.initialize({
            environment: SDKEnvironment.Development,
            debug: true
        });

        // Register TTS Model (Vision is via Ollama)
        RunAnywhere.registerModels([
            {
                id: 'piper-amy',
                name: 'Piper Amy',
                modality: ModelCategory.SpeechSynthesis,
                framework: LLMFramework.PiperTTS,
                repo: 'csukuangfj/vits-piper-en_US-amy-low',
                files: [
                    'en_US-amy-low.onnx',
                    'en_US-amy-low.onnx.json',
                    'tokens.txt'
                ]
            }
        ]);

        // Register ONNX for TTS
        await ONNX.register();

        ui.log('RunAnywhere and TTS backend initialized');

        const vision = new VisionSystem();
        const ollama = new OllamaClient();
        const speech = new SpeechSystem();
        const pipeline = new AIPipeline(vision, ollama, speech);

        // Check Ollama Health & Populate Models
        const ollamaOnline = await ollama.checkHealth();
        if (ollamaOnline) {
            const models = await ollama.listModels();
            ui.updateModelList(models);
            ui.setOllamaStatus(true, `Ollama Online (${models.length} models)`);
            ui.log('Detected Ollama models. Choose a VLM model (like qwen2.5-vl) for best results.');
        } else {
            ui.setOllamaStatus(false, 'Ollama Offline. Please start Ollama.');
            ui.log('Ollama not found on localhost:11434', 'error');
        }

        // Initialize components
        await vision.initialize();
        await speech.initialize();

        ui.setStatus('System Ready');
        ui.log('All systems initialized');

        // Setup event listeners
        ui.analyzeBtn.addEventListener('click', () => {
            pipeline.run();
        });
        ui.resetBtn.addEventListener('click', () => {
            ui.resetCamera();
        });

    } catch (error) {
        ui.log(`Initialization failed: ${error}`, 'error');
        ui.setStatus('Initialization Failed');
    }
}

// Start the app
init();
