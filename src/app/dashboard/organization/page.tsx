"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Building2, Plus, ChevronRight, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboard } from "@/app/dashboard/layout";

export default function OrganizationSettingsPage() {
    const supabase = createClient();
    const { user, organizations: sharedOrgs, setSelectedOrg: updateSharedOrg, refreshOrganizations } = useDashboard();
    const [loading, setLoading] = useState(false);

    const [organizations, setOrganizations] = useState<any[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<any>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [formData, setFormData] = useState({
        business_name: "",
        phone: "",
        address_line_1: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
        logo_url: "",
        signature_url: ""
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);

    // Member State (for selected org)
    const [members, setMembers] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteLoading, setInviteLoading] = useState(false);

    useEffect(() => {
        // Sync organizations from shared context
        setOrganizations(sharedOrgs);
    }, [sharedOrgs]);

    const selectOrganization = async (org: any) => {
        setSelectedOrg(org);
        setFormData({
            business_name: org.business_name || "",
            phone: org.phone || "",
            address_line_1: org.address_line_1 || "",
            city: org.city || "",
            state: org.state || "",
            pincode: org.pincode || "",
            gst_number: org.gst_number || "",
            logo_url: org.logo_url || "",
            signature_url: org.signature_url || ""
        });
        setIsEditing(false);
        setIsCreating(false);

        // Fetch members & invites for this org
        const { data: membersData } = await supabase
            .from('organization_members')
            .select('*, users:user_id(email)')
            .eq('organization_id', org.id);
        setMembers(membersData || []);

        const { data: invitesData } = await supabase
            .from('organization_invites')
            .select('*')
            .eq('organization_id', org.id)
            .eq('status', 'pending');
        setInvites(invitesData || []);
    };

    const startCreating = () => {
        setSelectedOrg(null);
        setFormData({
            business_name: "",
            phone: "",
            address_line_1: "",
            city: "",
            state: "",
            pincode: "",
            gst_number: "",
            logo_url: "",
            signature_url: ""
        });
        setLogoFile(null);
        setSignatureFile(null);
        setIsCreating(true);
        setIsEditing(false);
    };

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
            let logoUrl = formData.logo_url;
            let sigUrl = formData.signature_url;

            if (logoFile) {
                const path = `${user.id}/logo-${Date.now()}`;
                const uploaded = await uploadFile(logoFile, path);
                if (uploaded) logoUrl = uploaded;
            }

            if (signatureFile) {
                const path = `${user.id}/signature-${Date.now()}`;
                const uploaded = await uploadFile(signatureFile, path);
                if (uploaded) sigUrl = uploaded;
            }

            const orgData = {
                ...formData,
                logo_url: logoUrl,
                signature_url: sigUrl,
                user_id: user.id,
                updated_at: new Date().toISOString()
            };

            if (isCreating) {
                // Create new org
                const { data: newOrg, error } = await supabase
                    .from('organizations')
                    .insert([orgData])
                    .select()
                    .single();

                if (error) throw error;

                setOrganizations([...organizations, newOrg]);
                setSelectedOrg(newOrg);
                setIsCreating(false);
                alert("Organization created!");
            } else {
                // Update existing org
                const { error } = await supabase
                    .from('organizations')
                    .update(orgData)
                    .eq('id', selectedOrg.id);

                if (error) throw error;

                setOrganizations(organizations.map(o => o.id === selectedOrg.id ? { ...o, ...orgData } : o));
                setSelectedOrg({ ...selectedOrg, ...orgData });
                setIsEditing(false);
                alert("Organization updated!");
            }

            setLogoFile(null);
            setSignatureFile(null);

        } catch (error) {
            console.error("Save failed", error);
            alert("Failed to save organization.");
        } finally {
            setLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail.trim() || !selectedOrg) return;

        setInviteLoading(true);
        try {
            const { error } = await supabase
                .from('organization_invites')
                .insert([{
                    organization_id: selectedOrg.id,
                    email: inviteEmail.trim(),
                    status: 'pending'
                }]);

            if (error) throw error;

            const { data: invitesData } = await supabase
                .from('organization_invites')
                .select('*')
                .eq('organization_id', selectedOrg.id)
                .eq('status', 'pending');
            setInvites(invitesData || []);
            setInviteEmail("");
            alert("Invite sent!");
        } catch (error) {
            console.error("Invite failed", error);
            alert("Failed to send invite.");
        } finally {
            setInviteLoading(false);
        }
    };

    const headerActions = (
        <button
            onClick={startCreating}
            className="flex items-center gap-2 bg-black text-white px-6 py-2 font-bold border-2 border-black shadow-[3px_3px_0px_0px_#6366F1] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#6366F1] transition-all rounded-lg font-[family-name:var(--font-bricolage)]"
        >
            <Plus className="w-5 h-5" />
            Add Organization
        </button>
    );

    return (
        <>
            <DashboardHeader title="Organizations">
                {headerActions}
            </DashboardHeader>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Organizations List */}
                    <div className="lg:col-span-1 space-y-4">
                        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Your Organizations</h2>

                        {organizations.length === 0 && !isCreating && (
                            <p className="text-gray-400 italic text-sm">No organizations yet. Create one to get started!</p>
                        )}

                        {organizations.map((org) => (
                            <button
                                key={org.id}
                                onClick={() => selectOrganization(org)}
                                className={`w-full text-left p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${selectedOrg?.id === org.id && !isCreating
                                    ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white'
                                    : 'border-dashed border-gray-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white'
                                    }`}
                            >
                                {org.logo_url ? (
                                    <img src={org.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">{org.business_name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{org.city || "No location"}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400" />
                            </button>
                        ))}
                    </div>

                    {/* Organization Details / Form */}
                    <div className="lg:col-span-2">
                        {!selectedOrg && !isCreating ? (
                            <div className="bg-white p-12 border-2 border-dashed border-gray-300 rounded-xl text-center">
                                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">Select an organization or create a new one</p>
                            </div>
                        ) : (
                            <div className="bg-white p-8 border-2 border-dashed border-gray-300 rounded-xl relative overflow-hidden">
                                <div className="absolute top-4 right-4 pointer-events-none opacity-10">
                                    <Building2 className="w-24 h-24" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <h2 className="text-xl font-bold font-[family-name:var(--font-bricolage)]">
                                        {isCreating ? "New Organization" : formData.business_name || "Organization Details"}
                                    </h2>
                                    {!isCreating && !isEditing && (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="text-sm bg-black text-white px-4 py-1.5 font-bold rounded-lg"
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>

                                {/* View Mode */}
                                {!isEditing && !isCreating && selectedOrg && (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-6">
                                            {formData.logo_url ? (
                                                <img src={formData.logo_url} alt="Logo" className="w-16 h-16 object-contain border-2 border-dashed border-gray-200 rounded-lg p-1" />
                                            ) : (
                                                <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold">{formData.business_name}</h3>
                                                {formData.gst_number && <p className="text-sm text-gray-500">GST: {formData.gst_number}</p>}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold">Phone</p>
                                                <p>{formData.phone || "Not set"}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold">Address</p>
                                                <p>
                                                    {formData.address_line_1 || "Not set"}
                                                    {formData.city && `, ${formData.city}`}
                                                    {formData.state && `, ${formData.state}`}
                                                    {formData.pincode && ` - ${formData.pincode}`}
                                                </p>
                                            </div>
                                        </div>

                                        {formData.signature_url && (
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase font-bold mb-2">Signature</p>
                                                <img src={formData.signature_url} alt="Signature" className="h-10 object-contain" />
                                            </div>
                                        )}

                                        {/* Team Members Section */}
                                        <div className="border-t-2 border-dashed border-gray-200 pt-6 mt-6">
                                            <h3 className="text-lg font-bold mb-4">Team Members</h3>

                                            {/* Invite Form */}
                                            <form onSubmit={handleInvite} className="flex gap-2 mb-4">
                                                <input
                                                    type="email"
                                                    value={inviteEmail}
                                                    onChange={(e) => setInviteEmail(e.target.value)}
                                                    placeholder="Enter email to invite"
                                                    className="flex-1 px-3 py-2 border-2 border-black rounded-lg text-sm"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={inviteLoading}
                                                    className="bg-black text-white px-4 py-2 font-bold text-sm rounded-lg"
                                                >
                                                    {inviteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Invite"}
                                                </button>
                                            </form>

                                            {/* Members List */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                    <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
                                                        {user?.email?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm flex-1">{user?.email}</span>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Owner</span>
                                                </div>

                                                {members.filter(m => m.user_id !== user?.id).map((member) => (
                                                    <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                                                            {(member.users?.email || "?").charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm flex-1">{member.users?.email || "Unknown"}</span>
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold capitalize">{member.role}</span>
                                                    </div>
                                                ))}

                                                {invites.map((invite) => (
                                                    <div key={invite.id} className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
                                                        <div className="w-8 h-8 rounded-full bg-yellow-400 text-white flex items-center justify-center text-xs font-bold">
                                                            {invite.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="text-sm flex-1">{invite.email}</span>
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Pending</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Edit/Create Form */}
                                {(isEditing || isCreating) && (
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* File Uploads */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Logo</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                    {formData.logo_url && !logoFile ? (
                                                        <img src={formData.logo_url} className="h-12 object-contain" />
                                                    ) : (
                                                        <Upload className="text-gray-400 w-6 h-6" />
                                                    )}
                                                    <span className="text-xs text-gray-500 mt-1">{logoFile ? logoFile.name : "Upload"}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Signature</label>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                                    {formData.signature_url && !signatureFile ? (
                                                        <img src={formData.signature_url} className="h-12 object-contain" />
                                                    ) : (
                                                        <Upload className="text-gray-400 w-6 h-6" />
                                                    )}
                                                    <span className="text-xs text-gray-500 mt-1">{signatureFile ? signatureFile.name : "Upload"}</span>
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Basic Info */}
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Business Name *</label>
                                            <input
                                                required
                                                value={formData.business_name}
                                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                                className="w-full px-4 py-2 border-2 border-black rounded-md"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-1">Phone</label>
                                                <input
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-1">GST Number</label>
                                                <input
                                                    value={formData.gst_number}
                                                    onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                                    className="w-full px-4 py-2 border-2 border-black rounded-md"
                                                />
                                            </div>
                                        </div>

                                        {/* Address */}
                                        <div>
                                            <label className="block text-sm font-bold mb-1">Address</label>
                                            <input
                                                value={formData.address_line_1}
                                                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                                placeholder="Street Address"
                                                className="w-full px-4 py-2 border-2 border-black rounded-md mb-2"
                                            />
                                            <div className="grid grid-cols-3 gap-2">
                                                <input
                                                    value={formData.city}
                                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                    placeholder="City"
                                                    className="px-4 py-2 border-2 border-black rounded-md"
                                                />
                                                <input
                                                    value={formData.state}
                                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                    placeholder="State"
                                                    className="px-4 py-2 border-2 border-black rounded-md"
                                                />
                                                <input
                                                    value={formData.pincode}
                                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                                    placeholder="Pincode"
                                                    className="px-4 py-2 border-2 border-black rounded-md"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setIsCreating(false);
                                                    if (selectedOrg) selectOrganization(selectedOrg);
                                                }}
                                                className="px-6 py-2 font-bold border-2 border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-black text-white px-6 py-2 font-bold border-2 border-black shadow-[3px_3px_0px_0px_#6366F1] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#6366F1] transition-all rounded-lg"
                                            >
                                                {loading ? <Loader2 className="animate-spin" /> : (isCreating ? "Create" : "Save")}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
