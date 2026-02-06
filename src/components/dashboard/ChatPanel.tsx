"use client";

import { useTamboThread } from "@tambo-ai/react";
import { MessageInput, MessageInputTextarea, MessageInputSubmitButton } from "@/components/tambo/message-input";
import { ThreadContent, ThreadContentMessages } from "@/components/tambo/thread-content";
import { ScrollableMessageContainer } from "@/components/tambo/scrollable-message-container";
import { Send, Trash2 } from "lucide-react";

export function ChatPanel() {
    const { startNewThread } = useTamboThread();

    return (
        <aside className="fixed right-0 top-0 h-screen w-80 bg-white border-l-2 border-dashed border-black flex flex-col z-40 hidden lg:flex">
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
                <button
                    onClick={() => startNewThread()}
                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors group"
                    title="Clear Chat History"
                >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-white flex flex-col">
                <ScrollableMessageContainer>
                    <ThreadContent>
                        <ThreadContentMessages />
                    </ThreadContent>
                </ScrollableMessageContainer>
            </div>

            <div className="bg-white border-t-2 border-dashed border-black">
                <MessageInput variant="ghost" className="relative">
                    <MessageInputTextarea
                        placeholder="Type to edit invoice..."
                        className="w-full h-full min-h-[140px] pr-12 pl-4 pt-[6px] pb-3 bg-yellow-100/50 bg-[linear-gradient(transparent_31px,#e5e7eb_31px)] bg-[length:100%_32px] bg-local font-[family-name:var(--font-bricolage)] resize-none focus:ring-0 border-none rounded-none focus:outline-none [&_.tiptap]:!p-0 [&_.tiptap]:!leading-8 [&_p]:!leading-8 [&_p]:!my-0"
                    />
                    <MessageInputSubmitButton className="absolute right-3 bottom-3 p-2 rounded-lg bg-[#6366F1] text-white hover:bg-[#6366F1]/90 transition-colors z-10">
                        <Send className="w-4 h-4" />
                    </MessageInputSubmitButton>
                </MessageInput>
            </div>
        </aside>
    );
}
