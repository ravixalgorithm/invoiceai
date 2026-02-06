"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Building2, User } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboard } from "@/app/dashboard/layout";
import Link from "next/link";

// Generate a playful random avatar using DiceBear
const getDefaultAvatar = (seed: string) => {
    const styles = ['adventurer', 'avataaars', 'big-smile', 'bottts', 'fun-emoji', 'lorelei', 'notionists', 'open-peeps', 'thumbs'];
    const style = styles[Math.floor(seed.charCodeAt(0) % styles.length)];
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=6366f1,a78bfa,f472b6,fb923c,facc15,4ade80`;
};

// Max file size: 500KB
const MAX_AVATAR_SIZE = 500 * 1024;

export default function ProfilePage() {
    const supabase = createClient();
    const { user, organizations: sharedOrgs, profile: sharedProfile } = useDashboard();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [profile, setProfile] = useState({
        full_name: "",
        avatar_url: ""
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [organizations, setOrganizations] = useState<any[]>([]);
    const [memberOrgs, setMemberOrgs] = useState<any[]>([]);

    useEffect(() => {
        // Sync from shared context
        setOrganizations(sharedOrgs);
        if (sharedProfile) {
            setProfile({
                full_name: sharedProfile.full_name || "",
                avatar_url: sharedProfile.avatar_url || ""
            });
        }

        // Fetch organizations user is a member of
        const fetchMemberOrgs = async () => {
            if (!user) return;
            const { data: memberData } = await supabase
                .from('organization_members')
                .select('*, organizations(*)')
                .eq('user_id', user.id);
            setMemberOrgs(memberData || []);
        };
        fetchMemberOrgs();
    }, [sharedOrgs, sharedProfile, user]);

    const uploadFile = async (file: File, path: string) => {
        try {
            const { error } = await supabase.storage
                .from('org-assets')
                .upload(path, file, { upsert: true });
            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('org-assets')
                .getPublicUrl(path);

            return publicUrl;
        } catch (e) {
            console.error("Upload failed", e);
            return null;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let avatarUrl = profile.avatar_url;

            if (avatarFile) {
                if (avatarFile.size > MAX_AVATAR_SIZE) {
                    alert("Avatar file must be under 500KB");
                    setLoading(false);
                    return;
                }
                const path = `${user.id}/avatar-${Date.now()}`;
                const uploaded = await uploadFile(avatarFile, path);
                if (uploaded) avatarUrl = uploaded;
            }

            // Upsert profile
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: profile.full_name,
                    avatar_url: avatarUrl,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setProfile({ ...profile, avatar_url: avatarUrl });
            setIsEditing(false);
            alert("Profile updated!");

        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update profile.");
        } finally {
            setLoading(false);
        }
    };

    const headerActions = !isEditing ? (
        <button
            onClick={() => setIsEditing(true)}
            className="bg-black text-white px-6 py-2 font-bold border-2 border-black shadow-[3px_3px_0px_0px_#6366F1] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#6366F1] transition-all rounded-lg font-[family-name:var(--font-bricolage)]"
        >
            Edit
        </button>
    ) : null;

    return (
        <>
            <DashboardHeader title="Profile">
                {headerActions}
            </DashboardHeader>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Profile Section */}
                <section>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-cursive)]">My Profile</h1>
                    </div>

                    {!isEditing ? (
                        <div className="bg-white p-8 border-2 border-dashed border-gray-300 rounded-xl">
                            <div className="flex items-center gap-6 mb-6">
                                <img
                                    src={profile.avatar_url || getDefaultAvatar(user?.email || user?.id)}
                                    alt="Avatar"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-black bg-white"
                                />
                                <div>
                                    <h2 className="text-2xl font-bold font-[family-name:var(--font-bricolage)]">
                                        {profile.full_name || "No name set"}
                                    </h2>
                                    <p className="text-gray-500">{user?.email}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="bg-white p-8 border-2 border-dashed border-gray-300 rounded-xl space-y-6">
                            <div className="flex items-start gap-6">
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <img
                                            src={avatarFile ? URL.createObjectURL(avatarFile) : (profile.avatar_url || getDefaultAvatar(user?.email || user?.id))}
                                            alt="Avatar"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-dashed border-gray-300 bg-white"
                                        />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file && file.size > MAX_AVATAR_SIZE) {
                                                    alert("Avatar file must be under 500KB");
                                                    return;
                                                }
                                                setAvatarFile(file || null);
                                            }}
                                            className="absolute inset-0 opacity-0 cursor-pointer rounded-full"
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2">{avatarFile ? avatarFile.name : "Change Avatar (max 500KB)"}</span>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Full Name</label>
                                    <input
                                        value={profile.full_name}
                                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                        placeholder="Your name"
                                        className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none rounded-md"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 font-bold border-2 border-gray-300 text-gray-600 hover:bg-gray-50 transition-all rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-black text-white px-8 py-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366F1] active:shadow-none transition-all rounded-lg"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : "Save"}
                                </button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Organizations Section */}
                <section>
                    <h2 className="text-2xl font-bold font-[family-name:var(--font-cursive)] mb-6">My Organizations</h2>
                    <div className="space-y-4">
                        {organizations.length === 0 && memberOrgs.length === 0 && (
                            <p className="text-gray-500 italic">You are not part of any organization yet.</p>
                        )}

                        {organizations.map((org) => (
                            <Link key={org.id} href="/dashboard/organization">
                                <div className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-xl flex items-center gap-4 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                                    {org.logo_url ? (
                                        <img src={org.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg">{org.business_name}</h3>
                                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Owner</span>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {memberOrgs.map((member) => (
                            <div key={member.id} className="bg-white p-6 border-2 border-dashed border-gray-300 rounded-xl flex items-center gap-4">
                                {member.organizations?.logo_url ? (
                                    <img src={member.organizations.logo_url} alt="Logo" className="w-12 h-12 object-contain" />
                                ) : (
                                    <div className="w-12 h-12 bg-gray-200 text-gray-600 rounded-lg flex items-center justify-center">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-bold text-lg">{member.organizations?.business_name}</h3>
                                    <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{member.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
