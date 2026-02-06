"use client";

import { createClient } from "@/lib/supabase/client";
import { Loader2, FileText, Clock, CheckCircle2, Send, Plus, Search, Trash2, Download, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboard } from "@/app/dashboard/layout";
import Link from "next/link";

interface Invoice {
    id: string;
    invoice_number: string;
    status: 'draft' | 'completed' | 'sent';
    client_name: string;
    client_email: string;
    total: number;
    invoice_date: string;
    created_at: string;
    organization_id: string;
}

const statusConfig = {
    draft: {
        label: 'Draft',
        icon: Clock,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        dotColor: 'bg-yellow-500'
    },
    completed: {
        label: 'Completed',
        icon: CheckCircle2,
        color: 'bg-green-100 text-green-700 border-green-300',
        dotColor: 'bg-green-500'
    },
    sent: {
        label: 'Sent',
        icon: Send,
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        dotColor: 'bg-blue-500'
    }
};

export default function InvoicesPage() {
    const supabase = createClient();
    const { selectedOrg } = useDashboard();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");

    useEffect(() => {
        if (selectedOrg) {
            fetchInvoices(selectedOrg.id);
        }
    }, [selectedOrg]);

    const fetchInvoices = async (orgId: string) => {
        setLoading(true);
        const { data: invoicesData, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('organization_id', orgId)
            .order('created_at', { ascending: false });

        if (!error && invoicesData) {
            setInvoices(invoicesData);
        }
        setLoading(false);
    };

    const handleDelete = async (invoiceId: string) => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;

        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', invoiceId);

        if (!error) {
            setInvoices(invoices.filter(inv => inv.id !== invoiceId));
        }
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoice.client_email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const stats = {
        total: invoices.length,
        draft: invoices.filter(i => i.status === 'draft').length,
        completed: invoices.filter(i => i.status === 'completed').length,
        sent: invoices.filter(i => i.status === 'sent').length,
        totalValue: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0)
    };

    const headerActions = (
        <Link href="/dashboard">
            <button className="flex items-center gap-2 bg-black text-white px-6 py-2.5 font-bold border-2 border-black shadow-[4px_4px_0px_0px_#6366F1] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_#6366F1] transition-all rounded-xl font-[family-name:var(--font-bricolage)]">
                <Plus className="w-5 h-5" />
                New Invoice
            </button>
        </Link>
    );

    return (
        <>
            <DashboardHeader title="Invoices">
                {headerActions}
            </DashboardHeader>

            <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 border-2 border-dashed border-gray-300 rounded-xl">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Invoices</p>
                        <p className="text-2xl font-bold mt-1">{stats.total}</p>
                    </div>
                    <div className="bg-white p-4 border-2 border-dashed border-yellow-300 rounded-xl">
                        <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Drafts</p>
                        <p className="text-2xl font-bold mt-1 text-yellow-700">{stats.draft}</p>
                    </div>
                    <div className="bg-white p-4 border-2 border-dashed border-green-300 rounded-xl">
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-bold mt-1 text-green-700">{stats.completed}</p>
                    </div>
                    <div className="bg-white p-4 border-2 border-dashed border-blue-300 rounded-xl">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">Total Value</p>
                        <p className="text-2xl font-bold mt-1 text-blue-700">{formatCurrency(stats.totalValue)}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by client name, email or invoice number..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-black rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'draft', 'completed', 'sent'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-xl font-bold border-2 transition-all ${statusFilter === status
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white text-gray-600 border-gray-300 hover:border-black'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Invoices List */}
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-xl overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">
                                {invoices.length === 0
                                    ? "No invoices yet. Create your first invoice!"
                                    : "No invoices match your search."}
                            </p>
                            {invoices.length === 0 && (
                                <Link href="/dashboard">
                                    <button className="mt-4 bg-black text-white px-6 py-2 font-bold rounded-lg">
                                        Create Invoice
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-dashed divide-gray-200">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-1">Invoice</div>
                                <div className="col-span-3">Client</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Amount</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {/* Invoice Rows */}
                            {filteredInvoices.map((invoice) => {
                                const statusInfo = statusConfig[invoice.status];

                                return (
                                    <div
                                        key={invoice.id}
                                        className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors items-center"
                                    >
                                        {/* Invoice Number */}
                                        <div className="col-span-1">
                                            <span className="font-bold text-sm">
                                                #{invoice.invoice_number || invoice.id.slice(0, 8)}
                                            </span>
                                        </div>

                                        {/* Client */}
                                        <div className="col-span-3">
                                            <p className="font-bold truncate">{invoice.client_name || "No client"}</p>
                                            <p className="text-sm text-gray-500 truncate">{invoice.client_email || "-"}</p>
                                        </div>

                                        {/* Date */}
                                        <div className="col-span-2 text-sm text-gray-600">
                                            {formatDate(invoice.invoice_date || invoice.created_at)}
                                        </div>

                                        {/* Status */}
                                        <div className="col-span-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor}`}></span>
                                                {statusInfo.label}
                                            </span>
                                        </div>

                                        {/* Amount */}
                                        <div className="col-span-2 text-right">
                                            <span className="font-bold">{formatCurrency(invoice.total || 0)}</span>
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-2 flex items-center justify-end gap-2">
                                            <Link href={`/dashboard?id=${invoice.id}`}>
                                                <button
                                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                            </Link>
                                            <button
                                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice.id)}
                                                className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
