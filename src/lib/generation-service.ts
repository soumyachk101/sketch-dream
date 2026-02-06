import type { GenerationResponse, GenerationParams } from "@/types/sketch-dream";

// Helper to enhance prompt based on style
function enhancePrompt(prompt: string, style: GenerationParams['style']): string {
    const styleSuffixes: Record<string, string> = {
        'photorealistic': ", highly detailed, photorealistic, 8k resolution, cinematic lighting, photography",
        'digital-art': ", digital art, trending on artstation, sharp focus, vibrant colors",
        'oil-painting': ", oil painting texture, classic art style, visible brushstrokes",
        'anime': ", anime style, studio ghibli, vibrant, cel shaded, clean lines",
        'sketch': ", pencil sketch, charcoal drawing, rough lines, artistic",
        'watercolor': ", watercolor painting, soft edges, pastel colors, artistic splatter",
        'cyberpunk': ", cyberpunk, neon lights, futuristic, high tech, dark atmosphere",
        'fantasy': ", high fantasy, magical, ethereal, dreamlike, intricate details"
    };

    return `${prompt}${styleSuffixes[style] || ''}`;
}

export async function generateImage(
    prompt: string,
    sketch: string,
    params: GenerationParams
): Promise<GenerationResponse> {

    // Simulate a short delay for UX consistency (optional, but nice)
    // await new Promise(r => setTimeout(r, 500)); 

    // Suppress unused sketch warning (Pollinations is text-only for now)
    void sketch;

    const seed = Math.floor(Math.random() * 1000000);
    const enhancedPrompt = enhancePrompt(prompt, params.style);

    // Construct Pollinations.ai URL
    // We use a random seed to ensure new images on regenerate
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const width = 512;
    const height = 512;

    // Pollinations URL
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

    // Note: Pollinations returns the image directly. 
    // We can just use the URL as the src.

    console.log("Generating with Pollinations:", { prompt: enhancedPrompt, url: imageUrl });

    return {
        success: true,
        images: [imageUrl],
        imageUrl: imageUrl,
        metadata: {
            generationTime: 1000,
            model: 'pollinations-flux',
            seed: seed
        }
    };
}
