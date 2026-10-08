import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from "../config";
import { Bot, Send, Sparkles, RefreshCw, AlertCircle, User, Cpu, ArrowRight } from "lucide-react";

export interface ChatMessageItem {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
}

export interface RawApiMessage {
    role: string;
    content: string;
}

const SUGGESTIONS = [
    "What is the forecast for Item 7?",
    "What is the production plan for Item 7?",
    "What is the risk of our current production plan?",
    "What happens if demand increases by 15%?",
];

export function AssistantPage() {
    const [messages, setMessages] = useState<ChatMessageItem[]>([
        {
            id: "welcome-1",
            role: "assistant",
            content:
                "Hello! I am your AI Demand & Production Planning Assistant powered by real-time tool calling. I can query item forecasts, production schedules, Monte Carlo risk metrics, and run what-if simulation scenarios for you. How can I help with your plan today?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    const [rawConversation, setRawConversation] = useState<RawApiMessage[]>([]);
    const [inputMessage, setInputMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = async (textOverride?: string) => {
        const textToSubmit = textOverride || inputMessage;
        if (!textToSubmit.trim() || isLoading) return;

        const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        const userMsgId = `user-${Date.now()}`;

        const userMsg: ChatMessageItem = {
            id: userMsgId,
            role: "user",
            content: textToSubmit.trim(),
            timestamp: timeStr,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputMessage("");
        setIsLoading(true);
        setError(null);

        const updatedHistory: RawApiMessage[] = [
            ...rawConversation,
            { role: "user", content: textToSubmit.trim() },
        ];

        try {
            const res = await fetch(`${API_BASE_URL}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: textToSubmit.trim(),
                    conversation: updatedHistory,
                }),
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            const replyText = data.response || data.message || "No response received from assistant.";

            const assistantMsg: ChatMessageItem = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: replyText,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };

            setMessages((prev) => [...prev, assistantMsg]);
            setRawConversation([
                ...updatedHistory,
                { role: "assistant", content: replyText },
            ]);
        } catch (err: unknown) {
            console.error("Chat error:", err);
            const errorMessage = err instanceof Error ? err.message : "Failed to connect to AI Assistant endpoint.";
            setError(`Unable to send message: ${errorMessage}. Ensure backend is running at ${API_BASE_URL}.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                role: "assistant",
                content: "Conversation history cleared. What else would you like to analyze?",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            },
        ]);
        setRawConversation([]);
        setError(null);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] max-h-[900px] space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-slate-200 flex items-center justify-between shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
                        <Sparkles className="w-4 h-4" />
                        <span>GPT-6 Intelligent Assistant</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        AI Planning Assistant
                    </h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Ask natural language questions about demand, production plans, risk analysis, or what-if scenarios.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>Engine Online</span>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium shadow-xs transition-colors cursor-pointer"
                        title="Clear conversation history"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Clear</span>
                    </button>
                </div>
            </div>

            {/* Suggested Prompts Bar */}
            <div className="shrink-0 bg-slate-100/70 border border-slate-200/80 rounded-xl p-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-blue-600" />
                    <span>Quick Questions & Tool Triggers</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((prompt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSendMessage(prompt)}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 text-xs font-medium shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <span>{prompt}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="shrink-0 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{error}</span>
                    </div>
                    <button
                        onClick={() => setError(null)}
                        className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Chat History Box */}
            <div className="flex-1 overflow-y-auto bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${
                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                        }`}
                    >
                        {/* Avatar */}
                        <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-2xs ${
                                msg.role === "user" ? "bg-blue-600" : "bg-slate-900"
                            }`}
                        >
                            {msg.role === "user" ? (
                                <User className="w-4 h-4" />
                            ) : (
                                <Bot className="w-4 h-4 text-blue-400" />
                            )}
                        </div>

                        {/* Content Card */}
                        <div
                            className={`max-w-2xl rounded-2xl p-4 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                                msg.role === "user"
                                    ? "bg-blue-600 text-white rounded-tr-xs"
                                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-4 pb-1 mb-1 border-b border-white/10 font-medium text-[11px] opacity-80">
                                <span>{msg.role === "user" ? "You" : "AI Planner"}</span>
                                <span>{msg.timestamp}</span>
                            </div>
                            <div className="whitespace-pre-wrap font-sans">
                                {msg.content}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Loading Bubble */}
                {isLoading && (
                    <div className="flex items-start gap-3 flex-row">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0 text-blue-400 shadow-2xs">
                            <Bot className="w-4 h-4 animate-bounce" />
                        </div>
                        <div className="bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl rounded-tl-xs p-4 shadow-2xs flex items-center gap-3 text-xs">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping [animation-delay:0.2s]"></div>
                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping [animation-delay:0.4s]"></div>
                            </div>
                            <span className="font-medium text-slate-600">
                                AI Assistant is fetching tools & analyzing data...
                            </span>
                        </div>
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Form Bar */}
            <div className="shrink-0 bg-white border border-slate-200/90 rounded-xl p-3 shadow-xs">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Ask a question about demand, production plans, risk analysis, or what-if scenarios..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-50"
                    />
                    <button
                        onClick={() => handleSendMessage()}
                        disabled={isLoading || !inputMessage.trim()}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-lg transition-all shadow-xs disabled:opacity-40 cursor-pointer shrink-0"
                    >
                        <span>Send</span>
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
