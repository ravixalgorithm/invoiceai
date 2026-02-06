"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, createContext, useContext } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ChatPanel } from "@/components/dashboard/ChatPanel";
import { Loader2 } from "lucide-react";

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

    const showChatPanel = pathname === '/dashboard';

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
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
        }

        // Fetch profile
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        setProfile(profileData);

        setLoading(false);
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

                {/* Persistent Sidebar */}
                <Sidebar
                    organization={selectedOrg}
                    organizations={organizations}
                    user={user}
                    profile={profile}
                    onOrgChange={handleOrgChange}
                />

                {/* Main Content - this is what changes on navigation */}
                <main className={`flex-1 ml-0 md:ml-72 ${showChatPanel ? 'lg:mr-80' : ''} p-8 bg-background relative z-0 transition-all duration-300`}>
                    <div className="w-full max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>

                {/* Chat Panel - only on invoice creation page */}
                {showChatPanel && <ChatPanel />}
            </div>
        </DashboardContext.Provider>
    );
}
