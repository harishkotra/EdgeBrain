import { VideoCapture } from '@runanywhere/web';
import { ui } from './ui';

export class VisionSystem {
    private capture: VideoCapture;

    constructor() {
        this.capture = new VideoCapture({
            facingMode: 'user',
            idealWidth: 640,
            idealHeight: 480
        });
    }

    async initialize() {
        ui.log('Initializing Camera...');
        try {
            await this.capture.start();
            // Attach video element to the DOM
            const videoWrapper = document.querySelector('.video-wrapper');
            if (videoWrapper) {
                const existingVideo = document.getElementById('camera-feed');
                if (existingVideo) existingVideo.remove();

                const video = this.capture.videoElement;
                video.id = 'camera-feed';
                video.autoplay = true;
                video.playsInline = true;
                videoWrapper.insertBefore(video, videoWrapper.firstChild);
            }
            ui.log('Camera started');
            ui.log('Vision ready (Ollama VLM)');
        } catch (error) {
            ui.log(`Camera init error: ${error}`, 'error');
            throw error;
        }
    }

    async captureBase64Frame(): Promise<string | null> {
        ui.log('Capturing frame...');
        const frame = this.capture.captureFrame(640);

        if (!frame) {
            ui.log('Failed to capture frame', 'error');
            return null;
        }

        // Convert RGBPixels to Base64 using a temporary canvas
        const canvas = document.createElement('canvas');
        canvas.width = frame.width;
        canvas.height = frame.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const imageData = ctx.createImageData(frame.width, frame.height);
        // RGB to RGBA
        for (let i = 0, j = 0; i < frame.rgbPixels.length; i += 3, j += 4) {
            imageData.data[j] = frame.rgbPixels[i];
            imageData.data[j + 1] = frame.rgbPixels[i + 1];
            imageData.data[j + 2] = frame.rgbPixels[i + 2];
            imageData.data[j + 3] = 255;
        }
        ctx.putImageData(imageData, 0, 0);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        return dataUrl.split(',')[1];
    }
}
