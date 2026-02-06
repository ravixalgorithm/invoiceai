"use client";

import { InvoiceForm, InvoiceFormRef } from "@/components/dashboard/InvoiceForm";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { useDashboard } from "./layout";
import { useRef, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Download, Save, MessageCircle, Mail, X, Check } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function DashboardPage() {
    const { user, selectedOrg } = useDashboard();
    const invoiceFormRef = useRef<InvoiceFormRef>(null);
    const supabase = createClient();
    const searchParams = useSearchParams();
    const invoiceId = searchParams.get('id');

    const [saving, setSaving] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [savedSuccess, setSavedSuccess] = useState(false);
    const [lastSavedInvoice, setLastSavedInvoice] = useState<any>(null);
    const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

    // Load invoice from URL if ID is present
    useEffect(() => {
        if (invoiceId && user && selectedOrg) {
            loadInvoice(invoiceId);
        }
    }, [invoiceId, user, selectedOrg]);

    const loadInvoice = async (id: string) => {
        const { data, error } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (data && invoiceFormRef.current) {
            invoiceFormRef.current.loadInvoice(data);
            setCurrentInvoiceId(data.id);
            setLastSavedInvoice(data);
        }
    };

    const handleSaveDraft = async () => {
        if (!invoiceFormRef.current || !selectedOrg || !user) {
            alert("Please select an organization first");
            return null;
        }

        setSaving(true);
        try {
            const data = invoiceFormRef.current.getData();

            const invoiceData = {
                organization_id: selectedOrg.id,
                created_by: user.id,
                invoice_number: data.invoice_number,
                status: 'draft' as const,
                client_name: data.client_name || null,
                client_email: data.client_email || null,
                client_address: data.client_address || null,
                items: data.items,
                subtotal: data.subtotal,
                tax_rate: data.tax_rate,
                tax_amount: data.tax_amount,
                discount_rate: data.discount_rate,
                discount_amount: data.discount_amount,
                total: data.total,
                invoice_date: data.invoice_date ? new Date(data.invoice_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                due_date: data.due_date ? new Date(data.due_date).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                notes: data.notes || null,
                updated_at: new Date().toISOString()
            };

            let saved;
            let error;

            if (currentInvoiceId) {
                // Update existing
                const result = await supabase
                    .from('invoices')
                    .update(invoiceData)
                    .eq('id', currentInvoiceId)
                    .select()
                    .single();
                saved = result.data;
                error = result.error;
            } else {
                // Insert new
                const result = await supabase
                    .from('invoices')
                    .insert(invoiceData)
                    .select()
                    .single();
                saved = result.data;
                error = result.error;
            }

            if (error) throw error;

            setSavedSuccess(true);
            setLastSavedInvoice(saved);
            setCurrentInvoiceId(saved.id);
            setTimeout(() => setSavedSuccess(false), 3000);
            return saved;
        } catch (error: any) {
            console.error("Save failed:", error);
            alert(`Failed to save invoice: ${error?.message || error?.details || JSON.stringify(error)}`);
            return null;
        } finally {
            setSaving(false);
        }
    };

    const handleDownload = async () => {
        if (!invoiceFormRef.current) return;

        // Auto-save before download
        const saved = await handleSaveDraft();
        if (!saved) return; // Stop if save failed

        setDownloading(true);
        try {
            const element = invoiceFormRef.current.getElement();
            if (!element) return;

            // Use hidden iframe to print
            const invoiceData = invoiceFormRef.current.getData();

            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            document.body.appendChild(iframe);

            const doc = iframe.contentWindow?.document;
            if (!doc) {
                alert("Failed to create print document");
                return;
            }

            // Clean Invoice Template
            doc.open();
            doc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Invoice #${invoiceData.invoice_number}</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
                        * { box-sizing: border-box; margin: 0; padding: 0; }
                        body { 
                            font-family: 'Inter', system-ui, -apple-system, sans-serif; 
                            padding: 40px; 
                            color: #111; 
                            max-width: 210mm;
                            margin: 0 auto;
                        }
                        
                        /* Header */
                        .header { display: flex; justify-content: space-between; margin-bottom: 60px; }
                        .logo { max-height: 60px; max-width: 200px; margin-bottom: 20px; object-fit: contain; }
                        .company-name { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
                        .company-info { font-size: 13px; line-height: 1.5; color: #555; }
                        
                        .invoice-title { text-align: right; }
                        .invoice-title h1 { font-size: 42px; font-weight: 900; letter-spacing: -1px; margin-bottom: 10px; }
                        .meta-group { display: flex; justify-content: flex-end; gap: 24px; }
                        .meta-item { text-align: right; }
                        .meta-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 2px; }
                        .meta-value { font-size: 14px; font-weight: 600; font-family: 'Courier New', monospace; }

                        /* Bill To */
                        .bill-to { margin-bottom: 50px; }
                        .section-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px; display: inline-block; }
                        .client-name { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
                        .client-details { font-size: 14px; color: #555; line-height: 1.6; }

                        /* Table */
                        table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
                        th { text-align: left; padding: 12px 8px; border-bottom: 2px solid #000; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; }
                        td { padding: 16px 8px; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
                        .text-right { text-align: right; }
                        tr:last-child td { border-bottom: none; }

                        /* Totals */
                        .totals-container { display: flex; justify-content: flex-end; }
                        .totals-box { width: 320px; }
                        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; color: #666; }
                        .total-row.final { 
                            font-size: 20px; 
                            font-weight: 800; 
                            color: #000; 
                            border-top: 2px dashed #000; 
                            margin-top: 12px; 
                            padding-top: 20px; 
                        }

                        /* Footer */
                        .footer { margin-top: 80px; padding-top: 24px; border-top: 1px solid #eee; }
                        .notes-label { font-size: 11px; text-transform: uppercase; color: #888; font-weight: 600; margin-bottom: 8px; }
                        .notes { font-size: 13px; color: #555; font-style: italic; line-height: 1.5; }

                        @media print {
                            body { -webkit-print-color-adjust: exact; padding: 0; } 
                            @page { margin: 15mm; margin-bottom: 20mm; }
                            .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; }
                        }
                    </style>
                </head>
                <body>
                    <!-- Header -->
                    <div class="header">
                        <div style="max-width: 50%;">
                            ${selectedOrg?.logo_url ? `<img src="${selectedOrg.logo_url}" class="logo" />` : ''}
                            <div class="company-name">${selectedOrg?.business_name || ''}</div>
                            <div class="company-info">
                                ${selectedOrg?.address_line_1 ? `<div>${selectedOrg.address_line_1}</div>` : ''}
                                ${selectedOrg?.city || selectedOrg?.state ? `<div>${[selectedOrg.city, selectedOrg.state].filter(Boolean).join(', ')}</div>` : ''}
                                ${selectedOrg?.phone ? `<div>${selectedOrg.phone}</div>` : ''}
                                ${selectedOrg?.email ? `<div>${selectedOrg.email}</div>` : ''}
                            </div>
                        </div>
                        <div class="invoice-title">
                            <h1>INVOICE</h1>
                            <div class="meta-group">
                                <div class="meta-item">
                                    <div class="meta-label">Invoice No.</div>
                                    <div class="meta-value">#${invoiceData.invoice_number}</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">Date Issued</div>
                                    <div class="meta-value">${invoiceData.invoice_date}</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">Due Date</div>
                                    <div class="meta-value">${invoiceData.due_date}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Bill To -->
                    <div class="bill-to">
                        <div class="section-label">Bill To</div>
                        <div class="client-name">${invoiceData.client_name || '-'}</div>
                        <div class="client-details">
                            ${invoiceData.client_contact ? `<div>${invoiceData.client_contact}</div>` : ''}
                            ${invoiceData.client_email ? `<div>${invoiceData.client_email}</div>` : ''}
                            ${invoiceData.client_address ? `<div>${invoiceData.client_address}</div>` : ''}
                        </div>
                    </div>

                    <!-- Items -->
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 45%">Description</th>
                                <th class="text-right" style="width: 15%">Qty</th>
                                <th class="text-right" style="width: 20%">Price</th>
                                <th class="text-right" style="width: 20%">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoiceData.items.map((item: any) => `
                                <tr>
                                    <td>
                                        <div style="font-weight: 600; color: #000;">${item.description}</div>
                                    </td>
                                    <td class="text-right">${item.quantity}</td>
                                    <td class="text-right">₹${Number(item.price).toFixed(2)}</td>
                                    <td class="text-right" style="font-weight: 600;">₹${(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <!-- Totals -->
                    <div class="totals-container">
                        <div class="totals-box">
                            <div class="total-row">
                                <span>Subtotal</span>
                                <span>₹${invoiceData.subtotal.toFixed(2)}</span>
                            </div>
                            ${invoiceData.tax_rate > 0 ? `
                            <div class="total-row">
                                <span>Tax (${invoiceData.tax_rate}%)</span>
                                <span>₹${invoiceData.tax_amount.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            ${invoiceData.discount_rate > 0 ? `
                            <div class="total-row">
                                <span>Discount (${invoiceData.discount_rate}%)</span>
                                <span>-₹${invoiceData.discount_amount.toFixed(2)}</span>
                            </div>
                            ` : ''}
                            <div class="total-row final">
                                <span>Total</span>
                                <span>₹${invoiceData.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Notes -->
                    ${invoiceData.notes ? `
                        <div class="footer">
                            <div class="notes-label">Notes</div>
                            <div class="notes">${invoiceData.notes}</div>
                        </div>
                    ` : ''}
                    
                    <div class="print-footer">
                        Generated with InvoiceAI • Powered by Tambo AI
                    </div>


                    <script>
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                            }, 500);
                        };
                    </script>
                </body>
                </html>
            `);
            doc.close();

            // Show share modal after printing
            setTimeout(() => {
                document.body.removeChild(iframe);
                setShowShareModal(true);
            }, 2000);


        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download invoice");
        } finally {
            setDownloading(false);
        }
    };

    const handleShareWhatsApp = () => {
        const data = invoiceFormRef.current?.getData();
        const message = encodeURIComponent(
            `Invoice #${data?.invoice_number}\n` +
            `Amount: ₹${data?.total.toFixed(2)}\n` +
            `Client: ${data?.client_name || 'N/A'}\n\n` +
            `Thank you for your business!`
        );
        window.open(`https://wa.me/?text=${message}`, '_blank');
        setShowShareModal(false);
    };

    const handleShareEmail = () => {
        const data = invoiceFormRef.current?.getData();
        const subject = encodeURIComponent(`Invoice #${data?.invoice_number}`);
        const body = encodeURIComponent(
            `Dear ${data?.client_name || 'Customer'},\n\n` +
            `Please find attached Invoice #${data?.invoice_number}.\n\n` +
            `Total Amount: ₹${data?.total.toFixed(2)}\n` +
            `Due Date: ${data?.due_date}\n\n` +
            `Thank you for your business!\n\n` +
            `Best regards`
        );
        window.open(`mailto:${data?.client_email || ''}?subject=${subject}&body=${body}`, '_blank');
        setShowShareModal(false);
    };

    const headerActions = (
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base rounded-lg md:rounded-xl border-2 border-black bg-white text-black font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:shadow-none font-[family-name:var(--font-bricolage)] flex items-center gap-1.5 md:gap-2 disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" /> : savedSuccess ? <Check className="w-3 md:w-4 h-3 md:h-4 text-green-600" /> : <Save className="w-3 md:w-4 h-3 md:h-4" />}
                {savedSuccess ? "Saved!" : "Save Draft"}
            </button>
            <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-3 md:px-6 py-2 md:py-2.5 text-xs md:text-base rounded-lg md:rounded-xl bg-black text-white border-2 border-black font-bold hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 shadow-[2px_2px_0px_0px_#6366F1] md:shadow-[4px_4px_0px_0px_#6366F1] hover:shadow-[1px_1px_0px_0px_#6366F1] active:shadow-none font-[family-name:var(--font-bricolage)] flex items-center gap-1.5 md:gap-2 disabled:opacity-50"
            >
                {downloading ? <Loader2 className="w-3 md:w-4 h-3 md:h-4 animate-spin" /> : <Download className="w-3 md:w-4 h-3 md:h-4" />}
                Download
            </button>
        </div>
    );

    return (
        <>
            <DashboardHeader title="New Invoice">
                {headerActions}
            </DashboardHeader>
            <div className="flex justify-between items-start gap-8">
                <div className="flex-1">
                    <InvoiceForm ref={invoiceFormRef} />
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold font-[family-name:var(--font-bricolage)]">Share Invoice</h2>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <p className="text-gray-600 mb-6">Invoice downloaded! Share it with your client:</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleShareWhatsApp}
                                className="w-full flex items-center gap-4 p-4 border-2 border-black rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all bg-green-50"
                            >
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                    <MessageCircle className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold">WhatsApp</div>
                                    <div className="text-sm text-gray-500">Share via WhatsApp</div>
                                </div>
                            </button>
                            <button
                                onClick={handleShareEmail}
                                className="w-full flex items-center gap-4 p-4 border-2 border-black rounded-xl hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all bg-blue-50"
                            >
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="font-bold">Email</div>
                                    <div className="text-sm text-gray-500">Send via email</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
