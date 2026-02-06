"use client";

import Link from "next/link";

export default function LandingPage() {
    return (
        <div className="min-h-screen mb-5 bg-white font-sans text-gray-900 overflow-x-hidden flex flex-col border-x-2 border-dashed border-gray-900 max-w-7xl mx-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">

            {/* Navigation */}
            <nav className="h-24 flex items-center justify-between px-8 border-b-2 border-dashed border-gray-900 bg-white sticky top-0 z-50">
                <div className="flex flex-col">
                    <div className="text-3xl font-bold tracking-tighter text-black font-[family-name:var(--font-bricolage)] leading-none">
                        invoiceai
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Powered by</span>
                        <img src="/Octo-Icon.svg" alt="Tambo" className="w-3 h-3 object-contain" />
                        <span className="text-[#7FFFC3] font-extrabold text-xs uppercase tracking-wider bg-black px-1 rounded-sm">Tambo AI</span>
                    </div>
                </div>
                <div className="flex gap-8">
                    <Link
                        href="/dashboard"
                        className="bg-black text-white text-lg px-6 py-2 font-bold border-2 border-black shadow-[5px_5px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#6366F1] transition-all font-[family-name:var(--font-bricolage)]"
                    >
                        Get started
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="flex flex-col md:flex-row border-b-2 border-dashed border-gray-900 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-gray-900">
                {/* Left Content */}
                <div className="flex-1 p-12 flex flex-col justify-center items-start bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <h1 className="text-5xl md:text-8xl font-bold text-black mb-6 leading-[0.9] font-[family-name:var(--font-cursive)]">
                        Invoices&nbsp;that <br />
                        <span className="text-[#6366F1] underline decoration-wavy decoration-2 underline-offset-2">slap harder</span> <br />
                        than coffee.
                    </h1>

                    <p className="text-2xl text-gray-600 mb-12 font-medium max-w-lg font-[family-name:var(--font-bricolage)]">
                        Stop sending ugly PDFs that look like they were made in Microsoft Word 97. Our AI does the math so you can pretend to be a professional.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full mb-8">
                        <Link
                            href="/dashboard"
                            className="bg-black text-white text-2xl px-8 py-4 font-bold border-2 border-black shadow-[5px_5px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#6366F1] transition-all font-[family-name:var(--font-bricolage)]"
                        >
                            Make Money
                        </Link>
                        <button
                            className="bg-white text-black text-2xl px-8 py-4 font-bold border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-[family-name:var(--font-bricolage)]"
                        >
                            Steal Code
                        </button>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2">
                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Engineered by</span>
                        <img src="/Octo-Icon.svg" alt="Tambo" className="w-4 h-4 object-contain" />
                        <span className="text-[#7FFFC3] font-extrabold text-sm uppercase tracking-wider bg-black px-1.5 py-0.5 rounded-sm">Tambo AI</span>
                    </div>
                </div>

                {/* Right Visual */}
                <div className="flex-1 min-h-[500px] relative overflow-hidden flex items-center justify-center p-8 bg-white">
                    {/* "Crazy" UI Elements Mockup */}
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6),linear-gradient(45deg,#f3f4f6_25%,transparent_25%,transparent_75%,#f3f4f6_75%,#f3f4f6)] [background-position:0_0,10px_10px] [background-size:20px_20px] opacity-20"></div>

                    <div className="relative w-80 h-96 bg-white border-4 border-dashed border-gray-900 rotate-3 shadow-[15px_15px_0px_0px_rgba(0,0,0,0.1)] flex flex-col">
                        <div className="h-12 border-b-4 border-dashed border-gray-900 flex items-center px-4 gap-2">
                            <div className="w-4 h-4 rounded-full border-2 border-black bg-red-400"></div>
                            <div className="w-4 h-4 rounded-full border-2 border-black bg-yellow-400"></div>
                            <div className="w-4 h-4 rounded-full border-2 border-black bg-green-400"></div>
                        </div>
                        <div className="flex-1 p-6 font-mono text-sm">
                            <p className="mb-4">Invoice #69420</p>
                            <p className="mb-2 font-bold text-xl">$1,000,000.00</p>
                            <p className="text-gray-500">Due: Yesterday</p>
                            <div className="mt-8 h-2 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-[#6366F1]"></div>
                            </div>
                            <div className="mt-8 text-center text-xs text-gray-400 uppercase tracking-widest font-bold">
                                Generated by Tambo
                            </div>
                        </div>
                    </div>

                    <div className="absolute top-20 right-20 w-32 h-32 bg-[#6366F1] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                    <div className="absolute bottom-10 left-10 w-48 h-48 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-75"></div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="bg-white">
                <div className="grid grid-cols-1 md:grid-cols-3">
                    {/* Card 1 */}
                    <div className="border-1 border-dashed border-gray-900 p-8 hover:bg-gray-50 transition-colors">
                        <h4 className="font-bold text-3xl mb-4 font-[family-name:var(--font-cursive)]">AI That Judges</h4>
                        <p className="text-lg text-gray-700 font-medium font-[family-name:var(--font-bricolage)]">
                            Our AI knows when you're undercharging. It won't stop you, but it will silently judge your life choices.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="border-1 border-dashed border-gray-900 p-8 hover:bg-gray-50 transition-colors">
                        <h4 className="font-bold text-3xl mb-4 font-[family-name:var(--font-cursive)]">Fast AF</h4>
                        <p className="text-lg text-gray-700 font-medium font-[family-name:var(--font-bricolage)]">
                            Loads faster than your freelance career took to take off. Optimized for chaos (and slow wifi).
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="border-1 border-dashed border-gray-900 p-8 hover:bg-gray-50 transition-colors">
                        <h4 className="font-bold text-3xl mb-4 font-[family-name:var(--font-cursive)]">Stupid Simple</h4>
                        <p className="text-lg text-gray-700 font-medium font-[family-name:var(--font-bricolage)]">
                            We removed all the buttons you don't need. If you can't figure it out, maybe get a regular job.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="border-b-2 border-dashed border-gray-900 bg-[#FFF7ED]">
                <div className="p-12 text-center border-b-2 border-dashed border-gray-900">
                    <h2 className="text-5xl font-bold mb-6 font-[family-name:var(--font-cursive)]">How it works</h2>
                    <p className="text-xl font-[family-name:var(--font-bricolage)] max-w-2xl mx-auto">
                        It's easier than explaining to your parents what you actually do for a living.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-gray-900">
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-3xl font-bold font-[family-name:var(--font-cursive)] mb-6 shadow-[4px_4px_0px_0px_rgba(99,102,241,1)]">1</div>
                        <h3 className="text-2xl font-bold mb-4 font-[family-name:var(--font-bricolage)]">Yell at AI</h3>
                        <p className="font-[family-name:var(--font-bricolage)]">"Make me an invoice for $500." The AI does the heavy lifting while you reconsider your rates.</p>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-[#6366F1] text-white rounded-full flex items-center justify-center text-3xl font-bold font-[family-name:var(--font-cursive)] mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">2</div>
                        <h3 className="text-2xl font-bold mb-4 font-[family-name:var(--font-bricolage)]">Magic Happens</h3>
                        <p className="font-[family-name:var(--font-bricolage)]">Tambo AI generates a pixel-perfect invoice instead of the garbage you usually send.</p>
                    </div>
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center text-3xl font-bold font-[family-name:var(--font-cursive)] mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">3</div>
                        <h3 className="text-2xl font-bold mb-4 font-[family-name:var(--font-bricolage)]">Get Ghosted</h3>
                        <p className="font-[family-name:var(--font-bricolage)]">Send the invoice. Wait 6 months for payment. At least your invoice looked cool.</p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="bg-white border-b-2 border-dashed border-gray-900">
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y-2 md:divide-y-0 md:divide-x-2 divide-dashed divide-gray-900">
                    <div className="p-12 flex flex-col justify-between">
                        <div>
                            <h2 className="text-6xl font-bold mb-4 font-[family-name:var(--font-cursive)]">Free</h2>
                            <p className="text-xl font-[family-name:var(--font-bricolage)] mb-8">Because you're broke.</p>
                            <ul className="space-y-4 font-[family-name:var(--font-bricolage)] text-lg">
                                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> 1 Organization</li>
                                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Unlimited Sadness</li>
                                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Basic Branding</li>
                                <li className="flex items-center gap-2"><span className="text-green-500 font-bold">✓</span> Watermark saying you're cheap</li>
                            </ul>
                        </div>
                        <button className="mt-8 w-full bg-white text-black text-xl px-8 py-4 font-bold border-2 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all font-[family-name:var(--font-bricolage)]">
                            Stay Broke
                        </button>
                    </div>
                    <div className="p-12 bg-black text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-[#6366F1] text-white text-xs font-bold px-3 py-1 font-[family-name:var(--font-bricolage)]">FOR CHADS</div>
                        <div>
                            <h2 className="text-6xl font-bold mb-4 font-[family-name:var(--font-cursive)]">Pro</h2>
                            <p className="text-xl font-[family-name:var(--font-bricolage)] mb-8 text-gray-300">Fake it till you make it.</p>
                            <ul className="space-y-4 font-[family-name:var(--font-bricolage)] text-lg">
                                <li className="flex items-center gap-2"><span className="text-[#6366F1] font-bold">✓</span> Unlimited Organizations</li>
                                <li className="flex items-center gap-2"><span className="text-[#6366F1] font-bold">✓</span> Remove "Cheap" Watermark</li>
                                <li className="flex items-center gap-2"><span className="text-[#6366F1] font-bold">✓</span> Dark Mode (Spooky)</li>
                                <li className="flex items-center gap-2"><span className="text-[#6366F1] font-bold">✓</span> Priority Emotional Support</li>
                            </ul>
                        </div>
                        <button className="mt-8 w-full bg-[#6366F1] text-white text-xl px-8 py-4 font-bold border-2 border-white shadow-[5px_5px_0px_0px_#ffffff] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0px_0px_#ffffff] transition-all font-[family-name:var(--font-bricolage)]">
                            Waste $10/mo
                        </button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="bg-white p-12 border-b-2 border-dashed border-gray-900">
                <h2 className="text-5xl font-bold mb-12 text-center font-[family-name:var(--font-cursive)]">Questions You Probably Have</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
                    <div>
                        <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-bricolage)]">Is this AI legit?</h3>
                        <p className="text-gray-600 font-[family-name:var(--font-bricolage)]">It's powered by Tambo AI. So yes, it's smarter than you and your accountant combined.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-bricolage)]">Can I invoice my mom?</h3>
                        <p className="text-gray-600 font-[family-name:var(--font-bricolage)]">You can try, but she brought you into this world, so maybe give her a discount.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-bricolage)]">Will this fit my aesthetic?</h3>
                        <p className="text-gray-600 font-[family-name:var(--font-bricolage)]">If your aesthetic is "desperate freelancer trying to look professional," then yes.</p>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold mb-2 font-[family-name:var(--font-bricolage)]">Why is it free?</h3>
                        <p className="text-gray-600 font-[family-name:var(--font-bricolage)]">We steal your data. Just kidding. (Unless?)</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#6366F1] text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10"></div>
                <h2 className="text-6xl md:text-8xl font-bold mb-8 font-[family-name:var(--font-cursive)] relative z-10">
                    Stop procrastinating.
                </h2>
                <Link
                    href="/dashboard"
                    className="inline-block bg-white text-black text-2xl px-12 py-6 font-bold border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-[family-name:var(--font-bricolage)] relative z-10"
                >
                    Generate Invoice Now
                </Link>
            </section>

            {/* Footer */}
            <footer className="border-t-2 border-dashed border-gray-900 p-8 flex justify-between items-center bg-gray-50">
                <div className="flex flex-col gap-1">
                    <div className="font-[family-name:var(--font-bricolage)] text-xl font-bold">invoiceai © 2026</div>
                    <div className="text-xs text-gray-500 font-[family-name:var(--font-bricolage)]">Don't sue us.</div>
                </div>

                {/* Footer Branding */}
                <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-gray-500">Powered by</span>
                    <img src="/Octo-Icon.svg" alt="Tambo" className="w-4 h-4 object-contain" />
                    <span className="text-[#7FFFC3] font-extrabold text-xs uppercase tracking-wider bg-black px-1.5 py-0.5 rounded-sm">Tambo AI</span>
                </div>
            </footer>

        </div>
    );
}
