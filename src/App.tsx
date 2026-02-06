import { useState } from 'react';
import { DrawingCanvas } from "@/components/features/canvas/DrawingCanvas";
import { TextPromptInput } from "@/components/features/controls/TextPromptInput";
import { ControlParameters } from "@/components/features/controls/ControlParameters";
import { ResultDisplay } from "@/components/features/results/ResultDisplay";
import { generateImage } from "@/lib/generation-service";
import * as fabric from 'fabric';
import { Sparkles, Palette, Layers, Wand2 } from 'lucide-react';
import type { GenerationParams } from "@/types/sketch-dream";

function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [params, setParams] = useState<GenerationParams>({
    sketchStrength: 70,
    style: 'photorealistic',
    variations: 1
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [lastSketch, setLastSketch] = useState<string | null>(null);
  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

  const handleGenerate = async () => {
    if (!prompt) return;

    setIsGenerating(true);
    try {
      const sketchData = fabricCanvas?.toDataURL() || '';
      setLastSketch(sketchData);
      const result = await generateImage(prompt, sketchData, params);
      setResultImage(result.imageUrl || result.images[0]); // Handle potentially missing imageUrl
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              SketchDream
            </h1>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-600 transition-colors">Gallery</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">About</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">

        {/* Main Workspace: Canvas & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Panel: Canvas + Controls */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-900">
              <Palette className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Canvas</h2>
            </div>
            <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 p-1 border border-slate-100">
              <DrawingCanvas
                width={512}
                height={512}
                onCanvasReady={setFabricCanvas}
              />
            </div>
          </div>

          {/* Right Panel: Results */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-900">
              <Layers className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Result</h2>
            </div>
            <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 p-1 border border-slate-100 h-full min-h-[530px]">
              <ResultDisplay
                generatedImage={resultImage}
                originalSketch={lastSketch || undefined}
                isGenerating={isGenerating}
                onDownload={() => window.open(resultImage || '', '_blank')}
                onRegenerate={handleGenerate}
              />
            </div>
          </div>
        </div>

        {/* Bottom Panel: Prompt & Parameters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-indigo-900">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Prompt</h2>
            </div>
            <TextPromptInput onPromptChange={setPrompt} className="shadow-lg shadow-slate-200/50 border-slate-100" />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Dreaming...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Dream</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-900">
              <div className="w-5 h-5" /> {/* Spacer or Icon */}
              <h2 className="text-lg font-semibold">Parameters</h2>
            </div>
            <ControlParameters onParamsChange={setParams} isGenerating={isGenerating} />
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;
