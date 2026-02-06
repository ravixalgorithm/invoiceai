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
                <div className="bg-white border-2 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="p-24 text-center flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 animate-spin text-[#6366F1] mb-4" />
                            <p className="text-gray-400 font-medium animate-pulse">Fetching your invoices...</p>
                        </div>
                    ) : filteredInvoices.length === 0 ? (
                        <div className="p-12 text-center">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium font-[family-name:var(--font-bricolage)]">
                                {invoices.length === 0
                                    ? "No invoices yet. Create your first invoice!"
                                    : "No invoices match your search."}
                            </p>
                            {invoices.length === 0 && (
                                <Link href="/dashboard">
                                    <button className="mt-4 bg-black text-white px-6 py-2 font-bold rounded-xl shadow-[4px_4px_0px_0px_rgba(99,102,241,1)] active:translate-y-[2px] active:shadow-none transition-all">
                                        Create Invoice
                                    </button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y-2 divide-gray-100">
                            {/* Table Header */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b-2 border-black/5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                <div className="col-span-1">Invoice</div>
                                <div className="col-span-3">Client Information</div>
                                <div className="col-span-2">Date</div>
                                <div className="col-span-2">Status</div>
                                <div className="col-span-2 text-right">Total Amount</div>
                                <div className="col-span-2 text-right px-4">Actions</div>
                            </div>

                            {/* Invoice Rows */}
                            {filteredInvoices.map((invoice) => {
                                const statusInfo = statusConfig[invoice.status];

                                return (
                                    <div key={invoice.id} className="group transition-all">
                                        {/* Desktop View */}
                                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-5 hover:bg-yellow-50/30 transition-all items-center border-l-4 border-transparent hover:border-[#6366F1]">
                                            <div className="col-span-1">
                                                <span className="font-black text-sm bg-gray-100 px-2 py-1 rounded border-2 border-black inline-block">
                                                    #{invoice.invoice_number || invoice.id.slice(0, 4)}
                                                </span>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="font-bold text-black text-base truncate font-[family-name:var(--font-bricolage)]">
                                                    {invoice.client_name || "No client"}
                                                </p>
                                                <p className="text-xs text-gray-500 truncate font-medium">{invoice.client_email || "No email provided"}</p>
                                            </div>
                                            <div className="col-span-2 text-sm font-bold text-gray-600">
                                                {formatDate(invoice.invoice_date || invoice.created_at)}
                                            </div>
                                            <div className="col-span-2">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border-2 border-black bg-white ${statusInfo.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} border border-black/20`}></span>
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="col-span-2 text-right">
                                                <span className="font-black text-lg text-black">{formatCurrency(invoice.total || 0)}</span>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-2 px-4">
                                                <Link href={`/dashboard?id=${invoice.id}`}>
                                                    <button className="p-2.5 bg-white border-2 border-black rounded-xl hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none" title="View & Edit">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button className="p-2.5 bg-white border-2 border-black rounded-xl hover:bg-gray-50 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none" title="Download PDF">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(invoice.id)}
                                                    className="p-2.5 bg-red-50 text-red-500 border-2 border-red-500 rounded-xl hover:bg-red-100 transition-all shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] active:translate-y-[1px] active:shadow-none"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Mobile View - Polished Card */}
                                        <div className="md:hidden p-4">
                                            <div className="bg-white border-2 border-black rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                                                <div className="flex justify-between items-start mb-4">
                                                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter border-2 border-black">
                                                        #{invoice.invoice_number || invoice.id.slice(0, 8)}
                                                    </span>
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border-2 border-black ${statusInfo.color}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                <div className="mb-6">
                                                    <h3 className="text-xl font-bold font-[family-name:var(--font-bricolage)] text-black mb-1">
                                                        {invoice.client_name || "No client"}
                                                    </h3>
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span className="text-xs font-bold">{formatDate(invoice.invoice_date || invoice.created_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-black/10">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Amount</p>
                                                        <p className="text-xl font-black text-black">
                                                            {formatCurrency(invoice.total || 0)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Link href={`/dashboard?id=${invoice.id}`}>
                                                            <button className="p-3 bg-white border-2 border-black rounded-xl hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </Link>
                                                        <button className="p-3 bg-white border-2 border-black rounded-xl hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px]">
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(invoice.id)}
                                                            className="p-3 bg-red-50 text-red-500 border-2 border-red-500 rounded-xl hover:bg-red-100 transition-colors shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] active:shadow-none active:translate-y-[2px]"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
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
