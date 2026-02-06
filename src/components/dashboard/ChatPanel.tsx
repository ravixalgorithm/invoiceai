"use client";

import { useTamboThread, useTambo } from "@tambo-ai/react";
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton } from "@/components/tambo/message-input";
import { ThreadContent, ThreadContentMessages } from "@/components/tambo/thread-content";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { Send, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
    className?: string;
    onClose?: () => void;
}

export function ChatPanel({ className, onClose }: ChatPanelProps) {
    const { startNewThread } = useTamboThread();
    const { thread } = useTambo();
    const messages = thread?.messages ?? [];
    const hasMessages = messages.filter((m: any) => m.role !== 'system').length > 0;

    return (
        <aside className={cn("h-[100dvh] w-full md:w-80 md:fixed md:right-0 md:top-0 bg-white border-l-2 border-dashed border-black flex flex-col transition-transform duration-300", className)}>
            <div className="p-4 border-b-2 border-dashed border-black flex items-center justify-between bg-yellow-100/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5 mt-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                    </span>
                    <div className="flex flex-col">
                        <h2 className="font-bold text-black font-[family-name:var(--font-bricolage)] uppercase tracking-wider text-lg leading-none">
                            AI Assistant
                        </h2>
                        <span className="text-xs font-bold tracking-wider uppercase text-gray-400 mt-0.5 flex items-center gap-1">
                            Powered by
                            <img src="/Octo-Icon.svg" alt="Tambo" className="w-3 h-3 object-contain" />
                            <span className="text-[#7FFFC3] font-extrabold">Tambo AI</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => startNewThread()}
                        className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors group"
                        title="Clear Chat History"
                    >
                        <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1.5 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-hidden relative bg-white flex flex-col">
                <ScrollableMessageContainer className="flex-1">
                    <ThreadContent>
                        <ThreadContentMessages />
                        {!hasMessages && (
                            <div className="flex flex-col items-center justify-center min-h-[400px] h-full p-8 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black rotate-3">
                                    <img src="/Octo-Icon.svg" alt="Tambo" className="w-10 h-10 animate-bounce" />
                                </div>
                                <h3 className="text-xl font-bold text-black font-[family-name:var(--font-bricolage)] mb-2 uppercase tracking-tight">
                                    Ready to assist!
                                </h3>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-[200px]">
                                    Type below to start creating your perfect invoice.
                                </p>
                                <div className="mt-6 flex flex-col gap-2 w-full max-w-[240px]">
                                    <div className="p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 text-left">
                                        "Create an invoice for Acme Corp"
                                    </div>
                                    <div className="p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-[10px] font-bold text-gray-400 text-left">
                                        "Add 5% discount to this invoice"
                                    </div>
                                </div>
                            </div>
                        )}
                    </ThreadContent>
                </ScrollableMessageContainer>
            </div>

            <div className="bg-white border-t-2 border-dashed border-black">
                <MessageInput variant="ghost" className="relative">
                    <MessageInputTextarea
                        placeholder="✨ Describe your invoice here... e.g. 'Create an invoice for John Doe with 2 items'"
                        className="w-full h-full min-h-[140px] pr-12 pl-4 pt-[6px] pb-3 bg-yellow-100/50 bg-[linear-gradient(transparent_31px,#e5e7eb_31px)] bg-[length:100%_32px] bg-local font-[family-name:var(--font-bricolage)] resize-none focus:ring-0 border-none rounded-none focus:outline-none [&_.tiptap]:!p-0 [&_.tiptap]:!leading-8 [&_p]:!leading-8 [&_p]:!my-0 placeholder:text-gray-400 placeholder:italic"
                    />
                    <MessageInputSubmitButton className="absolute right-3 bottom-3 p-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#6366F1]/90 transition-colors z-10">
                        <Send className="w-4 h-4" />
                    </MessageInputSubmitButton>
                </MessageInput>
            </div>
        </aside>
    );
}
