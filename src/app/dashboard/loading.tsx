"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] w-full animate-in fade-in duration-300">
            <div className="relative mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black rotate-3">
                    <img src="/Octo-Icon.svg" alt="Tambo" className="w-10 h-10 animate-bounce" />
                </div>
                <div className="absolute -bottom-2 -right-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#6366F1]" />
                </div>
            </div>
            <h3 className="text-xl font-bold text-black font-[family-name:var(--font-bricolage)] mb-2 uppercase tracking-tight">
                Preparing your view...
            </h3>
            <p className="text-sm text-gray-500 font-medium animate-pulse">
                One moment while we grab your data
            </p>
        </div>
    );
}
