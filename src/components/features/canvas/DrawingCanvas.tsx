import { useEffect, useRef, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import {
    Eraser,
    Pen,
    Undo,
    Redo,
    Trash,
    Download,
    Palette,
    Minus,
    Plus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface DrawingCanvasProps {
    width?: number;
    height?: number;
    onCanvasReady?: (canvas: fabric.Canvas) => void;
    onSketchComplete?: (imageData: string) => void;
}

const PRESET_COLORS = [
    '#000000', // Black
    '#FFFFFF', // White
    '#EF4444', // Red
    '#10B981', // Green
    '#3B82F6', // Blue
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
];

export function DrawingCanvas({
    width = 512,
    height = 512,
    onCanvasReady,
    onSketchComplete
}: DrawingCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);

    // Tool State
    const [activeTool, setActiveTool] = useState<'brush' | 'eraser'>('brush');
    const [brushSize, setBrushSize] = useState(5);
    const [brushColor, setBrushColor] = useState('#000000');

    // History State
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const isHistoryProcessing = useRef(false);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || fabricCanvas) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            isDrawingMode: true,
            width,
            height,
            backgroundColor: '#ffffff',
        });

        // Initial pencil brush
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.width = brushSize;
        canvas.freeDrawingBrush.color = brushColor;

        setFabricCanvas(canvas);

        // Save initial empty state
        const initialState = JSON.stringify(canvas.toJSON());
        setHistory([initialState]);
        setHistoryIndex(0);

        if (onCanvasReady) {
            onCanvasReady(canvas);
        }

        return () => {
            canvas.dispose();
        };
    }, []);

    // Update Brush Settings
    useEffect(() => {
        if (!fabricCanvas) return;

        if (activeTool === 'eraser') {
            fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = '#ffffff'; // Simple white eraser for MVP
            fabricCanvas.freeDrawingBrush.width = brushSize;
        } else {
            fabricCanvas.freeDrawingBrush = new fabric.PencilBrush(fabricCanvas);
            fabricCanvas.freeDrawingBrush.color = brushColor;
            fabricCanvas.freeDrawingBrush.width = brushSize;
        }
    }, [fabricCanvas, activeTool, brushSize, brushColor]);

    // History Management
    const saveHistory = useCallback(() => {
        if (!fabricCanvas || isHistoryProcessing.current) return;

        const json = JSON.stringify(fabricCanvas.toJSON());

        setHistory(prev => {
            const newHistory = prev.slice(0, historyIndex + 1);
            // Limit history to 10 items
            if (newHistory.length >= 10) {
                newHistory.shift();
            }
            return [...newHistory, json];
        });

        setHistoryIndex(prev => Math.min(prev + 1, 9));

        // Process base64 for parent if needed
        if (onSketchComplete) {
            const dataUrl = fabricCanvas.toDataURL();
            onSketchComplete(dataUrl);
        }

    }, [fabricCanvas, historyIndex, onSketchComplete]);

    // Attach History Listener
    useEffect(() => {
        if (!fabricCanvas) return;

        const handlePathCreated = () => {
            saveHistory();
        };

        fabricCanvas.on('path:created', handlePathCreated);

        return () => {
            fabricCanvas.off('path:created', handlePathCreated);
        };
    }, [fabricCanvas, saveHistory]);

    const undo = async () => {
        if (!fabricCanvas || historyIndex <= 0) return;
        isHistoryProcessing.current = true;

        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);

        await fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]));
        fabricCanvas.renderAll();
        isHistoryProcessing.current = false;
    };

    const redo = async () => {
        if (!fabricCanvas || historyIndex >= history.length - 1) return;
        isHistoryProcessing.current = true;

        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);

        await fabricCanvas.loadFromJSON(JSON.parse(history[newIndex]));
        fabricCanvas.renderAll();
        isHistoryProcessing.current = false;
    };

    const clearCanvas = () => {
        if (!fabricCanvas) return;
        fabricCanvas.clear();
        fabricCanvas.backgroundColor = '#ffffff';
        saveHistory();
    };

    const downloadSketch = () => {
        if (!fabricCanvas) return;
        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2
        });
        const link = document.createElement('a');
        link.download = `sketchdream-${Date.now()}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col gap-4 w-full max-w-[512px]" ref={containerRef}>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg border">
                {/* Tools */}
                <div className="flex gap-1 border-r pr-2 shadow-none">
                    <Button
                        variant={activeTool === 'brush' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setActiveTool('brush')}
                        title="Brush"
                    >
                        <Pen className="w-4 h-4" />
                    </Button>
                    <Button
                        variant={activeTool === 'eraser' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={() => setActiveTool('eraser')}
                        title="Eraser"
                    >
                        <Eraser className="w-4 h-4" />
                    </Button>
                </div>

                {/* History */}
                <div className="flex gap-1 border-r pr-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={undo}
                        disabled={historyIndex <= 0}
                        title="Undo"
                    >
                        <Undo className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={redo}
                        disabled={historyIndex >= history.length - 1}
                        title="Redo"
                    >
                        <Redo className="w-4 h-4" />
                    </Button>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={clearCanvas} title="Clear">
                        <Trash className="w-4 h-4 text-destructive" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={downloadSketch} title="Download">
                        <Download className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="relative border rounded-lg shadow-sm overflow-hidden bg-white">
                <canvas ref={canvasRef} width={width} height={height} />
            </div>

            {/* Extended Controls (Bottom) */}
            <div className="space-y-4 p-4 border rounded-lg bg-card">
                {/* Brush Size */}
                <div className="space-y-2">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Brush Size</span>
                        <span>{brushSize}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Minus className="w-4 h-4 text-muted-foreground" />
                        <Slider
                            value={[brushSize]}
                            min={2}
                            max={50}
                            step={1}
                            onValueChange={(val) => setBrushSize(val[0])}
                            className="flex-1"
                        />
                        <Plus className="w-4 h-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Color Palette */}
                {activeTool === 'brush' && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Color</span>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_COLORS.map((color) => (
                                <button
                                    key={color}
                                    className={cn(
                                        "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                                        brushColor === color ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                                    )}
                                    style={{ backgroundColor: color }}
                                    onClick={() => setBrushColor(color)}
                                    aria-label={`Select color ${color}`}
                                />
                            ))}
                            <div className="relative group">
                                <label
                                    htmlFor="custom-color"
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer transition-all hover:scale-110 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                                        !PRESET_COLORS.includes(brushColor) ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                                    )}
                                >
                                    <Palette className="w-4 h-4 text-white drop-shadow-md" />
                                </label>
                                <input
                                    id="custom-color"
                                    type="color"
                                    className="absolute opacity-0 w-0 h-0"
                                    value={brushColor}
                                    onChange={(e) => setBrushColor(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
