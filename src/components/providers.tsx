"use client";

import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { TamboProvider } from "@tambo-ai/react";

export function Providers({ children }: { children: React.ReactNode }) {
    const mcpServers = useMcpServers();
    const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

    if (!apiKey) {
        // In development, this might happen during hot reload if environment variables aren't loaded yet?
        // Or if the user hasn't set it.
        // We will let Tambo SDK handle the error if key is missing/invalid, or show a UI error.
    }

    return (
        <TamboProvider
            apiKey={apiKey!}
            components={components}
            tools={tools}
            tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
            mcpServers={mcpServers}
        >
            {children}
        </TamboProvider>
    );
}
