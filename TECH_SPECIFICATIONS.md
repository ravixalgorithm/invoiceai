# InvoiceAI: Complete Technical Specifications & Architecture

**Comprehensive technical documentation for developers using Antigravity IDE and AI agents. This document covers the entire tech stack, detailed specifications, and implementation standards.**

---

## 📋 Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Schema](#database-schema)
4. [Component Specifications](#component-specifications)
5. [API Documentation](#api-documentation)
6. [Tambo Generative UI Integration](#tambo-generative-ui-integration)
7. [MCP Server Specification](#mcp-server-specification)
8. [Authentication & Security](#authentication--security)
9. [Deployment Architecture](#deployment-architecture)
10. [Performance & Scaling](#performance--scaling)
11. [Error Handling & Logging](#error-handling--logging)

---

## Tech Stack Overview

### Frontend Stack
```json
{
  "Framework": "Next.js 15 (App Router)",
  "Runtime": "Node.js 20+",
  "Language": "TypeScript 5.x",
  "React": "19.x (Latest)",
  "UI Components": "Custom + shadcn/ui (optional)",
  "Styling": "Tailwind CSS 3.x + CSS Variables",
  "State Management": "React Hooks + Context API",
  "HTTP Client": "Fetch API + Axios",
  "Validation": "Zod 3.x",
  "Date Handling": "date-fns 3.x",
  "PDF Generation": "jsPDF 2.x + html2canvas 1.x",
  "Chat Integration": "Tambo SDK (useChat hook)",
  "Database Client": "Supabase JS client 2.x",
  "Authentication": "JWT + Supabase Auth"
}
```

### Backend Stack
```json
{
  "Runtime": "Node.js 20+ LTS",
  "Language": "TypeScript 5.x",
  "Framework": "Next.js API Routes",
  "Database": "PostgreSQL 15+ (via Supabase)",
  "ORM": "Direct SQL + Supabase client",
  "MCP Server": "@modelcontextprotocol/sdk",
  "AI Integration": "@anthropic-ai/sdk",
  "Authentication": "Supabase Auth + JWT",
  "Email": "Nodemailer (Phase 2)",
  "File Storage": "AWS S3 SDK",
  "Validation": "Zod 3.x",
  "Logging": "Winston 3.x (optional)"
}
```

### Infrastructure & DevOps
```json
{
  "Frontend Hosting": "Vercel (GitHub Connected)",
  "Backend/MCP": "Railway or Render",
  "Database": "Supabase (PostgreSQL)",
  "Storage": "AWS S3",
  "CDN": "Vercel Edge Network",
  "CI/CD": "GitHub Actions",
  "Environment": "Node.js 20 LTS",
  "Database Migrations": "Supabase SQL Editor",
  "Monitoring": "Vercel Analytics + Custom"
}
```

---

## Architecture Diagram

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (Web Browser)                       │
│                                                             │
│  Uses: Chrome, Safari, Firefox on Desktop/Mobile          │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│            VERCEL EDGE NETWORK (CDN)                        │
│  • Static file serving                                      │
│  • Next.js SSR rendering                                    │
│  • API route proxying                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│          NEXT.JS APPLICATION (Vercel)                        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (App Router)                                  │  │
│  │  • /auth/signup, /auth/login                         │  │
│  │  • /dashboard (protected)                            │  │
│  │  • /dashboard/invoices/create (main chat)            │  │
│  │  • /dashboard/invoices (list)                        │  │
│  │  • /dashboard/settings                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │ React Components                                    │  │
│  │  • ChatInterface (main)                             │  │
│  │  • InvoiceForm (Tambo component)                    │  │
│  │  • ItemsTable (Tambo component)                     │  │
│  │  • InvoicePreview (Tambo interactable)              │  │
│  │  • OrganizationSelector (Tambo component)           │  │
│  │  • Common UI (Button, Input, Card, etc)             │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │                                    │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │ Hooks & Utilities                                   │  │
│  │  • useAuth (authentication)                         │  │
│  │  • useOrganization (context)                        │  │
│  │  • useInvoice (invoice data)                        │  │
│  │  • useTambo (Tambo integration)                     │  │
│  └──────────────────────┬──────────────────────────────┘  │
│                         │ HTTPS                             │
│  ┌──────────────────────┴──────────────────────────────┐  │
│  │ API Client & Middleware                            │  │
│  │  • JWT Authentication                               │  │
│  │  • Error Handling                                   │  │
│  │  • Tambo SDK Hook                                  │  │
│  └──────────────────────┬──────────────────────────────┘  │
└───────────────────────┬┼┬──────────────────────────────────┘
                        │││
        ┌───────────────┼┼┼───────────────┐
        │               │││               │
        ▼ HTTPS         ▼▼▼ HTTPS         ▼ HTTPS
    
┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐
│ API Routes      │  │  Tambo API      │  │ AWS S3       │
│ (Next.js)       │  │  (Cloud)        │  │ (Storage)    │
│                 │  │                 │  │              │
│ • /api/auth/*   │  │ Generative UI   │  │ PDF files    │
│ • /api/chat     │  │ SDK             │  │ Invoice      │
│ • /api/invoices │  │ - useChat       │  │ images       │
│ • /api/orgs     │  │ - Components    │  │ logos        │
│ • /api/*/pdf    │  │ - Streaming     │  │              │
└────────┬────────┘  └────────┬────────┘  └──────────────┘
         │                    │
         └────────┬───────────┘
                  │ HTTPS
                  ▼
    
┌──────────────────────────────────────────────┐
│  MCP Server (Railway/Render)                 │
│  (Model Context Protocol)                    │
│                                              │
│  • generatePDF tool                          │
│  • saveInvoice tool                          │
│  • validateInvoice tool                      │
│  • calculateTax tool                         │
│  • getOrganization tool                      │
│  • getUserInvoices tool                      │
└────────────┬─────────────────────────────────┘
             │ HTTPS
             ▼
    
┌──────────────────────────────────────────────┐
│  Supabase PostgreSQL Database                │
│                                              │
│  Tables:                                     │
│  • organizations                             │
│  • invoices                                  │
│  • invoice_items                             │
│  • templates                                 │
│  • auth.users (Supabase managed)             │
│                                              │
│  • Row Level Security (RLS) enabled          │
│  • Real-time subscriptions                   │
└──────────────────────────────────────────────┘
```

### Data Flow: Invoice Creation

```
User Input (Chat)
    │
    ▼
┌─────────────────────────────────┐
│ Chat API Route                  │
│ (/api/chat)                     │
│ • Extract message               │
│ • Validate JWT                  │
│ • Load conversation context     │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Tambo Generative UI SDK         │
│ • Process natural language      │
│ • Extract intent & entities     │
│ • Generate component data       │
│ • Stream response               │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ Component Validation (Zod)      │
│ • Validate schemas              │
│ • Type safety check             │
│ • Error handling                │
└────────────┬────────────────────┘
             │
             ├─────────────────────┐
             │                     │
             ▼                     ▼
    ┌─────────────────┐   ┌─────────────────┐
    │ Render Component │   │ Save Draft      │
    │ (In Browser)    │   │ (Optional)      │
    │                 │   │                 │
    │ • InvoiceForm   │   │ Call MCP:       │
    │ • ItemsTable    │   │ saveInvoice()   │
    │ • Preview       │   │                 │
    └────────┬────────┘   └─────────────────┘
             │
    (User updates via chat)
             │
             ▼
┌─────────────────────────────────┐
│ "Generate PDF" Command          │
│                                 │
│ Call MCP Tool:                  │
│ generatePDF({invoiceData})      │
└────────────┬────────────────────┘
             │
             ▼
┌─────────────────────────────────┐
│ MCP Server (Backend)            │
│                                 │
│ • jsPDF rendering               │
│ • Apply template styling        │
│ • Generate PDF buffer           │
└────────────┬────────────────────┘
             │
             ├──────────┬──────────┐
             │          │          │
             ▼          ▼          ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Upload S3│  │Save Invoice   │ Return URL
    │  (Storage)   │ to Database   │ (Download)
    │         │  │              │
    │  Signed │  │ SQL INSERT   │
    │  URL    │  │ invoice table │
    └────┬────┘  └────┬─────────┘
         │             │
         └──────┬──────┘
                │
                ▼
        ┌───────────────┐
        │ Return to Chat│
        │ • PDF link    │
        │ • Invoice ID  │
        │ • Success msg │
        └───────────────┘
```

---

## Database Schema

### Organizations Table

```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Business Information
  business_name VARCHAR(255) NOT NULL,
  business_description TEXT,
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  
  -- Contact Details
  phone VARCHAR(20),
  email VARCHAR(255),
  website VARCHAR(255),
  
  -- Address
  address_line_1 TEXT,
  address_line_2 TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(10),
  country VARCHAR(100) DEFAULT 'India',
  
  -- Branding
  logo_url TEXT,
  logo_file_path VARCHAR(255),
  brand_color_primary VARCHAR(7) DEFAULT '#218290', -- Teal
  brand_color_secondary VARCHAR(7) DEFAULT '#5E5240', -- Brown
  
  -- Banking & Payment
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(20),
  bank_ifsc_code VARCHAR(11),
  upi_id VARCHAR(255),
  
  -- Preferences
  preferred_template VARCHAR(50) DEFAULT 'professional', -- 'professional', 'minimal', 'gst-compliant'
  invoice_prefix VARCHAR(20) DEFAULT 'INV',
  invoice_number_start INT DEFAULT 1,
  default_due_days INT DEFAULT 30,
  default_tax_percentage DECIMAL(5, 2) DEFAULT 18,
  
  -- Status & Timestamps
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_organizations_user_id ON organizations(user_id);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE deleted_at IS NULL;
```

### Invoices Table

```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Invoice Details
  invoice_number VARCHAR(50) NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Client Information
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255),
  client_phone VARCHAR(20),
  client_gstin VARCHAR(15),
  client_pan VARCHAR(10),
  
  -- Client Address
  client_address_line_1 TEXT,
  client_address_line_2 TEXT,
  client_city VARCHAR(100),
  client_state VARCHAR(100),
  client_pincode VARCHAR(10),
  client_country VARCHAR(100) DEFAULT 'India',
  
  -- Invoice Content
  invoice_notes TEXT,
  payment_terms VARCHAR(255),
  invoice_description TEXT,
  
  -- Financial Details
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_percentage DECIMAL(5, 2) DEFAULT 18,
  tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  
  -- Payment Information
  payment_method VARCHAR(100),
  payment_upi_id VARCHAR(255),
  payment_bank_details JSONB,
  
  -- Invoice Status
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'
  
  -- PDF Information
  pdf_url TEXT,
  pdf_s3_key VARCHAR(255),
  pdf_generated_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP,
  paid_at TIMESTAMP,
  viewed_at TIMESTAMP,
  
  -- Constraints
  UNIQUE (organization_id, invoice_number),
  CONSTRAINT valid_dates CHECK (due_date >= invoice_date),
  CONSTRAINT valid_amounts CHECK (subtotal >= 0 AND tax_amount >= 0 AND total_amount > 0)
);

CREATE INDEX idx_invoices_org_id ON invoices(organization_id);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX idx_invoices_client ON invoices(client_name);
```

### Invoice Items Table

```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Item Details
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  item_category VARCHAR(100), -- 'service', 'product', 'expense'
  
  -- Quantity & Pricing
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'nos', -- 'nos', 'hrs', 'days', 'kgs'
  unit_price DECIMAL(15, 2) NOT NULL,
  
  -- Tax
  tax_percentage DECIMAL(5, 2) DEFAULT 0,
  tax_type VARCHAR(50) DEFAULT 'CGST_SGST', -- 'CGST_SGST', 'IGST', 'exempt'
  
  -- Calculated
  item_subtotal DECIMAL(15, 2) NOT NULL, -- quantity * unit_price
  item_tax DECIMAL(15, 2) NOT NULL DEFAULT 0, -- (quantity * unit_price) * (tax_percentage/100)
  item_total DECIMAL(15, 2) NOT NULL, -- subtotal + tax
  
  -- Ordering
  item_order INT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT valid_item_amounts CHECK (
    quantity > 0 AND 
    unit_price > 0 AND 
    item_total > 0
  )
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_order ON invoice_items(invoice_id, item_order);
```

### Templates Table

```sql
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Template Info
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(50), -- 'professional', 'minimal', 'gst-compliant', 'custom'
  template_description TEXT,
  is_system_template BOOLEAN DEFAULT FALSE,
  
  -- Template Configuration
  template_config JSONB, -- Stores colors, fonts, layout preferences
  
  -- Sample Data for Preview
  sample_json JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  usage_count INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_org_id ON templates(organization_id);
CREATE INDEX idx_templates_type ON templates(template_type);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Organizations: Users can view/edit only their own
CREATE POLICY "Users can view their own organizations"
  ON organizations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizations"
  ON organizations FOR UPDATE
  USING (auth.uid() = user_id);

-- Invoices: Users can only view/edit invoices from their organizations
CREATE POLICY "Users can view their organization invoices"
  ON invoices FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create invoices in their organizations"
  ON invoices FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their organization invoices"
  ON invoices FOR UPDATE
  USING (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

-- Invoice Items: Inherit from invoices policy
CREATE POLICY "Users can view invoice items from their invoices"
  ON invoice_items FOR SELECT
  USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create invoice items in their invoices"
  ON invoice_items FOR INSERT
  WITH CHECK (
    invoice_id IN (
      SELECT id FROM invoices WHERE organization_id IN (
        SELECT id FROM organizations WHERE user_id = auth.uid()
      )
    )
  );

-- Templates: Users can view their own templates + system templates
CREATE POLICY "Users can view their own and system templates"
  ON templates FOR SELECT
  USING (
    is_system_template = TRUE OR
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own templates"
  ON templates FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations WHERE user_id = auth.uid()
    )
  );
```

---

## Component Specifications

### 1. InvoiceForm Component

**Purpose:** Display and edit invoice header details

**Zod Schema:**
```typescript
const InvoiceFormSchema = z.object({
  organizationId: z.string().uuid(),
  invoiceNumber: z.string(), // Auto-generated, read-only
  invoiceDate: z.string().date(), // YYYY-MM-DD
  dueDate: z.string().date(), // YYYY-MM-DD
  clientName: z.string().min(1).max(255),
  clientEmail: z.string().email().optional(),
  clientPhone: z.string().optional(),
  clientGstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional(),
  clientAddress: z.string().optional(),
  clientCity: z.string().optional(),
  clientState: z.string().optional(),
  clientPincode: z.string().optional(),
  invoiceNotes: z.string().optional(),
  paymentTerms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof InvoiceFormSchema>;
```

**Props:**
```typescript
interface InvoiceFormProps {
  data: InvoiceFormData;
  onUpdate: (field: keyof InvoiceFormData, value: any) => void;
  isEditable: boolean;
  organization: Organization;
}
```

**Rendered Fields:**
| Field | Type | Validation | Read-Only |
|-------|------|-----------|----------|
| Business Name | Text | Required | Yes |
| Invoice Number | Text | Auto-generated | Yes |
| Invoice Date | Date | Required | No |
| Due Date | Date | Required, >= Invoice Date | No |
| Client Name | Text | Required, 1-255 chars | No |
| Client Email | Email | Optional | No |
| Client Phone | Tel | Optional | No |
| Client GSTIN | Text | Optional, GSTIN format | No |
| Client Address | TextArea | Optional | No |
| Notes | TextArea | Optional | No |

**Styling:** Tailwind CSS + Design System variables

---

### 2. ItemsTable Component

**Purpose:** Display and manage invoice line items

**Zod Schema:**
```typescript
const InvoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  itemName: z.string().min(1).max(255),
  description: z.string().optional(),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  taxPercentage: z.number().min(0).max(100),
  itemOrder: z.number().int().nonnegative(),
});

const ItemsTableSchema = z.object({
  items: z.array(InvoiceItemSchema),
  subtotal: z.number().nonnegative(),
  taxAmount: z.number().nonnegative(),
  total: z.number().positive(),
});

type ItemsTableData = z.infer<typeof ItemsTableSchema>;
```

**Props:**
```typescript
interface ItemsTableProps {
  data: ItemsTableData;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onUpdateItem: (index: number, field: keyof InvoiceItemSchema, value: any) => void;
  isEditable: boolean;
}
```

**Columns:**
| Column | Type | Editable | Validation |
|--------|------|----------|-----------|
| Item Name | Text | Yes | Required |
| Description | Text | Yes | Optional |
| Quantity | Number | Yes | > 0 |
| Unit Price | Number | Yes | > 0 |
| Tax % | Select | Yes | 0, 5, 12, 18, 28 |
| Amount | Display | No | Auto-calculated |

**Calculations:**
```
Item Total = Quantity × Unit Price × (1 + Tax%/100)
Subtotal = Sum of all (Quantity × Unit Price)
Tax Amount = Sum of all Item Taxes
Total = Subtotal + Tax Amount
```

---

### 3. InvoicePreview Component (Interactable)

**Purpose:** WYSIWYG invoice display with live updates

**Zod Schema:**
```typescript
const InvoicePreviewSchema = z.object({
  invoiceForm: InvoiceFormSchema,
  itemsTable: ItemsTableSchema,
  organization: z.object({
    businessName: z.string(),
    logoUrl: z.string().optional(),
    gstNumber: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    bankDetails: z.record(z.any()).optional(),
  }),
  templateType: z.enum(['professional', 'minimal', 'gst-compliant']),
});

type InvoicePreviewData = z.infer<typeof InvoicePreviewSchema>;
```

**Props:**
```typescript
interface InvoicePreviewProps {
  data: InvoicePreviewData;
  onGeneratePDF: () => Promise<void>;
  isGeneratingPDF: boolean;
}
```

**Template Layouts:**

**Professional Template:**
- Header with business logo (if available)
- Company branding colors (teal/brown)
- Structured sections (Invoice #, Date, Bill To, Items, Totals)
- Professional fonts (Geist for body, FKGroteskNeue for headers)
- GST details in footer

**Minimal Template:**
- Clean white background
- Minimal branding
- Gray accents for sections
- Mono-spaced numbers
- Focus on readability

**GST-Compliant Template:**
- Prominent GST section
- CGST/SGST breakdown
- HSN/SAC codes (if available)
- Tax registration details
- Compliant footer text

**Interactable Features:**
- Live updates when form/items change
- "Generate PDF" button
- Print-friendly styling (@media print)
- Copy invoice link button
- Share via email (Phase 2)

---

### 4. OrganizationSelector Component

**Purpose:** Browse and select organization for invoice creation

**Zod Schema:**
```typescript
const OrganizationSelectorSchema = z.object({
  organizations: z.array(z.object({
    id: z.string().uuid(),
    businessName: z.string(),
    gstNumber: z.string().optional(),
    phone: z.string().optional(),
    logoUrl: z.string().optional(),
  })),
  selectedId: z.string().uuid().optional(),
});

type OrganizationSelectorData = z.infer<typeof OrganizationSelectorSchema>;
```

**Props:**
```typescript
interface OrganizationSelectorProps {
  organizations: Organization[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreateNew: () => void;
}
```

**Display:**
- Grid of organization cards
- Each card: Business name, GST, phone, logo thumbnail
- "Create New Organization" button
- Active state highlighting for selected org

---

## API Documentation

### Authentication Endpoints

#### POST `/api/auth/signup`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "9876543210",
  "organizationName": "Acme Corp" (optional)
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "fullName": "John Doe"
  },
  "token": "jwt_token_here",
  "organization": {
    "id": "uuid",
    "businessName": "Acme Corp"
  }
}
```

**Error (400):**
```json
{
  "error": "Email already exists" or "Password too weak" or "Validation failed"
}
```

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "jwt_token_here",
  "organizations": [
    {
      "id": "uuid",
      "businessName": "Acme Corp"
    }
  ]
}
```

### Chat Integration

#### POST `/api/chat`
**Request:**
```json
{
  "message": "Create invoice for ABC Corp - Web development - $5000",
  "organizationId": "uuid",
  "conversationId": "uuid" (optional),
  "previousMessages": [] (optional)
}
```

**Response (200) - Streaming:**
```json
{
  "message": "I'll help you create an invoice for ABC Corp...",
  "components": [
    {
      "type": "InvoiceForm",
      "data": {
        "clientName": "ABC Corp",
        "invoiceDate": "2026-02-06",
        "dueDate": "2026-03-08"
      }
    },
    {
      "type": "ItemsTable",
      "data": {
        "items": [
          {
            "itemName": "Web Development",
            "quantity": 1,
            "unitPrice": 5000,
            "taxPercentage": 18
          }
        ],
        "subtotal": 5000,
        "taxAmount": 900,
        "total": 5900
      }
    }
  ],
  "suggestedActions": [
    "Add another item",
    "Change due date",
    "Generate PDF"
  ]
}
```

### Invoice Endpoints

#### GET `/api/invoices?organizationId=uuid&status=draft&limit=20&offset=0`
**Response (200):**
```json
{
  "invoices": [
    {
      "id": "uuid",
      "invoiceNumber": "INV-2026-001",
      "clientName": "ABC Corp",
      "totalAmount": 5900,
      "status": "draft",
      "createdAt": "2026-02-06T10:30:00Z"
    }
  ],
  "total": 42,
  "hasMore": true
}
```

#### POST `/api/invoices`
**Request:**
```json
{
  "organizationId": "uuid",
  "clientName": "ABC Corp",
  "invoiceDate": "2026-02-06",
  "dueDate": "2026-03-08",
  "items": [
    {
      "itemName": "Web Development",
      "quantity": 1,
      "unitPrice": 5000,
      "taxPercentage": 18
    }
  ]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2026-001",
  "status": "draft",
  "totalAmount": 5900
}
```

#### GET `/api/invoices/:invoiceId`
**Response (200):**
```json
{
  "id": "uuid",
  "invoiceNumber": "INV-2026-001",
  "invoiceDate": "2026-02-06",
  "dueDate": "2026-03-08",
  "clientName": "ABC Corp",
  "items": [...],
  "subtotal": 5000,
  "taxAmount": 900,
  "totalAmount": 5900,
  "status": "draft"
}
```

#### POST `/api/invoices/:invoiceId/generate-pdf`
**Response (200):**
```json
{
  "pdfUrl": "https://s3.amazonaws.com/...",
  "downloadUrl": "https://invoiceai.com/download/...",
  "invoiceId": "uuid"
}
```

---

## Tambo Generative UI Integration

### Component Registry Setup

**File:** `src/config/tambo.ts`

```typescript
import { z } from 'zod';
import { InvoiceFormSchema, ItemsTableSchema, InvoicePreviewSchema, OrganizationSelectorSchema } from '@/lib/schemas';

export const ComponentRegistry = {
  InvoiceForm: {
    schema: InvoiceFormSchema,
    description: 'Invoice header form with client and invoice details',
    category: 'form'
  },
  ItemsTable: {
    schema: ItemsTableSchema,
    description: 'Table for managing invoice line items',
    category: 'table'
  },
  InvoicePreview: {
    schema: InvoicePreviewSchema,
    description: 'WYSIWYG preview of generated invoice (Interactable)',
    category: 'display'
  },
  OrganizationSelector: {
    schema: OrganizationSelectorSchema,
    description: 'Component for selecting organization',
    category: 'selector'
  }
};

export function parseComponentsFromResponse(response: string) {
  // Parse LLM response for component JSON blocks
  // Return array of { type, data }
}
```

### System Prompt for Tambo

```
You are InvoiceAI, a specialized invoice generation assistant powered by Tambo's Generative UI.

Your role:
- Help users create professional, GST-compliant invoices through natural conversation
- Parse user input to extract invoice details
- Render appropriate React components (InvoiceForm, ItemsTable, InvoicePreview)
- Keep the conversation natural and helpful
- Suggest actions at each step

When user provides invoice information:
1. Extract client name, items, amounts, dates
2. Render InvoiceForm component with parsed data
3. Render ItemsTable component with line items
4. Show InvoicePreview (Interactable) for live updates
5. Suggest next steps (add more items, change dates, generate PDF)

Rules:
- GST calculation: Default 18% for services, 5% for products, 0% for exempt items
- Invoice number format: INV-YYYY-001 (auto-generated)
- Due date: Default 30 days from invoice date unless specified
- Currency: Always INR for Indian users
- Always validate amounts are positive numbers
- When user says "generate", "create PDF", or "download", call the generatePDF tool

Response format:
- Always include a friendly message
- Include component JSON for Tambo to render
- End with suggested actions in brackets: [Action1, Action2, Action3]

Example response:
"Great! I'll create an invoice for ABC Corp. Here's what I've prepared:
- Client: ABC Corp (contact@abccorp.com)
- Item: Web Development, 10 hours at $150/hour
- Tax: 18% GST
- Total: ₹1,770 (including tax)

Feel free to update any details! You can say:
- 'Change due date to 28th'
- 'Add another item'
- 'Generate PDF when ready'

[Add Item, Change Due Date, Generate PDF]"
```

### MCP Tool Integration

When user commands trigger actions, Tambo calls MCP tools:

```
User: "Generate PDF"
→ Tambo identifies generatePDF tool call
→ Extracts invoiceData from current components
→ Calls: generatePDF({ invoiceData, organization, template })
→ MCP server processes (jsPDF rendering, S3 upload)
→ Returns pdfUrl
→ Tambo responds with download link
```

---

## MCP Server Specification

### MCP Server Structure (Railway/Render)

**File:** `mcp-server/index.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
  name: "invoiceai-mcp",
  version: "1.0.0",
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "generatePDF": return await generatePDF(args);
    case "saveInvoice": return await saveInvoice(args);
    case "validateInvoice": return await validateInvoice(args);
    case "calculateTax": return await calculateTax(args);
    case "getOrganization": return await getOrganization(args);
    case "getUserInvoices": return await getUserInvoices(args);
    default: throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
```

### MCP Tools

#### 1. generatePDF Tool

```typescript
async function generatePDF(args: {
  invoiceData: InvoiceData,
  organizationId: string,
  templateType: 'professional' | 'minimal' | 'gst-compliant'
}): Promise<{ success: boolean, pdfUrl: string, invoiceId: string }> {
  // Validate input
  // Fetch organization branding from Supabase
  // Generate PDF using jsPDF
  // Upload to S3
  // Return signed URL
}
```

#### 2. saveInvoice Tool

```typescript
async function saveInvoice(args: {
  invoiceData: InvoiceData,
  organizationId: string
}): Promise<{ success: boolean, invoiceId: string, invoiceNumber: string }> {
  // Validate with Zod
  // Generate invoice number
  // Insert invoice + items into Supabase
  // Return invoiceId and invoiceNumber
}
```

#### 3. validateInvoice Tool

```typescript
async function validateInvoice(args: {
  invoiceData: InvoiceData
}): Promise<{ valid: boolean, errors: string[] }> {
  // Validate against Zod schema
  // Check business logic (dates, amounts)
  // Check GST compliance
  // Return validation result
}
```

#### 4. calculateTax Tool

```typescript
async function calculateTax(args: {
  amount: number,
  taxPercentage: number,
  state?: string
}): Promise<{ subtotal: number, tax: number, total: number, breakdown: object }> {
  // Calculate CGST/SGST or IGST based on state
  // Support tax exemptions
  // Return detailed breakdown
}
```

---

## Authentication & Security

### JWT Token Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "iat": 1707208800,
  "exp": 1707212400,
  "iss": "invoiceai.com"
}
```

**Token Lifetime:** 1 hour (refresh token mechanism in Phase 2)

### Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.tambo.ai; style-src 'self' 'unsafe-inline'
```

### Environment Variables (Production)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx...
SUPABASE_SERVICE_ROLE_KEY=xxx...
NEXT_PUBLIC_TAMBO_PUBLIC_KEY=xxx...
TAMBO_API_KEY=xxx...
JWT_SECRET=min-32-char-secret-here!
AWS_ACCESS_KEY_ID=xxx...
AWS_SECRET_ACCESS_KEY=xxx...
AWS_S3_BUCKET=invoiceai-pdfs
AWS_REGION=us-east-1
NEXT_PUBLIC_APP_URL=https://invoiceai.com
```

---

## Deployment Architecture

### Vercel Deployment (Frontend)

**Config File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_key"
  },
  "functions": {
    "src/app/api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  }
}
```

**Deployment Steps:**
1. Connect GitHub repo to Vercel
2. Set environment variables
3. Deploy on push to main branch

### Railway/Render Deployment (MCP Server)

**Config File:** `railway.json`

```json
{
  "builder": "nixpacks",
  "buildCommand": "npm install && npm run build",
  "startCommand": "node mcp-server/dist/index.js",
  "envs": {
    "SUPABASE_URL": "${{ env.SUPABASE_URL }}",
    "SUPABASE_KEY": "${{ env.SUPABASE_KEY }}"
  }
}
```

**Deployment Steps:**
1. Connect GitHub to Railway
2. Set environment variables
3. Deploy from dashboard

---

## Performance & Scaling

### Performance Targets

| Metric | Target |
|--------|--------|
| Page Load | < 3 seconds |
| Chat Response | < 2 seconds |
| PDF Generation | < 5 seconds |
| Database Query | < 100ms |
| Invoice List Load | < 1 second |
| Auth (Signup/Login) | < 2 seconds |

### Optimization Strategies

1. **Frontend:**
   - Image optimization (Next.js Image component)
   - Code splitting (dynamic imports)
   - CSS-in-JS minification (Tailwind)
   - Gzip compression
   - CDN caching

2. **Database:**
   - Indexed queries (see Schema)
   - Connection pooling (Supabase managed)
   - Selective fields (SELECT specific columns)
   - Pagination (limit offset pattern)

3. **API:**
   - Response streaming for chat
   - Gzip compression
   - Cache headers for static content
   - Rate limiting (Phase 2)

### Scaling Plan

**Phase 1 (MVP):** Single Vercel instance, Supabase free tier
**Phase 2:** Supabase Pro (high concurrency), Vercel Pro (auto-scaling)
**Phase 3:** RDS PostgreSQL, Kubernetes (if >100K users)

---

## Error Handling & Logging

### Error Types & HTTP Status Codes

| Error | Status | Response |
|-------|--------|----------|
| Invalid Input | 400 | `{ error: "Validation failed", details: [...] }` |
| Unauthorized | 401 | `{ error: "Invalid credentials" }` |
| Forbidden | 403 | `{ error: "Access denied" }` |
| Not Found | 404 | `{ error: "Invoice not found" }` |
| Conflict | 409 | `{ error: "Invoice number already exists" }` |
| Rate Limit | 429 | `{ error: "Too many requests" }` |
| Server Error | 500 | `{ error: "Internal server error" }` |

### Logging Strategy

**Error Logging (Winston):**
```typescript
logger.error('PDF Generation Failed', {
  invoiceId: 'uuid',
  organizationId: 'uuid',
  error: error.message,
  stack: error.stack
});
```

**Access Logging:**
```
[2026-02-06 15:30:45] POST /api/chat 200 234ms userId:abc123
[2026-02-06 15:30:50] GET /api/invoices 200 145ms userId:abc123
```

---

**Technical Documentation Complete. Ready for Implementation! 🚀**
