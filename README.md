# InvoiceAI 💸

[![wakatime](https://wakatime.com/badge/user/ec7c4227-309f-473e-aed9-683f8c591ab0/project/d52bfe80-f74a-4a0a-a224-a7fb04c4dd9d.svg)](https://wakatime.com/badge/user/ec7c4227-309f-473e-aed9-683f8c591ab0/project/d52bfe80-f74a-4a0a-a224-a7fb04c4dd9d)

<div align="left">
  <img src="public/Octo-Icon.svg" alt="Tambo AI" width="60" />
</div>

**Professional Invoicing, Powered by Tambo AI.**

InvoiceAI is an intelligent invoicing platform designed to eliminate the manual drudgery of financial administration. By leveraging **Tambo AI**, it allows freelancers and agencies to generate pixel-perfect, industry-standard PDF invoices through a natural conversational interface.

> **Engineered by [Tambo AI](https://tambo.co)**.



## 💡 Inspiration
Freelancers spend too much time fighting with Word templates and generic PDF generators. We wanted to build a tool that feels like a dedicated financial assistant—one that understands context, manages client details automatically, and produces professional results without the headache. We injected a "Tambo" personality to make the mundane task of invoicing actually engaging.

## ⚙️ What it does
*   **Conversational Invoicing**: Users simply tell the AI "Create an invoice for $500 for the website redesign," and the system structures the data instantly.
*   **Context Awareness**: The AI remembers client details, past items, and preferred terms, reducing data entry by 90%.
*   **Multi-Org Support**: Users can seamlessly switch between different business identities (e.g., "Freelance Design" vs. "Consulting").
*   **Smart PDF Generation**: We moved away from basic HTML prints to high-fidelity, printable invoices that look 100% professional.

## 🏗️ How we built it
*   **Frontend**: Built with **Next.js 15 (App Router)** for server-side rendering and speed.
*   **AI Engine**: Powered by **Tambo AI**, utilizing its `TamboTool` and `TamboComponent` architecture to give the Large Language Model direct control over our UI and state.
*   **State Management**: Complex form state is handled via React Context and synchronized with the AI through custom events.
*   **Database**: **Supabase** (PostgreSQL) handles relational data for users, organizations, invoices, and items.
*   **Styling**: **Tailwind CSS** ensures a cohesive, responsive design system.

## 🧠 Challenges we ran into
*   **AI-State Synchronization**: Ensuring the AI could read the *current* state of a complex invoice form (items, taxes, discounts) in real-time required a robust bi-directional event system.
*   **PDF Consistency**: distinct challenges in ensuring the web view matched the printed output exactly across different browsers.

## 🚀 What's next for InvoiceAI
*   **Stripe Integration**: Allowing "Pay Now" links directly on the invoices.
*   **Expense Tracking**: Using the same AI interface to scan and categorize receipts.
*   **Mobile App**: Bringing the chat-first invoicing experience to iOS.

## 📦 Features

*   **AI-Powered Generation**: Simply describe the invoice you need, and Tambo AI constructs it instantly.
*   **Professional Templates**: Generate clean, industry-standard PDF invoices.
*   **Organization Management**: Seamlessly manage multiple business identities from a single dashboard.
*   **Smart History**: Automatically saves and indexes your invoice history for easy retrieval.
*   **Modern Dashboard**: A responsive, accessible, and dark-mode compatible interface built for speed.

## 🛠️ Tech Stack

*   **Frontend**: [Next.js 15](https://nextjs.org/) (App Directory)
*   **Intelligence**: [Tambo AI](https://tambo.co)
*   **Database**: [Supabase](https://supabase.com/)
*   **Styling**: Tailwind CSS
*   **Authentication**: Supabase Auth

## 📦 Getting Started

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/ravixalgorithm/invoiceai.git
    cd invoiceai
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Rename `example.env.local` to `.env.local` and add your keys:
    ```bash
    NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_key
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
    ```

4.  **Run It**
    ```bash
    npm run dev
    ```
    Go to `localhost:3000` and start invoicing.

## 🤝 Contributing

Don't. Just use it to get paid.
(Just kidding, PRs welcome but keep existing satirical tone).

---
*Powered by Tambo AI* | *Engineered for chaos*
