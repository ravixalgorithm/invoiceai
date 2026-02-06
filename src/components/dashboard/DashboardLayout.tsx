"use client";

import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ChatPanel } from "./ChatPanel";

/*
  LAYOUT STRUCTURE (FLEXBOX GRID):
  - Root: flex container, min-h-screen bg-[#FFFFFF]
  - Sidebar: w-64 md:w-72 bg-[#F8FAFC] shadow-md fixed h-screen z-40
  - ChatPanel: w-80 fixed right-0 h-screen z-40 (only on invoice pages)
  - Main: ml-0 md:ml-72 lg:mr-80 p-8 bg-[#FFFFFF]
*/

interface DashboardLayoutProps {
    children: React.ReactNode;
    organization?: any;
    organizations?: any[];
    user?: any;
    profile?: any;
    showChatPanel?: boolean;
    headerTitle?: string;
    headerActions?: React.ReactNode;
    onOrgChange?: (org: any) => void;
}

export function DashboardLayout({ children, organization, organizations = [], user, profile, showChatPanel = false, headerTitle, headerActions, onOrgChange }: DashboardLayoutProps) {
    return (
        <div className="flex min-h-screen bg-[#F0F0F0] font-sans relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 bg-fixed"></div>
            <Sidebar organization={organization} organizations={organizations} user={user} profile={profile} onOrgChange={onOrgChange} />

            <main className={`flex-1 ml-0 md:ml-72 ${showChatPanel ? 'lg:mr-80' : ''} p-8 bg-background relative z-0 transition-all duration-300`}>
                <DashboardHeader title={headerTitle}>
                    {headerActions}
                </DashboardHeader>
                <div className="w-full max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {showChatPanel && <ChatPanel />}
        </div>
    );
}
