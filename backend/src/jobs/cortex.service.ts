import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CortexService {
    private readonly apiKey: string;
    private readonly baseUrl = 'https://api.cortexone.rival.io/v1'; // Adjusted to match RIVAL requirements

    constructor(private config: ConfigService) {
        this.apiKey = this.config.get<string>('CORTEXONE_API_KEY') || '';
    }

    /**
   * Meaningful Function: AI-Powered Summary Generator
   * Uses CortexOne to generate a smart summary of the blog post.
   */
    async generateSummary(title: string, content: string): Promise<string | null> {
        if (!this.apiKey) return null;

        try {
            const response = await fetch('https://cortexone.rival.io/api/v1/run', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    function: 'blog-summary-generator',
                    input: { title, content },
                }),
            });

            if (!response.ok) return null;

            const result = await response.json() as any;
            return result?.output?.summary ?? null;
        } catch (e) {
            return null;
        }
    }
}
