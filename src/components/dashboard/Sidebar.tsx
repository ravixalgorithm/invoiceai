"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, LogOut, Building2, Plus, ChevronsUpDown, Check, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Organization {
    id: string;
    business_name: string;
    logo_url?: string;
    email?: string;
}

interface ProfileProps {
    full_name?: string;
    avatar_url?: string;
}

const NavItem = ({ icon: Icon, label, href, active = false }: { icon: any, label: string, href: string, active?: boolean }) => {
    return (
        <Link href={href} className="w-full">
            <button
                className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-150 text-left border-2",
                    active
                        ? "bg-[#6366F1] text-white border-[#6366F1] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        : "bg-white text-ink-primary border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
            >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
            </button>
        </Link>
    );
};

interface UserProps {
    email?: string;
    id: string;
}

// Generate a playful random avatar using DiceBear
const getDefaultAvatar = (seed: string) => {
    const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'open-peeps', 'thumbs'];
    const style = styles[Math.floor(seed.charCodeAt(0) % styles.length)];
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1,a78bfa,f472b6,fb923c,facc15,4ade80`;
};

interface SidebarProps {
    organization?: Organization | null;
    organizations?: Organization[];
    user?: UserProps;
    profile?: ProfileProps | null;
    onOrgChange?: (org: Organization) => void;
    className?: string;
    onClose?: () => void;
}

export function Sidebar({ organization, organizations = [], user, profile, onOrgChange, className, onClose }: SidebarProps) {
    const pathname = usePathname();
    const avatarUrl = profile?.avatar_url || getDefaultAvatar(user?.email || user?.id || 'user');
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'User';
    const [showOrgDropdown, setShowOrgDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowOrgDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleOrgSelect = (org: Organization) => {
        if (onOrgChange) {
            onOrgChange(org);
        }
        setShowOrgDropdown(false);
    };

    return (
        <aside className={cn("fixed left-0 top-0 h-[100dvh] w-full sm:w-72 md:w-72 bg-white border-r-2 border-dashed border-black flex flex-col z-40 transition-transform duration-300 overflow-y-auto", className)}>
            {/* Mobile Header with Close */}
            {onClose && (
                <div className="md:hidden flex items-center justify-between p-4 border-b border-dashed border-gray-200">
                    <span className="font-bold text-sm text-gray-400 uppercase tracking-wider">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="p-4 md:p-6 flex flex-col flex-1">
                {/* Logo / Organization Switcher */}
                <div className="mb-8 relative" ref={dropdownRef}>
                    <button
                        onClick={() => organizations.length > 0 && setShowOrgDropdown(!showOrgDropdown)}
                        className={cn(
                            "w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-400 rounded-xl bg-gray-50/50 transition-all",
                            organizations.length > 0 && "hover:border-black hover:bg-white cursor-pointer"
                        )}
                    >
                        {organization?.logo_url ? (
                            <img src={organization.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white font-bold border-2 border-transparent">
                                {organization?.business_name ? organization.business_name.substring(0, 2).toUpperCase() : <Building2 size={24} />}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-lg font-bold text-black truncate font-[family-name:var(--font-bricolage)]">
                                {organization?.business_name || "invoiceai"}
                            </h1>
                        </div>
                        {organizations.length > 0 && (
                            <ChevronsUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                    </button>

                    {/* Dropdown */}
                    {showOrgDropdown && organizations.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50">
                            <div className="p-2 border-b border-dashed border-gray-200">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">Switch Organization</span>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {organizations.map((org) => (
                                    <button
                                        key={org.id}
                                        onClick={() => handleOrgSelect(org)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left",
                                            organization?.id === org.id && "bg-gray-100"
                                        )}
                                    >
                                        {org.logo_url ? (
                                            <img src={org.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white text-xs font-bold">
                                                {org.business_name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="flex-1 font-bold truncate text-sm">{org.business_name}</span>
                                        {organization?.id === org.id && (
                                            <Check className="w-4 h-4 text-green-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                            <Link href="/dashboard/organization" onClick={() => setShowOrgDropdown(false)}>
                                <div className="p-3 border-t border-dashed border-gray-200 flex items-center gap-2 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                    <Plus className="w-4 h-4" />
                                    Add Organization
                                </div>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1 mt-6">
                    <NavItem icon={Plus} label="New Invoice" href="/dashboard" active={pathname === '/dashboard'} />
                    <NavItem icon={FileText} label="My Invoices" href="/dashboard/invoices" active={pathname === '/dashboard/invoices'} />
                    <NavItem icon={Building2} label="Organization" href="/dashboard/organization" active={pathname === '/dashboard/organization'} />
                </nav>

                {/* Bottom Profile Section */}
                <div className="mt-auto pt-12 pb-8 border-t-2 border-dashed border-gray-300">
                    <Link href="/dashboard/profile">
                        <div className="flex items-center gap-3 p-3 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white mb-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                            <img
                                src={avatarUrl}
                                alt="Avatar"
                                className="w-10 h-10 rounded-full object-cover bg-white"
                            />
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-black truncate">
                                    {displayName}
                                </span>
                                <span className="text-xs text-gray-500 truncate">
                                    {user?.email}
                                </span>
                            </div>
                        </div>
                    </Link>

                    <form action="/auth/signout" method="post">
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold border-2 border-transparent hover:border-black hover:bg-red-50 hover:text-red-600 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 text-left text-gray-600"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </form>
                </div>
            </div>
        </aside>
    );
}
