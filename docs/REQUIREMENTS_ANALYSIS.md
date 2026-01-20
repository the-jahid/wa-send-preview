# WapZen - WhatsApp AI Automation Platform
# Requirements Analysis Document

**Version:** 1.0  
**Date:** January 12, 2026  
**Application:** wa_frontend  
**Technology Stack:** Next.js 15, TypeScript, Tailwind CSS, Clerk Authentication, TanStack Query

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [User Roles & Authentication](#3-user-roles--authentication)
4. [Functional Requirements](#4-functional-requirements)
   - 4.1 [Landing Page Module](#41-landing-page-module)
   - 4.2 [Dashboard Module](#42-dashboard-module)
   - 4.3 [AI Agent Management](#43-ai-agent-management)
   - 4.4 [Outbound Campaign Management](#44-outbound-campaign-management)
   - 4.5 [Conversation Management](#45-conversation-management)
   - 4.6 [Free Tools Module](#46-free-tools-module)
   - 4.7 [Blog Module](#47-blog-module)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Technical Architecture](#6-technical-architecture)
7. [Data Models](#7-data-models)
8. [Integration Points](#8-integration-points)
9. [SEO Requirements](#9-seo-requirements)

---

## 1. Executive Summary

WapZen is a comprehensive WhatsApp AI Automation Platform designed to transform WhatsApp into a 24/7 sales machine. The platform enables businesses to:

- **Automate customer interactions** with AI-powered chatbots
- **Capture and qualify leads** automatically
- **Book appointments** via Google Calendar integration
- **Send bulk messages** to thousands of contacts via CSV upload
- **Manage conversations** in real-time

**Key Value Propositions:**
- No WhatsApp API approval required
- 2-minute setup time
- Zero-code bot builder
- Unlimited messaging with flat pricing

---

## 2. System Overview

### 2.1 Application Structure

```
wa_frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (ui)/               # Authenticated UI routes
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── blog/           # Blog viewing/creation
│   │   │   └── test/           # Testing routes
│   │   ├── features/           # Feature modules (API hooks, types)
│   │   ├── free-tools/         # Public free tools
│   │   └── google/             # Google OAuth routes
│   ├── components/             # Reusable UI components
│   │   ├── aceternity/         # Animation components
│   │   ├── blog/               # Blog-specific components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── landing/            # Landing page components
│   │   └── ui/                 # Base UI components (shadcn/ui)
│   └── lib/                    # Utilities and configurations
└── public/                     # Static assets
```

### 2.2 Technology Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS v4 |
| **UI Components** | Radix UI, shadcn/ui, Lucide Icons |
| **Authentication** | Clerk |
| **State Management** | TanStack Query (React Query) |
| **Animation** | Framer Motion, Custom CSS animations |

---

## 3. User Roles & Authentication

### 3.1 Authentication Provider

The application uses **Clerk** for authentication, supporting:

- Email/Password sign-up
- OAuth providers (Google)
- Modal-based authentication flow
- Secure session management

### 3.2 User States

| State | Access Level |
|-------|--------------|
| **Guest (Signed Out)** | Landing page, Free tools, Public blog |
| **Authenticated (Signed In)** | Full dashboard access, Agent management, Campaign creation, Blog authoring |

### 3.3 Authentication Routes

- `/dashboard/*` - Protected routes (requires authentication)
- `/blog/*` - Mixed access (view: public, create: authenticated)
- `/free-tools/*` - Public access

---

## 4. Functional Requirements

### 4.1 Landing Page Module

**Location:** `src/app/page.tsx`, `src/components/landing/`

#### 4.1.1 Components

| Component | Purpose |
|-----------|---------|
| `Navbar` | Navigation with theme toggle, auth buttons |
| `Hero` | Main headline, CTA buttons, live chat demo |
| `SocialProof` | Trust indicators, testimonials |
| `TwoMinuteSetup` | Step-by-step setup visualization |
| `AutomationShowcase` | Lead capture & appointment booking demos |
| `PainPoints` | Problem-solution presentation |
| `CoreFeatures` | 6 main feature cards |
| `HowItWorks` | Process explanation |
| `ROICalculator` | Interactive ROI calculator |
| `UseCases` | Industry-specific use cases |
| `Testimonials` | Customer testimonials |
| `FAQ` | Frequently asked questions |
| `FinalCTA` | Final call-to-action |
| `Footer` | Footer with links |

#### 4.1.2 Features Highlighted

1. **Zero Code Bot Builder**
   - 2-minute setup
   - QR code scanning
   - No API approval needed

2. **AI Sales Agent**
   - Lead qualification
   - 24/7 availability
   - Context-aware responses

3. **Smart Appointment Booking**
   - Auto-scheduling
   - Google Calendar integration
   - Automated reminders

4. **Bulk Outbound Messaging**
   - CSV upload support
   - Unlimited messaging
   - Personalized campaigns

5. **Lead Management Dashboard**
   - Real-time capture
   - Hot lead alerts
   - Data export

#### 4.1.3 Theme Support

- Dark mode (default)
- Light mode
- Persistent theme via localStorage
- System preference detection

---

### 4.2 Dashboard Module

**Location:** `src/app/(ui)/dashboard/`

#### 4.2.1 Overview Page (`/dashboard`)

**Features:**
- Dashboard statistics cards:
  - Total Agents count
  - Active/Inactive agent status
  - Campaign count
  - AI providers used
- Recent Agents list with quick navigation
- Outbound Campaigns list with status breakdown
- Refresh functionality
- Responsive design

**Data Sources:**
- `useAgents()` - Fetch agent data
- `useCampaigns()` - Fetch campaign data

#### 4.2.2 Navigation Structure

| Route | Label | Icon | Description |
|-------|-------|------|-------------|
| `/dashboard` | Overview | Home | Dashboard overview |
| `/dashboard/agents` | Agents | Bot | Manage AI agents |
| `/dashboard/outbound` | Outbound | OutdentIcon | Campaign management |
| `/dashboard/conversation` | Conversation | MessageSquare | Chat conversations |

#### 4.2.3 Sidebar Actions

- **Book Appointment** - Modal trigger
- **Collect Lead** - Modal trigger

---

### 4.3 AI Agent Management

**Location:** `src/app/(ui)/dashboard/agents/`, `src/components/dashboard/agent/`

#### 4.3.1 Agent List (`/dashboard/agents`)

**Features:**
- Grid display of all agents
- Agent cards with:
  - Name and status
  - Model type (ChatGPT, Gemini, Claude)
  - Memory type
  - Creation date
- Create Agent modal

#### 4.3.2 Agent Detail (`/dashboard/agents/[id]`)

**Tabs:**
1. **Overview Tab** - Agent summary and quick actions
2. **WhatsApp Tab** - WhatsApp connection management
3. **Tools Tab** - Agent tools configuration
4. **Knowledgebase Tab** - Knowledge base management
5. **Leads Tab** - Captured leads display
6. **Analytics Tab** - Performance analytics

#### 4.3.3 Agent Configuration Options

| Field | Type | Options |
|-------|------|---------|
| **Name** | Text | User-defined |
| **Active Status** | Boolean | Active/Inactive |
| **Provider** | Select | ChatGPT, Gemini, Claude |
| **Model** | Select | Provider-specific models |
| **Memory Type** | Select | Various memory configurations |
| **History Limit** | Number | Message history count |
| **System Prompt** | Textarea | AI behavior instructions |

#### 4.3.4 Supported AI Models

**OpenAI (ChatGPT):**
- gpt_3_5_turbo
- gpt_4
- gpt_4_turbo
- gpt_4o
- gpt_4o_mini
- o1, o1_mini, o1_preview
- o3_mini

**Google (Gemini):**
- gemini_flash_1_5, gemini_flash_1_5_8b
- gemini_pro_1_5
- gemini_flash_2_0
- gemini_flash_2_0_lite
- gemini_exp_1206

**Anthropic (Claude):**
- claude_3_haiku, claude_3_sonnet, claude_3_opus
- claude_3_5_haiku, claude_3_5_sonnet, claude_3_5_sonnet_v2
- claude_3_7_sonnet, claude_3_7_sonnet_thinking
- claude_4_opus, claude_4_opus_4_1, claude_4_sonnet

#### 4.3.5 WhatsApp Connection

**Connection Methods:**
1. **QR Code Login** - Scan QR with WhatsApp mobile
2. **Phone Pairing** - Link via phone number

**Features:**
- Connection status display
- Send test message functionality
- Toggle agent active status
- Refresh connection status

#### 4.3.6 Knowledgebase Management

**Features:**
- Document upload (file-based)
- Text document creation
- Pagination with limit options
- Search functionality
- Document metadata:
  - Title
  - Tags
  - Size
  - Created date
  - Chunk count
- Re-embedding functionality
- CRUD operations

---

### 4.4 Outbound Campaign Management

**Location:** `src/app/(ui)/dashboard/outbound/`

#### 4.4.1 Campaign List (`/dashboard/outbound`)

**Features:**
- Campaign cards with status indicators
- Status filter buttons
- Pagination with page size options
- Create campaign modal
- Delete confirmation modal

#### 4.4.2 Campaign Statuses

| Status | Color | Description |
|--------|-------|-------------|
| DRAFT | Slate | Not yet scheduled |
| SCHEDULED | Sky/Blue | Scheduled for future |
| RUNNING | Emerald/Green | Currently executing |
| COMPLETED | Gray | Finished |
| CANCELLED | Rose/Red | Cancelled by user |

#### 4.4.3 Campaign Detail (`/dashboard/outbound/[campaignId]`)

**Features:**
- Campaign overview
- Lead management
- Message analytics
- Edit campaign settings

#### 4.4.4 Campaign Configuration

- Campaign name
- Target agent selection
- Contact list (CSV upload)
- Message template
- Scheduling options
- Broadcast settings

---

### 4.5 Conversation Management

**Location:** `src/app/(ui)/dashboard/conversation/`

#### 4.5.1 Conversation Page (`/dashboard/conversation`)

**Features:**
- Conversation thread list (left panel)
- Message view (right panel)
- Real-time message sending
- Agent selection dropdown
- Search conversations
- Message timestamps
- Sender identification (AI vs Human)

#### 4.5.2 Message Display

- Phone number formatting from JID
- User initials generation
- Time formatting (relative: "Today", "Yesterday", dates)
- Thread grouping by sender

#### 4.5.3 Send Message Functionality

**Requirements:**
- Valid API token
- Connected WhatsApp agent
- Valid phone number

---

### 4.6 Free Tools Module

**Location:** `src/app/free-tools/`

#### 4.6.1 Free Tools Hub (`/free-tools`)

**Features:**
- Tools grid with active tools and coming soon placeholders
- Why Use Wapzen Tools section (Fast, Secure, Free)
- SEO-optimized with structured data (JSON-LD)

**Available Tools:**
| Tool | Status | Description |
|------|--------|-------------|
| **Number Checker** | Active | Verify WhatsApp numbers |
| **Link Generator** | Coming Soon | Generate WhatsApp links |
| **Bulk Sender** | Coming Soon | Bulk message sending |

#### 4.6.2 WhatsApp Number Checker (`/free-tools/number-checker`)

**Features:**
- Country code selector (200+ countries)
- Phone number input
- Real-time WhatsApp verification
- Results display:
  - Valid/Invalid status
  - WhatsApp availability
  - Formatted number
  - Country information
  - National number

**SEO:**
- JSON-LD structured data (SoftwareApplication, FAQPage)
- FAQ accordion

---

### 4.7 Blog Module

**Location:** `src/app/(ui)/blog/`, `src/components/blog/`

#### 4.7.1 Blog List (`/blog`)

**Features:**
- Blog grid display
- Filter functionality
- Pagination
- Search capability
- "Write a Blog" button (authenticated users)
- Sign-in prompt (unauthenticated users)

#### 4.7.2 Blog Editor

**Features:**
- Title input
- Content editor
- Image upload (optional)
- Auto author attribution via OAuth ID
- Success callback for inline creation

#### 4.7.3 Blog Detail (`/blog/[id]` or `/blog/[slug]`)

- Full article display
- Author information
- Publication date
- Related articles (if applicable)

---

## 5. Non-Functional Requirements

### 5.1 Performance

- **First Contentful Paint:** < 2 seconds
- **Time to Interactive:** < 3 seconds
- **Lighthouse Score:** > 90

### 5.2 Responsiveness

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Touch-friendly interactions

### 5.3 Accessibility

- ARIA labels on interactive elements
- Keyboard navigation support
- High contrast color options (dark/light mode)
- Focus states on all interactive elements

### 5.4 Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

### 5.5 Theme Support

- Dark mode (default)
- Light mode
- System preference auto-detection
- Persistent preference storage

---

## 6. Technical Architecture

### 6.1 Frontend Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js App Router                    │
├─────────────────────────────────────────────────────────┤
│  Layout (Theme, Clerk Provider, Query Provider)          │
├─────────────────────────────────────────────────────────┤
│                         Pages                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Landing │ │Dashboard│ │ Free    │ │  Blog   │       │
│  │  Page   │ │ Routes  │ │ Tools   │ │ Routes  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│                       Components                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ Landing │ │Dashboard│ │   UI    │ │  Blog   │       │
│  │  Comps  │ │  Comps  │ │(shadcn) │ │ Comps   │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│                    Feature Modules                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  Agent  │ │Campaign │ │ WhatsApp│ │Knowledge│       │
│  │  API    │ │   API   │ │   API   │ │ Base API│       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
├─────────────────────────────────────────────────────────┤
│              TanStack Query + API Token Provider         │
└─────────────────────────────────────────────────────────┘
```

### 6.2 State Management

- **Server State:** TanStack Query (React Query)
- **Local State:** React useState/useEffect
- **Theme State:** localStorage + React state
- **Auth State:** Clerk hooks (useUser, useSession)

### 6.3 API Communication

- RESTful API endpoints
- JWT-based authentication
- API token provider for authenticated requests
- Environment-based API URL configuration

---

## 7. Data Models

### 7.1 Agent Entity

```typescript
interface Agent {
  id: string
  name: string
  isActive: boolean
  modelType: "CHATGPT" | "GEMINI" | "CLAUDE"
  model: string
  memoryType: string
  historyLimit: number
  prompt: string
  createdAt: string
  updatedAt: string
}
```

### 7.2 Outbound Campaign Entity

```typescript
interface OutboundCampaignEntity {
  id: string
  name: string
  status: "DRAFT" | "SCHEDULED" | "RUNNING" | "COMPLETED" | "CANCELLED"
  agentId: string
  createdAt: string
  updatedAt: string
}
```

### 7.3 Conversation Message

```typescript
interface ConversationMessage {
  id: string
  senderJid: string
  content: string
  timestamp: string
  isFromAI: boolean
}
```

### 7.4 Knowledgebase Document

```typescript
interface KnowledgeBaseDocument {
  id: string
  agentId: string
  title: string
  content: string
  tags: string[]
  size: number
  chunkCount: number
  createdAt: string
  updatedAt: string
}
```

### 7.5 Blog Entity

```typescript
interface Blog {
  id: string
  title: string
  content: string
  authorOauthId: string
  image?: ImageData
  createdAt: string
  updatedAt: string
}
```

---

## 8. Integration Points

### 8.1 External Services

| Service | Purpose | Integration Type |
|---------|---------|------------------|
| **Clerk** | Authentication | SDK/OAuth |
| **WhatsApp** | Messaging | Backend API |
| **Google Calendar** | Appointment booking | OAuth 2.0 |
| **OpenAI** | AI processing | Backend API |
| **Google AI** | AI processing | Backend API |
| **Anthropic** | AI processing | Backend API |

### 8.2 Third-Party Integrations (Advertised)

- Google Calendar
- Calendly
- HubSpot
- Salesforce
- Zapier
- Google Sheets

### 8.3 Backend API Endpoints

**Agent Endpoints:**
- `GET /agents` - List agents
- `POST /agents` - Create agent
- `GET /agents/:id` - Get agent details
- `PATCH /agents/:id` - Update agent
- `DELETE /agents/:id` - Delete agent

**Campaign Endpoints:**
- `GET /campaigns` - List campaigns
- `POST /campaigns` - Create campaign
- `GET /campaigns/:id` - Get campaign details
- `PATCH /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign

**WhatsApp Endpoints:**
- `POST /whatsapp/send` - Send message
- `GET /whatsapp/conversations` - Get conversations
- `GET /whatsapp/status` - Get connection status

**Knowledgebase Endpoints:**
- `GET /knowledgebase/:agentId` - Get knowledgebase
- `POST /knowledgebase/:agentId/documents` - Add document
- `PATCH /knowledgebase/:agentId/documents/:docId` - Update document
- `DELETE /knowledgebase/:agentId/documents/:docId` - Delete document

**Free Tools Endpoints:**
- `POST /free-tools/number-checker` - Check WhatsApp number

---

## 9. SEO Requirements

### 9.1 Meta Tags

- Dynamic title tags per page
- Meta descriptions
- Open Graph tags for social sharing
- Twitter Card tags

### 9.2 Sitemap

**Location:** `src/app/sitemap.ts`

Generated sitemap includes:
- Landing page
- Free tools pages
- Blog pages

### 9.3 Robots.txt

**Location:** `src/app/robots.ts`

Configuration for search engine crawlers.

### 9.4 Structured Data (JSON-LD)

- **Free Tools Hub:** CollectionPage schema
- **Number Checker:** SoftwareApplication + FAQPage schema

---

## Appendix A: Feature Modules Summary

| Module | Location | Description |
|--------|----------|-------------|
| Agent | `src/app/features/agent/` | Agent CRUD operations |
| Campaign | `src/app/features/outbound_campaign/` | Campaign management |
| WhatsApp | `src/app/features/whatsapp/` | WhatsApp messaging |
| Knowledgebase | `src/app/features/knowledgebase/` | KB document management |
| Blog | `src/app/features/blog/` | Blog content management |
| Conversations | `src/app/features/conversations/` | Conversation threads |
| Leads | `src/app/features/leads/` | Lead management |
| Booking | `src/app/features/booking/` | Appointment booking |

---

## Appendix B: Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk authentication key |
| `CLERK_SECRET_KEY` | Clerk server secret |
| `NEXT_PUBLIC_BACKEND_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL |
| `NEXT_PUBLIC_AGENT_ID` | Default agent ID for free tools |

---

## Appendix C: UI Component Library

Based on **shadcn/ui** with customizations:

- Button
- Card (CardHeader, CardContent, CardTitle)
- Badge
- Input
- Textarea
- Select
- Switch
- Label
- Dialog/Modal
- Accordion
- Tabs
- ScrollArea
- Command (Combobox)
- Popover
- Skeleton
- Tooltip

---

*Document generated based on codebase analysis of wa_frontend application.*
