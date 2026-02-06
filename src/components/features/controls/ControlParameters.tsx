import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RotateCcw, Info } from "lucide-react"
import type { GenerationParams, StylePreset } from "@/types/sketch-dream"

interface ControlParametersProps {
    onParamsChange: (params: GenerationParams) => void;
    isGenerating?: boolean;
    initialParams?: Partial<GenerationParams>;
}

const DEFAULT_PARAMS: GenerationParams = {
    sketchStrength: 70,
    style: 'photorealistic',
    variations: 1
};

export function ControlParameters({
    onParamsChange,
    isGenerating = false,
    initialParams
}: ControlParametersProps) {
    const [params, setParams] = useState<GenerationParams>({ ...DEFAULT_PARAMS, ...initialParams });

    // Sync params with parent whenever they change
    useEffect(() => {
        onParamsChange(params);
    }, [params, onParamsChange]);

    const updateParam = <K extends keyof GenerationParams>(key: K, value: GenerationParams[K]) => {
        setParams(prev => ({ ...prev, [key]: value }));
    };

    const resetToDefaults = () => {
        setParams(DEFAULT_PARAMS);
    };

    return (
        <TooltipProvider>
            <div className="w-full space-y-6 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight">Controls</h3>
                        <p className="text-sm text-muted-foreground">Fine-tune your generation.</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={resetToDefaults}
                        title="Reset to defaults"
                        disabled={isGenerating}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-6">
                    {/* Sketch Strength */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Label>Sketch Strength</Label>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>How closely the AI follows your sketch lines.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                {params.sketchStrength}%
                            </span>
                        </div>
                        <Slider
                            value={[params.sketchStrength]}
                            max={100}
                            step={1}
                            disabled={isGenerating}
                            onValueChange={(val) => updateParam('sketchStrength', val[0])}
                            className={params.sketchStrength > 80 ? "text-primary" : ""}
                        />
                        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
                            <span>Creative</span>
                            <span>Balanced</span>
                            <span>Precise</span>
                        </div>
                    </div>

                    {/* Style Preset */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Style</Label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>The artistic style of the generated image.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <Select
                            value={params.style}
                            onValueChange={(val) => updateParam('style', val as StylePreset)}
                            disabled={isGenerating}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select style" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="photorealistic">📸 Photorealistic</SelectItem>
                                <SelectItem value="digital-art">🎨 Digital Art</SelectItem>
                                <SelectItem value="oil-painting">🖼️ Oil Painting</SelectItem>
                                <SelectItem value="anime">🎎 Anime / Manga</SelectItem>
                                <SelectItem value="sketch">✏️ Sketch / Line Art</SelectItem>
                                <SelectItem value="watercolor">💧 Watercolor</SelectItem>
                                <SelectItem value="cyberpunk">🌃 Cyberpunk</SelectItem>
                                <SelectItem value="fantasy">🔮 Fantasy Art</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Variations */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Label>Variations</Label>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="w-3 h-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Number of images to generate.</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="flex gap-2">
                            {([1, 2, 4] as const).map((num) => (
                                <Button
                                    key={num}
                                    variant={params.variations === num ? "default" : "outline"}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => updateParam('variations', num)}
                                    disabled={isGenerating}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    )
}
