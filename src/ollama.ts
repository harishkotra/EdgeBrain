import { ui } from './ui';

export class OllamaClient {
    private baseUrl = 'http://localhost:11434/api';

    async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.baseUrl}/tags`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }

    async listModels(): Promise<string[]> {
        try {
            const response = await fetch(`${this.baseUrl}/tags`);
            if (!response.ok) return [];
            const data = await response.json();
            return data.models.map((m: any) => m.name);
        } catch (error) {
            ui.log(`Failed to list models: ${error}`, 'error');
            return [];
        }
    }

    async reason(selectedModel: string, imageBase64?: string): Promise<string> {
        ui.log(`Sending to Ollama VLM (${selectedModel})...`);
        ui.setStatus('Ollama is thinking...');

        try {
            const payload: any = {
                model: selectedModel,
                prompt: "Describe what you see in this image in one short, conversational sentence.",
                stream: false
            };

            if (imageBase64) {
                payload.images = [imageBase64];
            }

            const response = await fetch(`${this.baseUrl}/generate`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ollama request failed');
            }

            const data = await response.json();
            const reasoning = data.response;

            ui.updateOllama(reasoning);
            ui.updateVision("Ollama analyzed the image."); // Feedback for vision stage
            ui.log(`Ollama Output: ${reasoning}`);
            return reasoning;
        } catch (error) {
            ui.log(`Ollama error: ${error}`, 'error');
            return "I'm having trouble seeing right now. Is Ollama running?";
        }
    }
}
