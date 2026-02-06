/**
 * @file tambo.ts
 * @description Central configuration file for Tambo components and tools
 *
 * This file serves as the central place to register your Tambo components and tools.
 * It exports arrays that will be used by the TamboProvider.
 *
 * Read more about Tambo at https://tambo.co/docs
 */

import { Graph, graphSchema } from "@/components/tambo/graph";
import { DataCard, dataCardSchema } from "@/components/ui/card-data";
import {
  getCountryPopulations,
  getGlobalPopulationTrend,
} from "@/services/population-stats";
import type { TamboComponent } from "@tambo-ai/react";
import { TamboTool } from "@tambo-ai/react";
import { z } from "zod";

/**
 * tools
 *
 * This array contains all the Tambo tools that are registered for use within the application.
 * Each tool is defined with its name, description, and expected props. The tools
 * can be controlled by AI to dynamically fetch data based on user interactions.
 */

export const tools: TamboTool[] = [
  {
    name: "countryPopulation",
    description:
      "A tool to get population statistics by country with advanced filtering options",
    tool: getCountryPopulations,
    inputSchema: z.object({
      continent: z.string().optional(),
      sortBy: z.enum(["population", "growthRate"]).optional(),
      limit: z.number().optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    outputSchema: z.array(
      z.object({
        countryCode: z.string(),
        countryName: z.string(),
        continent: z.enum([
          "Asia",
          "Africa",
          "Europe",
          "North America",
          "South America",
          "Oceania",
        ]),
        population: z.number(),
        year: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "globalPopulation",
    description:
      "A tool to get global population trends with optional year range filtering",
    tool: getGlobalPopulationTrend,
    inputSchema: z.object({
      startYear: z.number().optional(),
      endYear: z.number().optional(),
    }),
    outputSchema: z.array(
      z.object({
        year: z.number(),
        population: z.number(),
        growthRate: z.number(),
      }),
    ),
  },
  {
    name: "addItemsToInvoice",
    description: "Add one or more billable items to the invoice. REQUIRED: structured data. parameters must be an object with an 'items' array. Each item must be an OBJECT with 'description', 'quantity', and 'price' fields. DO NOT return a simple string array. Example: { items: [{ description: 'Web Design', quantity: 1, price: 1000 }] }",
    tool: async (input: { items: any[] }) => {
      // Dispatch event for each item
      if (typeof window !== 'undefined') {
        input.items.forEach((item: any) => {
          let cleanItem;

          if (typeof item === 'string') {
            // Fallback for when AI sends strings despite instructions
            // Improved regex for string parsing
            const priceRegex = /(?:rs\.?|₹|price|@)\s*(\d+(?:,\d+)*(?:\.\d+)?)/i;
            const leadingQtyRegex = /^(\d+)\s+(.+)/; // Matches "2 biscuits"
            const qtyRegex = /(?:qty|quantity|x|\*)\s*(\d+)/i;
            const simpleQtyRegex = /(\d+)\s*(?:nos|units)/i;

            const priceMatch = item.match(priceRegex) || item.match(/(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rs\.?|₹)/i);
            let qtyMatch = item.match(qtyRegex) || item.match(simpleQtyRegex);
            let leadingQtyMatch = null;

            if (!qtyMatch && !priceMatch) {
              // If no explicit qty/price found, check for leading number pattern
              leadingQtyMatch = item.match(leadingQtyRegex);
            }

            let description = item;
            let quantity = 1;
            let price = 0;

            if (priceMatch) {
              price = parseFloat(priceMatch[1].replace(/,/g, ''));
              description = description.replace(priceMatch[0], '');
            }

            if (qtyMatch) {
              quantity = parseInt(qtyMatch[1]);
              description = description.replace(qtyMatch[0], '');
            } else if (leadingQtyMatch) {
              quantity = parseInt(leadingQtyMatch[1]);
              // We don't remove the match here because the second group IS the description
              description = leadingQtyMatch[2];
            }

            cleanItem = {
              description: description,
              quantity: quantity,
              price: price
            };
          } else {
            // Correct object format
            cleanItem = {
              description: item.description || "New Item",
              quantity: Number(item.quantity) || 1,
              price: Number(item.price) || 0
            };
          }

          // Universal cleanup
          cleanItem.description = cleanItem.description
            .replace(/\s+[-–—,:;@]+\s+/g, ' ') // Separators in middle
            .replace(/[\s-–—,:;@]+$/, '')      // Trailing separators
            .replace(/^[\s-–—,:;@]+/, '')      // Leading separators
            .replace(/\s+[xX]$/, '')           // Trailing "x" (multiplier artifact)
            .replace(/^\s*[xX]\s+/, '')        // Leading "x"
            .replace(/\s{2,}/g, ' ')           // Double spaces
            .trim();

          // Skip garbage items (empty or just punctuation)
          if (!cleanItem.description || /^[\W_]+$/.test(cleanItem.description)) {
            return;
          }

          window.dispatchEvent(new CustomEvent('tambo:add-invoice-item', { detail: cleanItem }));
        });
        return { success: true, message: `Added ${input.items.length} items to invoice` };
      }
      return { success: false, message: "Client environment required" };
    },
    inputSchema: z.object({
      items: z.array(z.object({
        description: z.string().describe("Item name/description"),
        quantity: z.number().describe("Count"),
        price: z.number().describe("Unit cost"),
      })).describe("List of item objects. NOT strings.")
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  {
    name: "updateClientDetails",
    description: "Update the client information (Bill To) section of the invoice. Extract available details (name, email, etc.) and update only what is provided.",
    tool: async (input: { name?: string; contact?: string; email?: string; address?: string }) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tambo:update-client', { detail: input }));
        return { success: true, message: "Updated client details" };
      }
      return { success: false, message: "Client environment required" };
    },
    inputSchema: z.object({
      name: z.string().optional().describe("Client Company Name"),
      contact: z.string().optional().describe("Contact Person Name"),
      email: z.string().optional().describe("Client Email Address"),
      address: z.string().optional().describe("Client Physical Address"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  {
    name: "updateInvoiceDetails",
    description: "Update the invoice metadata such as dates, invoice number, or notes. Use this to change the due date, issue date, or add footer notes.",
    tool: async (input: { invoice_number?: string; invoice_date?: string; due_date?: string; notes?: string }) => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tambo:update-invoice-details', { detail: input }));
        return { success: true, message: "Updated invoice details" };
      }
      return { success: false, message: "Client environment required" };
    },
    inputSchema: z.object({
      invoice_number: z.string().optional().describe("The invoice identifier (e.g. '0001')"),
      invoice_date: z.string().optional().describe("Issue date string (e.g. '10 Jul 2026')"),
      due_date: z.string().optional().describe("Due date string (e.g. '15 Aug 2026')"),
      notes: z.string().optional().describe("Footer notes or terms"),
    }),
    outputSchema: z.object({
      success: z.boolean(),
      message: z.string(),
    }),
  },
  {
    name: "getInvoiceDetails",
    description: "Get the current state of the invoice, including all items, client details, and totals. Use this BEFORE adding items if you need to check for duplicates, or to answer questions about the current invoice.",
    tool: async () => {
      if (typeof window !== 'undefined') {
        return new Promise((resolve) => {
          const correlationId = crypto.randomUUID();

          const handler = (e: any) => {
            if (e.detail?.correlationId === correlationId) {
              window.removeEventListener('tambo:invoice-state-response', handler);
              resolve(JSON.parse(JSON.stringify(e.detail.data))); // Ensure clean object
            }
          };

          window.addEventListener('tambo:invoice-state-response', handler);

          // Request/Dispatch
          window.dispatchEvent(new CustomEvent('tambo:get-invoice-state', {
            detail: { correlationId }
          }));
          console.log("AI: Dispatched get-invoice-state request", correlationId);

          // Timeout fallback
          setTimeout(() => {
            window.removeEventListener('tambo:invoice-state-response', handler);
            console.error("AI: Timeout waiting for invoice state", correlationId);
            resolve({ error: "Timeout waiting for invoice state" });
          }, 5000);
        });
      }
      return { error: "Client environment required" };
    },
    inputSchema: z.object({}),
    outputSchema: z.object({}).passthrough().describe("The full invoice data object"),
  },
];

/**
 * components
 *
 * This array contains all the Tambo components that are registered for use within the application.
 * Each component is defined with its name, description, and expected props. The components
 * can be controlled by AI to dynamically render UI elements based on user interactions.
 */
export const components: TamboComponent[] = [
  {
    name: "Graph",
    description:
      "A component that renders various types of charts (bar, line, pie) using Recharts. Supports customizable data visualization with labels, datasets, and styling options.",
    component: Graph,
    propsSchema: graphSchema,
  },
  {
    name: "DataCard",
    description:
      "A component that displays options as clickable cards with links and summaries with the ability to select multiple items.",
    component: DataCard,
    propsSchema: dataCardSchema,
  },
  // Add more components here
];
