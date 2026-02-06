"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
    title?: string;
    children?: React.ReactNode;
}

export function DashboardHeader({ title, children }: DashboardHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-ink-secondary">
                <Link href="/dashboard" className="hover:text-black hover:underline transition-colors">
                    Dashboard
                </Link>
                {title && (
                    <>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-ink-primary">{title}</span>
                    </>
                )}
            </div>

            {/* Actions - passed as children */}
            {children && (
                <div className="flex items-center gap-3">
                    {children}
                </div>
            )}
        </header>
    );
}
