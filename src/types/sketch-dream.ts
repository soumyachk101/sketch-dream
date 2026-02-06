export type StylePreset =
    | 'photorealistic'
    | 'digital-art'
    | 'oil-painting'
    | 'anime'
    | 'sketch'
    | 'watercolor'
    | 'cyberpunk'
    | 'fantasy';

export interface GenerationParams {
    sketchStrength: number;
    style: StylePreset;
    variations: 1 | 2 | 4;
    resolution?: '512x512' | '768x768' | '1024x1024'; // Added resolution from prompt spec
}

export interface GenerationRequest {
    sketchImage: string; // base64
    prompt: string;
    parameters: GenerationParams;
}

export interface GenerationResponse {
    success: boolean;
    images: string[];
    error?: string;
    metadata?: {
        generationTime: number;
        model: string;
        seed?: number;
    };
    // Keeping legacy support for now if needed, but App uses imageUrl
    imageUrl?: string;
}
