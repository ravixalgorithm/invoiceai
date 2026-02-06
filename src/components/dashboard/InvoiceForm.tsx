"use client";

import { cn } from "@/lib/utils";
import { InvoiceTable, InvoiceTableRef } from "./InvoiceTable";
import { useDashboard } from "@/app/dashboard/layout";
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";

// Controlled Editable Field
const EditableField = ({
    value,
    onChange,
    placeholder,
    className,
    label,
    name
}: {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    label?: string;
    name?: string;
}) => (
    <div className={cn("group relative", className)}>
        {label && <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1 block">{label}</span>}
        <input
            type="text"
            name={name}
            className="w-full bg-transparent border-b-2 border-transparent hover:border-dashed hover:border-gray-300 focus:border-black focus:outline-none py-1 text-ink-primary transition-all placeholder:text-gray-300 font-[family-name:var(--font-bricolage)]"
            placeholder={placeholder}
            value={value ?? ''}
            onChange={(e) => onChange?.(e.target.value)}
        />
        <div className="absolute inset-0 -z-10 bg-yellow-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-sm pointer-events-none" />
    </div>
);

export interface InvoiceFormData {
    invoice_number: string;
    invoice_date: string;
    due_date: string;
    client_name: string;
    client_contact: string;
    client_email: string;
    client_address: string;
    notes: string;
    items: any[];
    subtotal: number;
    tax_amount: number;
    tax_rate: number;
    discount_amount: number;
    discount_rate: number;
    total: number;
}

export interface InvoiceFormRef {
    getData: () => InvoiceFormData;
    getElement: () => HTMLDivElement | null;
    addInvoiceItem: (item: any) => void;
    updateClient: (details: any) => void;
    loadInvoice: (data: InvoiceFormData) => void;
}

export const InvoiceForm = forwardRef<InvoiceFormRef, {}>((props, ref) => {
    const { selectedOrg: organization } = useDashboard();
    const tableRef = useRef<InvoiceTableRef>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);

    // Form state
    const [invoiceNumber, setInvoiceNumber] = useState("0001");
    const [invoiceDate, setInvoiceDate] = useState(new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    const [clientName, setClientName] = useState("");
    const [clientContact, setClientContact] = useState("");
    const [clientEmail, setClientEmail] = useState("");
    const [clientAddress, setClientAddress] = useState("");
    const [notes, setNotes] = useState("Thank you for your business!");

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        getData: () => ({
            invoice_number: invoiceNumber,
            invoice_date: invoiceDate,
            due_date: dueDate,
            client_name: clientName,
            client_contact: clientContact,
            client_email: clientEmail,
            client_address: clientAddress,
            notes: notes,
            items: tableRef.current?.getItems() || [],
            subtotal: tableRef.current?.getSubtotal() || 0,
            tax_amount: tableRef.current?.getTax() || 0,
            tax_rate: tableRef.current?.getTaxRate() || 0,
            discount_amount: tableRef.current?.getDiscount() || 0,
            discount_rate: tableRef.current?.getDiscountRate() || 0,
            total: tableRef.current?.getTotal() || 0
        }),
        getElement: () => invoiceRef.current,
        addInvoiceItem: (item: any) => tableRef.current?.addItem(item),
        updateClient: (details: any) => {
            if (details.name) setClientName(details.name);
            if (details.contact) setClientContact(details.contact);
            if (details.email) setClientEmail(details.email);
            if (details.address) setClientAddress(details.address);
        },
        loadInvoice: (data: InvoiceFormData) => {
            setInvoiceNumber(data.invoice_number);
            setInvoiceDate(data.invoice_date);
            setDueDate(data.due_date);
            setClientName(data.client_name);
            setClientContact(data.client_contact);
            setClientEmail(data.client_email);
            setClientAddress(data.client_address);
            setNotes(data.notes);
            // We need to support setting discount/tax too if those are passed
            if (tableRef.current) {
                tableRef.current.setItems(data.items);
                tableRef.current.setDiscountRate(data.discount_rate || 0);
                tableRef.current.setTaxRate(data.tax_rate || 18);
            }
        }
    }));

    // Keep a ref to the latest state to avoid stale closures in event listeners
    const stateRef = useRef({
        invoiceNumber,
        invoiceDate,
        dueDate,
        clientName,
        clientContact,
        clientEmail,
        clientAddress,
        notes
    });

    // Sync ref with state
    useEffect(() => {
        stateRef.current = {
            invoiceNumber,
            invoiceDate,
            dueDate,
            clientName,
            clientContact,
            clientEmail,
            clientAddress,
            notes
        };
    }, [invoiceNumber, invoiceDate, dueDate, clientName, clientContact, clientEmail, clientAddress, notes]);

    // Listen for AI events
    useEffect(() => {
        const handleAddItem = (e: any) => {
            console.log("AI Adding Item:", e.detail);
            tableRef.current?.addItem(e.detail);
        };

        const handleUpdateClient = (e: any) => {
            console.log("AI Updating Client:", e.detail);
            const detail = e.detail;
            if (detail.name) setClientName(detail.name);
            if (detail.contact) setClientContact(detail.contact);
            if (detail.email) setClientEmail(detail.email);
            if (detail.address) setClientAddress(detail.address);
        };

        const handleUpdateDetails = (e: any) => {
            console.log("AI Updating Details:", e.detail);
            const detail = e.detail;
            if (detail.invoice_number) setInvoiceNumber(detail.invoice_number);
            if (detail.invoice_date) setInvoiceDate(detail.invoice_date);
            if (detail.due_date) setDueDate(detail.due_date);
            if (detail.notes) setNotes(detail.notes);
        };

        window.addEventListener('tambo:add-invoice-item', handleAddItem);
        window.addEventListener('tambo:update-client', handleUpdateClient);
        window.addEventListener('tambo:update-invoice-details', handleUpdateDetails);

        // Handle state request from AI tool
        const handleGetState = (e: any) => {
            console.log("InvoiceForm: Received state request", e.detail?.correlationId);
            // Use ref to get latest state without re-binding listener
            const current = stateRef.current;

            const data = {
                invoice_number: current.invoiceNumber,
                invoice_date: current.invoiceDate,
                due_date: current.dueDate,
                client_name: current.clientName,
                client_contact: current.clientContact,
                client_email: current.clientEmail,
                client_address: current.clientAddress,
                notes: current.notes,
                items: tableRef.current?.getItems() || [],
                subtotal: tableRef.current?.getSubtotal() || 0,
                tax_amount: tableRef.current?.getTax() || 0,
                tax_rate: tableRef.current?.getTaxRate() || 0,
                discount_amount: tableRef.current?.getDiscount() || 0,
                discount_rate: tableRef.current?.getDiscountRate() || 0,
                total: tableRef.current?.getTotal() || 0
            };

            window.dispatchEvent(new CustomEvent('tambo:invoice-state-response', {
                detail: {
                    correlationId: e.detail?.correlationId,
                    data: data
                }
            }));
        };
        window.addEventListener('tambo:get-invoice-state', handleGetState);

        return () => {
            window.removeEventListener('tambo:add-invoice-item', handleAddItem);
            window.removeEventListener('tambo:update-client', handleUpdateClient);
            window.removeEventListener('tambo:update-invoice-details', handleUpdateDetails);
            window.removeEventListener('tambo:get-invoice-state', handleGetState);
        };
    }, []);

    return (
        <div className="flex justify-center md:p-8">
            {/* The "Paper" - Scales to fit on mobile, A4 on desktop */}
            <div
                ref={invoiceRef}
                id="invoice-content"
                className="w-full md:max-w-[210mm] md:min-h-[297mm] bg-white md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] border md:border-2 border-gray-200 md:border-gray-100 p-4 md:p-[20mm] relative text-sm md:text-base"
            >
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 md:mb-12 gap-4">
                    <div className="w-full md:w-1/2">
                        {organization?.logo_url ? (
                            <img src={organization.logo_url} alt="Logo" className="h-16 w-auto object-contain mb-4" />
                        ) : (
                            <div className="h-16 w-32 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 mb-4 hover:border-black hover:text-black cursor-pointer transition-colors">
                                <span className="text-xs font-bold">+ LOGO</span>
                            </div>
                        )}
                        <div className="text-xl font-bold font-[family-name:var(--font-bricolage)]">
                            {organization?.business_name || "Your Company Name"}
                        </div>
                        <div className="mt-2 text-sm text-gray-500 space-y-1">
                            {organization?.address_line_1 && <div>{organization.address_line_1}</div>}
                            {organization?.city && organization?.state && <div>{organization.city}, {organization.state}</div>}
                            {organization?.phone && <div>{organization.phone}</div>}
                            {organization?.email && <div>{organization.email}</div>}
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-2 font-[family-name:var(--font-bricolage)] tracking-tighter">INVOICE</h1>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 font-medium">#</span>
                                <EditableField value={invoiceNumber} onChange={setInvoiceNumber} className="text-right w-24 font-mono" />
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-gray-500 font-medium">Date</span>
                                <EditableField value={invoiceDate} onChange={setInvoiceDate} className="text-right w-32" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-8 md:mb-16">
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Bill To</h3>
                        <div className="space-y-2">
                            <EditableField value={clientName} onChange={setClientName} placeholder="Client Company Name" className="text-lg font-bold" />
                            <EditableField value={clientContact} onChange={setClientContact} placeholder="Contact Person" />
                            <EditableField value={clientEmail} onChange={setClientEmail} placeholder="client@email.com" />
                            <EditableField value={clientAddress} onChange={setClientAddress} placeholder="Client Address" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase text-gray-400 mb-4 tracking-widest">Due Date</h3>
                        <EditableField value={dueDate} onChange={setDueDate} className="text-lg font-bold" />
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-12">
                    <InvoiceTable ref={tableRef} />
                </div>

                {/* Footer/Notes */}
                <div className="mt-auto pt-12">
                    <EditableField label="NOTES" value={notes} onChange={setNotes} placeholder="Thank you for your business..." className="text-gray-600 text-sm" />
                </div>



                {/* On-screen Watermark */}
                <div className="absolute bottom-4 right-8 text-[10px] text-gray-300 font-bold uppercase tracking-widest print:hidden pointer-events-none">
                    Generated with InvoiceAI by Tambo
                </div>
            </div>
        </div>
    );
});

InvoiceForm.displayName = "InvoiceForm";
