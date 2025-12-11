# WhatsApp AI Automation Platform

Turn WhatsApp into your **24/7 Sales Machine**.  
AI chatbot that captures leads, books appointments, and messages thousands via CSV - all automatically.  
**No API needed.** Setup in **2 minutes**.

![WhatsApp AI Demo](https://placehold.co/1200x600/10b981/ffffff?text=WhatsApp+AI+Automation)

## 🚀 Key Features

### 🤖 Zero Code Bot Builder
- **2-Minute Setup**: Scan a QR code, answer 2 questions, and your bot is live.
- **No Coding Required**: Logical flows and responses are handled automatically.
- **No API Approval**: Uses your existing WhatsApp connection.

### 🧠 AI Sales Agent
- **Lead Qualification**: Automatically asks questions to score and qualify leads.
- **24/7 Availability**: Responds to customers instantly, day or night.
- **Intelligent Responses**: Uses advanced AI to understand context and intent.

### 📅 Smart Appointment Booking
- **Auto-Scheduling**: Checks your calendar and proposes available slots.
- **Calendar Integration**: Seamlessly syncs with Google Calendar.
- **Reminders**: Sends automated confirmations and reminders to reduce no-shows.

### 📨 Bulk Outbound Messaging
- **CSV Upload**: Send messages to thousands of contacts at once.
- **Unlimited Reach**: No per-message fees or limits.
- **Personalized Campaigns**: Use merge tags to personalize every message.
- **Analytics**: Track delivery, open rates, and replies.

### 📊 Lead Management Dashboard
- **Real-Time Capture**: Leads are saved instantly to your CRM dashboard.
- **Hot Lead Alerts**: Get notified immediately when high-value leads are identified.
- **Export Data**: Easily export lead data for use in other tools.

## 🛠️ Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Authentication**: [Clerk](https://clerk.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Animation**: [Framer Motion](https://www.framer.com/motion/) (implied/used in components)

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/wa_frontend.git
   cd wa_frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env.local` file in the root directory and add your required keys (e.g., Clerk keys, Database URL).
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
   CLERK_SECRET_KEY=your_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
