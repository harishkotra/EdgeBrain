import { AudioPlayback } from '@runanywhere/web';
import { SherpaONNXBridge, TTS } from '@runanywhere/web-onnx';
import { ui } from './ui';

export class SpeechSystem {
    private playback: AudioPlayback;
    private initialized = false;

    constructor() {
        this.playback = new AudioPlayback({
            sampleRate: 22050
        });

        // Tell Sherpa where the WASM glue file lives
        SherpaONNXBridge.shared.wasmUrl =
            `${window.location.origin}/wasm-assets/sherpa/sherpa-onnx-glue.js`;
    }

    async initialize() {
        if (this.initialized) return;

        try {
            ui.log('Loading Sherpa ONNX runtime...');

            // STEP 1 — load Sherpa WASM runtime
            await SherpaONNXBridge.shared.ensureLoaded();

            ui.log('Sherpa runtime loaded');

            // STEP 2 — stage model files via local archive
            ui.log('Loading TTS Voice (Piper Amy)...');

            const response = await fetch('/models/piper-en.tgz.bin');
            if (!response.ok) throw new Error('Failed to fetch piper-en.tgz.bin');
            const buffer = await response.arrayBuffer();

            const bridge = SherpaONNXBridge.shared;
            bridge.ensureDir('/models/piper-en');

            const { extractTarGz } = await import('@runanywhere/web');
            const entries = await extractTarGz(new Uint8Array(buffer));

            for (const entry of entries) {
                // Remove relative prefix if any
                const cleanPath = entry.path.replace(/^\.\//, '');
                const fsPath = `/models/piper-en/${cleanPath}`;

                if (entry.path.endsWith('/')) {
                    bridge.ensureDir(fsPath);
                } else {
                    bridge.writeFile(fsPath, entry.data);
                }
            }

            // STEP 3 — register voice with TTS engine
            await TTS.loadVoice({
                voiceId: "piper-en",
                modelPath: "/models/piper-en/en_US-amy-low.onnx",
                tokensPath: "/models/piper-en/tokens.txt",
                dataDir: "/models/piper-en/espeak-ng-data"
            });

            this.initialized = true;

            ui.log('TTS Voice loaded successfully');
        } catch (error) {
            ui.log(`TTS initialization error: ${error}`, 'error');
            throw error;
        }
    }

    async speak(text: string) {
        try {
            if (!this.initialized) {
                ui.log('Speech system not initialized, initializing...');
                await this.initialize();
            }

            ui.log('Generating speech...');
            ui.updateVoice('Generating speech...');
            ui.setStatus('Speaking...');

            // Generate speech
            const result = await TTS.synthesize(text);

            ui.updateVoice('Playing audio...');

            // Play audio
            await this.playback.play(
                result.audioData,
                result.sampleRate
            );

            ui.updateVoice('Speech finished');
            ui.log('Speech finished');
        } catch (error) {
            ui.log(`Speech error: ${error}`, 'error');
            ui.updateVoice('Speech failed');
        }
    }
}