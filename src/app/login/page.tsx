"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const supabase = createClient();

    const handleOAuthLogin = async (provider: "google" | "github") => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });

        if (error) {
            setMessage(error.message);
            setIsLoading(false);
        }
        // redirect happens automatically
    };

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        const action = isSignUp ? supabase.auth.signUp : supabase.auth.signInWithPassword;

        const { data, error } = await action({
            email,
            password,
            options: isSignUp ? {
                emailRedirectTo: `${location.origin}/auth/callback`
            } : undefined
        });

        if (error) {
            setMessage(error.message);
            setIsLoading(false);
            return;
        }

        if (isSignUp && data.user && !data.session) {
            setMessage("Check your email for the confirmation link!");
            setIsLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <div className="min-h-screen bg-white font-sans text-gray-900 flex flex-col border-x-2 border-dashed border-gray-900 max-w-7xl mx-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] -z-10"></div>

            {/* Navigation */}
            <nav className="h-20 flex items-center justify-between px-8 border-b-2 border-dashed border-gray-900 bg-white">
                <Link href="/" className="text-3xl font-bold tracking-tighter text-black font-[family-name:var(--font-bricolage)]">
                    invoiceai
                </Link>
            </nav>

            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md bg-white border-4 border-dashed border-gray-900 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rotate-1 hover:rotate-0 transition-transform duration-300">
                    <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-cursive)] text-center">
                        {isSignUp ? "Join the chaos" : "Welcome back"}
                    </h1>
                    <p className="text-center text-gray-600 mb-8 font-[family-name:var(--font-bricolage)]">
                        {isSignUp ? "Create beautiful invoices in seconds." : "Your invoices missed you."}
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => handleOAuthLogin("google")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black text-lg px-6 py-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-[family-name:var(--font-bricolage)]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Continue with Google"}
                        </button>
                        <button
                            onClick={() => handleOAuthLogin("github")}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-black text-lg px-6 py-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-[family-name:var(--font-bricolage)]"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : "Continue with GitHub"}
                        </button>
                    </div>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t-2 border-dashed border-gray-300"></span>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500 font-mono">Or with email</span>
                        </div>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border-2 border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                                placeholder="you@chaos.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1 font-[family-name:var(--font-bricolage)]">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border-2 border-black font-mono focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent transition-all"
                                placeholder="••••••••"
                            />
                        </div>

                        {message && (
                            <div className="p-3 bg-red-100 border-2 border-red-500 text-red-700 font-bold text-sm">
                                {message}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-black text-white text-lg px-6 py-3 font-bold border-2 border-black shadow-[4px_4px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366F1] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-[family-name:var(--font-bricolage)]"
                        >
                            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUp ? "Sign Up" : "Sign In")}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setMessage(null);
                            }}
                            className="text-sm font-bold underline decoration-dashed hover:text-[#6366F1] transition-colors font-[family-name:var(--font-bricolage)]"
                        >
                            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                        </button>
                    </div>

                </div>
            </div>

            {/* Footer */}
            <footer className="border-t-2 border-dashed border-gray-900 p-8 flex justify-between items-center bg-gray-50">
                <div className="font-[family-name:var(--font-bricolage)] text-xl font-bold">invoiceai © 2026</div>
            </footer>
        </div>
    );
}
