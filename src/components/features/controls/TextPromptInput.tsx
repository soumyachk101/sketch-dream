import { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { History, Sparkles, Trash2 } from "lucide-react";

interface TextPromptInputProps {
    maxLength?: number;
    onPromptChange?: (prompt: string) => void;
    className?: string;
}

const TEMPLATES = [
    { label: "Portrait", text: "Portrait of a cyberpunk character with neon lights, detailed facial features, futuristic city background" },
    { label: "Landscape", text: "A majestic mountain landscape at sunset, photorealistic, 8k resolution, dramatic lighting" },
    { label: "Product", text: "Professional product photography of a smartwatch, sleek design, studio lighting, neutral background" },
    { label: "Abstract", text: "Abstract digital art with flowing geometric shapes, vibrant colors, intricate patterns" },
];

export function TextPromptInput({
    maxLength = 500,
    onPromptChange,
    className
}: TextPromptInputProps) {
    const [prompt, setPrompt] = useState('');
    const [history, setHistory] = useState<string[]>([]);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load history and draft on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('prompt_history');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("Failed to parse history", e);
            }
        }

        const savedDraft = localStorage.getItem('prompt_draft');
        if (savedDraft) {
            setPrompt(savedDraft);
            onPromptChange?.(savedDraft);
        }
    }, [onPromptChange]);

    const addToHistory = (text: string) => {
        if (!text.trim()) return;
        const newHistory = [text, ...history.filter(h => h !== text)].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('prompt_history', JSON.stringify(newHistory));
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxLength) {
            setPrompt(value);
            onPromptChange?.(value);

            // Auto-save draft
            if (saveTimeout.current) clearTimeout(saveTimeout.current);
            saveTimeout.current = setTimeout(() => {
                localStorage.setItem('prompt_draft', value);
                // Also optionally add to history if long enough and paused? 
                // Better to add to history on "Generate" click, but we don't control that here.
                // We'll rely on a manual save or just history of *used* prompts if we could hook into generate.
                // For now, let's just stick to local draft.
            }, 2000);
        }
    };

    const handleClear = () => {
        setPrompt('');
        onPromptChange?.('');
        localStorage.removeItem('prompt_draft');
    };

    const applyTemplate = (templateText: string) => {
        setPrompt(templateText);
        onPromptChange?.(templateText);
        addToHistory(templateText); // Track usage
    };

    return (
        <div className={cn("w-full space-y-4  p-4 border rounded-lg bg-card text-card-foreground shadow-sm", className)}>

            <div className="flex items-center justify-between">
                <Label htmlFor="prompt-input" className="text-base font-semibold">
                    2. Describe your image
                </Label>
                <div className="flex items-center gap-2">
                    {/* Templates Dropdown */}
                    <Select onValueChange={applyTemplate}>
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Load Template" />
                        </SelectTrigger>
                        <SelectContent>
                            {TEMPLATES.map((t) => (
                                <SelectItem key={t.label} value={t.text} className="text-xs">
                                    <Sparkles className="w-3 h-3 mr-2 inline" />
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleClear}
                        title="Clear prompt"
                    >
                        <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                </div>
            </div>

            <div className="relative">
                <textarea
                    id="prompt-input"
                    value={prompt}
                    onChange={handleChange}
                    placeholder="Describe what you want to see... (e.g. 'A futuristic city skyline')"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    spellCheck="false"
                />
                <div className="absolute right-2 bottom-2 text-xs text-muted-foreground bg-background/80 px-1 rounded">
                    {prompt.length} / {maxLength}
                </div>
            </div>

            {/* History / Suggestions */}
            {history.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <History className="w-3 h-3" />
                        <span>Recent</span>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted">
                        {history.slice(0, 5).map((item, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setPrompt(item);
                                    onPromptChange?.(item);
                                }}
                                className="flex-none max-w-[200px] px-3 py-1.5 bg-secondary/50 hover:bg-secondary text-secondary-foreground rounded-md text-xs transition-colors truncate text-left border"
                                title={item}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
