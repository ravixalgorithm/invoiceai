"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { Loader2, Menu, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Organization {
    id: string;
    business_name: string;
    logo_url?: string;
    email?: string;
    phone?: string;
    address_line_1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    gst_number?: string;
    pan_number?: string;
}

interface Profile {
    full_name?: string;
    avatar_url?: string;
}

interface DashboardContextType {
    user: any;
    organizations: Organization[];
    selectedOrg: Organization | null;
    profile: Profile | null;
    setSelectedOrg: (org: Organization) => void;
    refreshOrganizations: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within DashboardLayout");
    }
    return context;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const showChatPanel = pathname === '/dashboard';
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser();

            if (authError) {
                console.error("Auth error:", authError);
                router.push("/login");
                return;
            }

            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch organizations
            const { data: orgs } = await supabase
                .from('organizations')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            setOrganizations(orgs || []);
            if (orgs && orgs.length > 0) {
                setSelectedOrg(orgs[0]);
            } else {
                // No organizations - redirect to onboarding
                router.push("/onboarding");
                return;
            }

            // Fetch profile (optional - don't fail if missing)
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            setLoading(false);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
            router.push("/login");
        }
    };

    const refreshOrganizations = async () => {
        if (!user) return;
        const { data: orgs } = await supabase
            .from('organizations')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });
        setOrganizations(orgs || []);
    };

    const handleOrgChange = (org: Organization) => {
        setSelectedOrg(org);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F0F0F0]">
                <Loader2 className="animate-spin w-8 h-8" />
            </div>
        );
    }

    return (
        <DashboardContext.Provider value={{
            user,
            organizations,
            selectedOrg,
            profile,
            setSelectedOrg,
            refreshOrganizations
        }}>
            <div className="flex min-h-screen bg-[#F0F0F0] font-sans relative">
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10 bg-fixed"></div>

                {/* Mobile Header - only after mount to avoid hydration mismatch */}
                {mounted && (
                    <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b-2 border-dashed border-black z-30 flex items-center justify-between px-3">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1.5">
                            <img src="/Octo-Icon.svg" alt="Tambo" className="w-5 h-5" />
                            <span className="font-bold text-lg font-[family-name:var(--font-bricolage)] tracking-tight">invoiceai</span>
                        </div>
                        <div className="w-9 flex justify-end">
                            {showChatPanel && (
                                <button
                                    onClick={() => setIsChatOpen(true)}
                                    className="p-1.5 bg-black rounded-lg shadow-[2px_2px_0px_0px_rgba(99,102,241,1)] active:translate-y-[1px] active:shadow-none transition-all"
                                >
                                    <img src="/Octo-Icon.svg" alt="AI" className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </header>
                )}

                {/* Mobile Backdrop */}
                {mounted && (isSidebarOpen || isChatOpen) && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => { setIsSidebarOpen(false); setIsChatOpen(false); }}
                    />
                )}

                {/* Persistent Sidebar */}
                {/* Desktop: Always visible */}
                <div className="hidden md:block">
                    <Sidebar
                        organization={selectedOrg}
                        organizations={organizations}
                        user={user}
                        profile={profile}
                        onOrgChange={handleOrgChange}
                    />
                </div>
                {/* Mobile: Drawer */}
                {mounted && (
                    <div className={cn(
                        "md:hidden fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out",
                        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}>
                        <Sidebar
                            organization={selectedOrg}
                            organizations={organizations}
                            user={user}
                            profile={profile}
                            onOrgChange={handleOrgChange}
                            onClose={() => setIsSidebarOpen(false)}
                        />
                    </div>
                )}

                {/* Main Content - this is what changes on navigation */}
                <main className={cn(
                    "flex-1 ml-0 md:ml-72 p-4 md:p-8 bg-background relative z-0 transition-all duration-300 pt-20 md:pt-8",
                    showChatPanel ? 'lg:mr-80' : ''
                )}>
                    <div className="w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Chat Panel - only on invoice creation page */}
                {showChatPanel && (
                    <>
                        {/* Desktop: Always visible */}
                        <div className="hidden lg:block">
                            <ChatPanel />
                        </div>
                        {/* Mobile/Tablet: Drawer */}
                        <div className={cn(
                            "lg:hidden fixed inset-y-0 right-0 z-50 transition-transform duration-300 ease-in-out",
                            isChatOpen ? "translate-x-0" : "translate-x-full"
                        )}>
                            <ChatPanel onClose={() => setIsChatOpen(false)} />
                        </div>
                    </>
                )}
            </div>
        </DashboardContext.Provider>
    );
}
