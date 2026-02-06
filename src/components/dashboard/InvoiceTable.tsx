"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { Plus, Trash2 } from "lucide-react";

interface InvoiceItem {
    id: string;
    description: string;
    quantity: number;
    price: number;
}

export interface InvoiceTableRef {
    getItems: () => InvoiceItem[];
    getSubtotal: () => number;
    getTax: () => number;
    getTaxRate: () => number;
    getDiscount: () => number;
    getDiscountRate: () => number;
    getTotal: () => number;
    addItem: (item: Partial<InvoiceItem>) => void;
    setItems: (items: InvoiceItem[]) => void;
    setTaxRate: (rate: number) => void;
    setDiscountRate: (rate: number) => void;
}

export const InvoiceTable = forwardRef<InvoiceTableRef, {}>((props, ref) => {
    const [items, setItems] = useState<InvoiceItem[]>([]);
    const [taxRate, setTaxRate] = useState(18);
    const [discountRate, setDiscountRate] = useState(0);

    const addItem = (initialData?: Partial<InvoiceItem>) => {
        setItems(prev => {
            // Check if item already exists (case-insensitive for description)
            if (initialData?.description) {
                const existingIndex = prev.findIndex(item =>
                    item.description.trim().toLowerCase() === initialData.description?.trim().toLowerCase()
                );

                if (existingIndex >= 0) {
                    // Update existing item
                    const newItems = [...prev];
                    newItems[existingIndex] = {
                        ...newItems[existingIndex],
                        quantity: newItems[existingIndex].quantity + (initialData.quantity || 1)
                    };
                    return newItems;
                }
            }

            // Add new item
            return [...prev, {
                id: crypto.randomUUID(),
                description: initialData?.description || "New Item",
                quantity: initialData?.quantity || 1,
                price: initialData?.price || 0
            }];
        });
    };

    const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === 'quantity' || field === 'price') {
                    updated[field] = Number(value);
                }
                return updated;
            }
            return item;
        }));
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (taxRate / 100);
    const discount = subtotal * (discountRate / 100);
    const total = subtotal + tax - discount;

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        getItems: () => items,
        getSubtotal: () => subtotal,
        getTax: () => tax,
        getTaxRate: () => taxRate,
        getDiscount: () => discount,
        getDiscountRate: () => discountRate,
        getTotal: () => total,
        addItem: (item: Partial<InvoiceItem>) => addItem(item),
        setItems: (newItems: InvoiceItem[]) => setItems(newItems),
        setTaxRate: (rate: number) => setTaxRate(rate),
        setDiscountRate: (rate: number) => setDiscountRate(rate)
    }));

    return (
        <div className="mt-8 font-[family-name:var(--font-bricolage)]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-black uppercase text-gray-400 tracking-widest">Items</h3>
                <button
                    onClick={() => addItem()}
                    className="flex items-center gap-2 text-xs font-bold bg-black text-white px-3 py-1.5 rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-shadow"
                >
                    <Plus className="w-3 h-3" /> ADD ITEM
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-t-2 border-b-2 border-black text-xs md:text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 md:p-3 text-left text-[10px] md:text-xs font-black text-black uppercase tracking-widest w-[40%]">Description</th>
                            <th className="p-2 md:p-3 text-right text-[10px] md:text-xs font-black text-black uppercase tracking-widest w-[15%]">Qty</th>
                            <th className="p-2 md:p-3 text-right text-[10px] md:text-xs font-black text-black uppercase tracking-widest w-[20%]">Price</th>
                            <th className="p-2 md:p-3 text-right text-[10px] md:text-xs font-black text-black uppercase tracking-widest w-[20%]">Total</th>
                            <th className="w-[5%]"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white">
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-gray-200 last:border-0 group">
                                <td className="p-2">
                                    <input
                                        type="text"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                        className="w-full bg-transparent p-1 font-medium text-black border-b border-dashed border-transparent focus:border-black outline-none placeholder:text-gray-300 transition-colors"
                                        placeholder="Item description"
                                    />
                                </td>
                                <td className="p-2 text-right">
                                    <input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                                        className="w-full bg-transparent p-1 text-right text-black border-b border-dashed border-transparent focus:border-black outline-none"
                                        min="1"
                                    />
                                </td>
                                <td className="p-2 text-right">
                                    <input
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                                        className="w-full bg-transparent p-1 text-right text-black border-b border-dashed border-transparent focus:border-black outline-none"
                                        min="0"
                                        step="0.01"
                                    />
                                </td>
                                <td className="p-3 text-right font-bold text-black">
                                    ₹{(item.quantity * item.price).toFixed(2)}
                                </td>
                                <td className="p-2 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mt-6">
                <div className="w-64 space-y-2">
                    <div className="flex justify-between text-gray-600 text-sm">
                        <span>Subtotal</span>
                        <span className="font-bold text-black">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm items-center">
                        <div className="flex items-center gap-2">
                            <span>Tax</span>
                            <div className="relative w-12 group">
                                <input
                                    type="number"
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(Number(e.target.value))}
                                    className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-black outline-none text-center text-xs p-0.5"
                                />
                                <span className="absolute right-0 top-0 text-xs text-gray-400 pointer-events-none">%</span>
                            </div>
                        </div>
                        <span className="font-bold text-black">₹{tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-sm items-center">
                        <div className="flex items-center gap-2">
                            <span>Discount</span>
                            <div className="relative w-12 group">
                                <input
                                    type="number"
                                    value={discountRate}
                                    onChange={(e) => setDiscountRate(Number(e.target.value))}
                                    className="w-full bg-transparent border-b border-dashed border-gray-300 focus:border-black outline-none text-center text-xs p-0.5"
                                />
                                <span className="absolute right-0 top-0 text-xs text-gray-400 pointer-events-none">%</span>
                            </div>
                        </div>
                        <span className="font-bold text-black">-₹{discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-black font-black text-xl pt-4 border-t-2 border-dashed border-gray-300 mt-2">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

InvoiceTable.displayName = "InvoiceTable";
