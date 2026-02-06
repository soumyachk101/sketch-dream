import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Download, RefreshCw, Share2, ZoomIn, ZoomOut, GripVertical, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResultDisplayProps {
    originalSketch?: string;
    generatedImage: string | null;
    isGenerating: boolean;
    onDownload: () => void;
    onRegenerate: () => void;
}

export function ResultDisplay({
    originalSketch,
    generatedImage,
    isGenerating,
    onDownload,
    onRegenerate
}: ResultDisplayProps) {
    const [sliderPosition, setSliderPosition] = useState(50);
    const [zoom, setZoom] = useState(1);
    const [isComparing, setIsComparing] = useState(true);
    const [rating, setRating] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Reset state when new image arrives
    useEffect(() => {
        if (generatedImage) {
            setSliderPosition(50);
            setZoom(1);
            setRating(0);
        }
    }, [generatedImage]);

    const handleShare = async () => {
        if (generatedImage) {
            try {
                // In a real app, this would upload to server and get a link.
                // For now, we copy the data URL or just a mock message.
                await navigator.clipboard.writeText("Check out my SketchDream creation!");
                alert("Link copied to clipboard! (Mock)");
            } catch (err) {
                console.error("Failed to copy", err);
            }
        }
    };

    if (!generatedImage && !isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[512px] bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-2">
                    <SparklesIcon className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Ready to Dream</h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                        Draw a sketch and enter a prompt to generate your first AI masterpiece.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4 w-full h-full">

                {/* Main View Area */}
                <div
                    ref={containerRef}
                    className="relative w-full aspect-square bg-muted/10 rounded-lg overflow-hidden border shadow-inner group"
                >
                    {isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50">
                            <div className="relative">
                                <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <SparklesIcon className="w-6 h-6 text-primary animate-pulse" />
                                </div>
                            </div>
                            <p className="mt-4 text-sm font-medium animate-pulse text-muted-foreground">AI is dreaming...</p>
                        </div>
                    )}

                    {!isGenerating && generatedImage && (
                        <div
                            className="relative w-full h-full transition-transform duration-200 ease-out"
                            style={{ transform: `scale(${zoom})` }}
                        >
                            {/* Comparison View */}
                            {isComparing && originalSketch ? (
                                <>
                                    {/* Background: Original Sketch */}
                                    <img
                                        src={originalSketch}
                                        alt="Original Sketch"
                                        className="absolute inset-0 w-full h-full object-contain opacity-50 blur-[1px]"
                                    />
                                    <div className="absolute top-2 left-2 z-10">
                                        <Badge variant="secondary" className="bg-black/50 text-white hover:bg-black/60">Sketch</Badge>
                                    </div>

                                    {/* Foreground: Generated Image (Clipped) */}
                                    <div
                                        className="absolute inset-0 w-full h-full overflow-hidden"
                                        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                                    >
                                        <img
                                            src={generatedImage}
                                            alt="Generated Result"
                                            className="w-full h-full object-contain"
                                        />
                                        <div className="absolute top-2 right-2 z-10">
                                            <Badge variant="default" className="shadow-md">Result</Badge>
                                        </div>
                                    </div>

                                    {/* Slider Handle */}
                                    <div
                                        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] z-20 hover:w-1.5 transition-all"
                                        style={{ left: `${sliderPosition}%` }}
                                    >
                                        <div className="absolute top-1/2 -left-3 w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-800 transform -translate-y-1/2">
                                            <GripVertical className="w-4 h-4" />
                                        </div>
                                    </div>

                                    {/* Invisible Range Input for Dragging */}
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={sliderPosition}
                                        onChange={(e) => setSliderPosition(Number(e.target.value))}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                                    />
                                </>
                            ) : (
                                /* Single View */
                                <img
                                    src={generatedImage}
                                    alt="Generated Result"
                                    className="w-full h-full object-contain"
                                />
                            )}
                        </div>
                    )}
                </div>

                {/* Controls Bar */}
                <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between">

                        {/* View Toggles & Zoom */}
                        <div className="flex items-center gap-2">
                            {originalSketch && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={isComparing ? "secondary" : "ghost"}
                                            size="icon"
                                            onClick={() => setIsComparing(!isComparing)}
                                        >
                                            <GripVertical className="w-4 h-4 rotate-90" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Toggle Comparison</TooltipContent>
                                </Tooltip>
                            )}

                            <div className="h-6 w-px bg-border mx-1" />

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}>
                                        <ZoomOut className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom Out</TooltipContent>
                            </Tooltip>

                            <span className="text-xs font-mono w-12 text-center">
                                {Math.round(zoom * 100)}%
                            </span>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => setZoom(Math.min(3, zoom + 0.25))}>
                                        <ZoomIn className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Zoom In</TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Rating */}
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <button
                                    key={s}
                                    className="p-1 hover:scale-110 transition-transform"
                                    onClick={() => setRating(s)}
                                >
                                    <Star
                                        className={cn(
                                            "w-4 h-4 transition-colors",
                                            rating >= s ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-400"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4 flex justify-between gap-2">
                        {/* Primary Actions */}
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleShare}
                                disabled={isGenerating || !generatedImage}
                                className="w-full sm:w-auto"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={onRegenerate}
                                disabled={isGenerating || !generatedImage}
                            >
                                <RefreshCw className={cn("w-4 h-4 mr-2", isGenerating ? "animate-spin" : "")} />
                                Regenerate
                            </Button>
                            <Button
                                onClick={onDownload}
                                disabled={isGenerating || !generatedImage}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}

function SparklesIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M9 5H5" />
            <path d="M19 19v4" />
            <path d="M15 21h4" />
        </svg>
    )
}
