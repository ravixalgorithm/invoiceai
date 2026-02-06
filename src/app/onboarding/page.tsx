"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, Upload, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        business_name: "",
        phone: "",
        address_line_1: "",
        city: "",
        state: "",
        pincode: "",
        gst_number: "",
    });

    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [signatureFile, setSignatureFile] = useState<File | null>(null);

    const fillMockData = () => {
        setFormData({
            business_name: "Acme Innovations Pvt Ltd",
            phone: "+91 98765 43210",
            address_line_1: "42, Tech Park, Koramangala",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560034",
            gst_number: "29ABCDE1234F1Z5",
        });
    };

    const uploadFile = async (file: File, path: string) => {
        try {
            const { data, error } = await supabase.storage
                .from('org-assets')
                .upload(path, file);
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
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("No user found");

            let logoUrl = null;
            let signatureUrl = null;

            if (logoFile) {
                const path = `${user.id}/logo-${Date.now()}`;
                logoUrl = await uploadFile(logoFile, path);
            }

            if (signatureFile) {
                const path = `${user.id}/signature-${Date.now()}`;
                signatureUrl = await uploadFile(signatureFile, path);
            }

            const { error } = await supabase
                .from('organizations')
                .insert({
                    user_id: user.id,
                    ...formData,
                    logo_url: logoUrl,
                    signature_url: signatureUrl,
                    country: 'India'
                });

            if (error) throw error;

            router.push("/dashboard");

        } catch (error) {
            console.error("Onboarding failed", error);
            alert("Failed to create organization. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white border-4 border-dashed border-gray-900 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-8">

                <div className="flex justify-between items-center mb-8 border-b-2 border-dashed border-gray-200 pb-4">
                    <div>
                        <h1 className="text-3xl font-bold font-[family-name:var(--font-cursive)]">Setup your Business</h1>
                        <p className="text-gray-500 font-[family-name:var(--font-bricolage)]">Tell us about your organization to get started.</p>
                    </div>
                    <button
                        type="button"
                        onClick={fillMockData}
                        className="flex items-center gap-2 text-sm font-bold text-[#6366F1] hover:underline"
                    >
                        <Sparkles size={16} />
                        Fill Mock Data
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* File Uploads */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold mb-2 font-[family-name:var(--font-bricolage)]">Logo</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <Upload className="mb-2 text-gray-400" />
                                <span className="text-sm text-gray-500">{logoFile ? logoFile.name : "Upload Logo"}</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-2 font-[family-name:var(--font-bricolage)]">Signature</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                <Upload className="mb-2 text-gray-400" />
                                <span className="text-sm text-gray-500">{signatureFile ? signatureFile.name : "Upload Signature"}</span>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Business Name</label>
                            <input
                                required
                                value={formData.business_name}
                                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Phone</label>
                            <input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">GST Number</label>
                            <input
                                value={formData.gst_number}
                                onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                            />
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Address</label>
                        <input
                            value={formData.address_line_1}
                            onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                            className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none mb-4"
                            placeholder="Street Address"
                        />
                        <div className="grid grid-cols-3 gap-4">
                            <input
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                                placeholder="City"
                            />
                            <input
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                                placeholder="State"
                            />
                            <input
                                value={formData.pincode}
                                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                className="w-full px-4 py-2 border-2 border-black focus:ring-2 focus:ring-[#6366F1] outline-none"
                                placeholder="ZIP / Pincode"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white text-xl px-8 py-4 font-bold border-2 border-black shadow-[4px_4px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366F1] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-[family-name:var(--font-bricolage)]"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto" /> : "Complete Setup"}
                    </button>

                </form>
            </div>
        </div>
    );
}
