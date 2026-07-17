export type SourceType = "WEBSITE" | "INTEGRATION" | "FILES" | "HELPDESK"
export type DocStatus = "INDEXED" | "SYNCING" | "FAILED" | "DRAFT"

export interface SyncProgress {
  status: "pending" | "in-progress" | "completed" | "failed"
  current: number
  total: number
  percentage: number
  startedAt: string
  completedAt?: string
}

export interface KbDocument {
  id: number
  source_id: number
  source_filename: string | null
  file_type: string
  external_id: string
  status: DocStatus
  extracted_text: string
  extracted_text_bytes: number
  content_bytes: number
  parent_chunk_count: number
  child_chunk_count: number
  embed_token_count: number
  created_at: string
  updated_at: string
}

export interface KbSource {
  id: number
  name: string
  url: string
  type: SourceType
  status: DocStatus
  category: string
  documents: KbDocument[]
  created_at: string
  updated_at: string
  syncProgress?: SyncProgress
}

export const KB_SOURCES: KbSource[] = [
  {
    id: 84,
    name: "cliniko.com",
    url: "https://cliniko.com",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Healthcare",
    created_at: "2026-06-30T14:53:39Z",
    updated_at: "2026-06-30T14:54:32Z",
    documents: [
      // 🌟 NEW: Root URL Document
      {
        id: 12901,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/",
        status: "INDEXED",
        extracted_text: `# Cliniko: Practice Management Software\n\n![Cliniko Dashboard](https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=1000)\n\nCliniko is a complete practice management application used by thousands of healthcare practitioners in more than 95 countries. We aim to streamline your day-to-day operations so you can focus on what matters most: your patients.\n\n## Everything you need to run your clinic\n\nManage schedules, treatment notes, invoices, payments, and a lot more. It works great for solo practitioners, large multi-location teams, and anything in between. Our cloud-based infrastructure ensures you can access your clinic from anywhere, on any device.\n\n### Core Features\n\n- **Appointments:** Easy-to-use calendar for bookings and scheduling. Color-code by practitioner or appointment type.\n- **Treatment Notes:** Secure, customizable, and comprehensive. Create templates that match your specific workflow.\n- **Invoices & Payments:** Streamlined billing to help you get paid faster. Integrates directly with major payment gateways.\n- **Telehealth:** Built-in secure video consultations at no extra cost. Connect with patients remotely with a single click.\n- **Online Bookings:** Let your patients book themselves 24/7, reducing front-desk administrative load.\n\n> "Switching to Cliniko was the best decision we made for our clinic. The interface is intuitive, and the support team is incredibly responsive."\n\n[Start your free 30-day trial today](https://cliniko.com/trial)`,
        extracted_text_bytes: 18520,
        content_bytes: 42000,
        parent_chunk_count: 8,
        child_chunk_count: 24,
        embed_token_count: 2350,
        created_at: "2026-06-30T14:53:40Z",
        updated_at: "2026-06-30T14:53:45Z",
      },
      // 🌟 NEW: Draft Document
      {
        id: 12902,
        source_id: 84,
        source_filename: "Internal Operations Guide v2",
        file_type: "pdf",
        external_id: "internal-ops-v2.pdf",
        status: "DRAFT",
        extracted_text: `# Internal Operations Guide v2\n\n**DRAFT VERSION - CONFIDENTIAL**\n\n![Team Meeting](https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1000)\n\nThis document outlines the updated internal operating procedures for the support team. Needs review before publishing to the wider company.\n\n## 1. Ticket Escalation Protocol\n\nWhen a support ticket exceeds the Level 1 resolution timeframe (currently 4 hours), it must be escalated to Level 2. \n\nBefore escalating, ensure:\n- All initial troubleshooting steps are documented.\n- The customer's account ID and relevant logs are attached.\n- The priority flag is accurately set based on business impact.\n\n## 2. Remote Work Security\n\nAll team members operating remotely must connect via the corporate VPN before accessing patient-identifiable information (PII). No exceptions will be made. Local storage of PII is strictly prohibited.\n\n--- \n*Please leave comments on this draft before Friday's all-hands meeting.*`,
        extracted_text_bytes: 450,
        content_bytes: 1200,
        parent_chunk_count: 0,
        child_chunk_count: 0,
        embed_token_count: 0,
        created_at: "2026-07-16T10:00:00Z",
        updated_at: "2026-07-16T10:05:00Z",
      },
      {
        id: 12946,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/reviews/",
        status: "INDEXED",
        extracted_text: `## Cliniko Reviews\n\n![Customer Success](https://images.unsplash.com/photo-1556761175-5973dc0f32b7?auto=format&fit=crop&q=80&w=1000)\n\nSee what people are saying about Cliniko. We pride ourselves on listening to our community and continuously improving our platform based on real-world feedback.\n\n> "Cliniko has been an integral part of our daily running of our exercise physiology business. The business would struggle to run efficiently without Cliniko. From creating bookings for multiple staff, sending reminders, all the way to bookkeeping, Cliniko has saved us a lot of time."\n\n— **Jason Lee**, E-Leet Physiology, Australia\n\n> "Cliniko is a must have for clinic owners and allied health practitioners. I started using Cliniko in 2018 when I started my company from there we have grown to 3 locations and over 10 staff. The telehealth feature alone saved our business during the lockdowns."\n\n— **Jack Green**, Green Physiotherapy\n\n## Ratings Summary\n\nBased on over 1,200 verified user reviews across major software comparison platforms:\n\n- Overall: ★★★★★ (4.9/5)\n- Ease of Use: ★★★★★\n- Customer Support: ★★★★★\n- Value for Money: ★★★★☆\n\nRead more detailed case studies on our blog.`,
        extracted_text_bytes: 20734,
        content_bytes: 47074,
        parent_chunk_count: 5,
        child_chunk_count: 21,
        embed_token_count: 3552,
        created_at: "2026-06-30T14:53:53Z",
        updated_at: "2026-06-30T14:53:56Z",
      },
      {
        id: 12975,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/connected-apps/ac-connect",
        status: "INDEXED",
        extracted_text: `## AC Connect\n\nDirect invoicing for New Zealand ACC providers using Cliniko.\n\nAC Connect is your ultimate ACC administration solution for New Zealand healthcare providers using Cliniko. Designed with simplicity in mind, it simplifies your workflow, reduces manual effort, and keeps you focused on patient care.\n\n### Key Features\n\n- Instantly access Active ACC claims, remaining treatment balances, and claim history and usage\n- Add new claims or link existing ones in seconds\n- Track usage with clarity and confidence, all from one place\n- Streamlined ACC invoicing\n\n### Integration\n\nBuilt to integrate with your existing Cliniko setup, it transforms how you manage ACC claims, appointments, and invoicing using the same processes you're already familiar with.`,
        extracted_text_bytes: 5126,
        content_bytes: 10953,
        parent_chunk_count: 4,
        child_chunk_count: 6,
        embed_token_count: 567,
        created_at: "2026-06-30T14:54:24Z",
        updated_at: "2026-06-30T14:54:32Z",
      },
      {
        id: 12950,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/charity/",
        status: "INDEXED",
        extracted_text: `# Charity\n\nWhen we say that Cliniko is "software for people who care", we mean it — this isn't a marketing gimmick. Giving back has always been part of our ethos at Cliniko.\n\n## Our Ethos\n\nAt Cliniko, it's always been our goal to leave the world as a slightly better place than we found it. Our charitable donations are one of the most important commitments we make.\n\nCliniko makes money from subscription fees and we don't take funding from investors, so our capacity to donate is solely down to our customers.\n\n## Charitable Partners\n\n- Sea Shepherd Australia\n- Médecins Sans Frontières\n- Electronic Frontiers Australia\n- Greenpeace Australia\n\n## Impact\n\nSince 2012, Cliniko has donated over **$500,000** to charitable causes around the world.`,
        extracted_text_bytes: 11367,
        content_bytes: 22684,
        parent_chunk_count: 20,
        child_chunk_count: 20,
        embed_token_count: 1526,
        created_at: "2026-06-30T14:53:57Z",
        updated_at: "2026-06-30T14:54:02Z",
      },
      {
        id: 12951,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/faq/what-is-practice-management-software/",
        status: "INDEXED",
        extracted_text: `# What is Practice Management Software?\n\nOur definition of practice management software is fairly simple: it's software that helps you run or manage your healthcare business.\n\n## What Does It Do?\n\nPractice management software is essentially a software system that replaces many of a clinic's processes that used to be paper-based.\n\nGood practice management software will automate and digitise most of the day-to-day tasks of running a practice:\n\n- The calendar is digital\n- Appointment bookings can be made and cancelled at the click of a mouse\n- All the information you need about a patient is stored securely in one place\n- It requires minimal paper, effort, and time from practitioners\n\n## Why Cliniko?\n\nCliniko is purpose-built for allied health practitioners. It covers everything from scheduling to billing, treatment notes to patient communication.`,
        extracted_text_bytes: 14364,
        content_bytes: 32285,
        parent_chunk_count: 6,
        child_chunk_count: 18,
        embed_token_count: 3086,
        created_at: "2026-06-30T14:53:57Z",
        updated_at: "2026-06-30T14:53:58Z",
      },
      {
        id: 12935,
        source_id: 84,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://cliniko.com/pricing/",
        status: "INDEXED",
        extracted_text: `# Cliniko Pricing\n\nCliniko is practice management software that's free to try for the first 30 days. After that, your subscription is based on how many practitioners work at your clinic.\n\n## Monthly Pricing by Number of Practitioners\n\n| Practitioners | Monthly Price |\n|---|---|\n| 1 practitioner | $45/mo |\n| 2 to 5 practitioners | $95/mo |\n| 6 to 8 practitioners | $145/mo |\n| 9 to 12 practitioners | $195/mo |\n| 13 to 25 practitioners | $295/mo |\n| 26 to 200 practitioners | $395/mo |\n\n## What's Included?\n\n- Unlimited appointments and patients\n- Unlimited storage\n- Email and SMS reminders\n- Online bookings\n- Telehealth video consultations\n- All features, no tiers\n\n## Free Trial\n\n[Try free for 30 days](https://www.cliniko.com/free-trial/) — no credit card required.`,
        extracted_text_bytes: 9960,
        content_bytes: 21188,
        parent_chunk_count: 6,
        child_chunk_count: 13,
        embed_token_count: 1764,
        created_at: "2026-06-30T14:53:39Z",
        updated_at: "2026-06-30T14:53:41Z",
      },
    ],
  },
  {
    id: 6,
    name: "portfolio-frontend",
    url: "https://portfolio-frontend-teal-ten.vercel.app",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Business",
    created_at: "2026-06-20T09:00:00Z",
    updated_at: "2026-06-20T09:05:00Z",
    documents: [
      {
        id: 200,
        source_id: 6,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://portfolio-frontend-teal-ten.vercel.app/",
        status: "INDEXED",
        extracted_text: `# John Doe — Full Stack Developer\n\n![Workspace](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1000)\n\nWelcome to my portfolio. I build modern, scalable web applications focusing on performance, accessibility, and beautiful user experiences.\n\n## About Me\n\nI'm a passionate developer with 5+ years of experience. I specialize in building full-stack applications from scratch, handling everything from database design to frontend animations.\n\nWhen I'm not coding, you can find me hiking, reading sci-fi novels, or experimenting with new coffee brewing methods.\n\n## Technical Arsenal\n\n### Frontend\n- **Frameworks:** React, Next.js, Vue.js\n- **Styling:** Tailwind CSS, Styled Components, Framer Motion\n- **Languages:** TypeScript, JavaScript (ES6+), HTML5/CSS3\n\n### Backend\n- **Environments:** Node.js, Deno\n- **Frameworks:** Express, NestJS, Fastify\n- **Databases:** PostgreSQL, MongoDB, Redis\n\n### DevOps & Cloud\n- **Tools:** Docker, GitHub Actions, Terraform\n- **Providers:** AWS, Vercel, Cloudflare\n\nFeel free to explore my projects or get in touch for collaboration!`,
        extracted_text_bytes: 3200,
        content_bytes: 7000,
        parent_chunk_count: 2,
        child_chunk_count: 5,
        embed_token_count: 450,
        created_at: "2026-06-20T09:00:00Z",
        updated_at: "2026-06-20T09:01:00Z",
      },
      {
        id: 201,
        source_id: 6,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://portfolio-frontend-teal-ten.vercel.app/projects",
        status: "INDEXED",
        extracted_text: `# Projects\n\n## E-Commerce Platform\nA full-stack e-commerce solution built with Next.js and Stripe.\n\n## Real-time Chat App\nA WebSocket-based chat application supporting thousands of concurrent users.\n\n## Analytics Dashboard\nA data visualization dashboard built with Recharts and PostgreSQL.`,
        extracted_text_bytes: 2100,
        content_bytes: 4800,
        parent_chunk_count: 2,
        child_chunk_count: 4,
        embed_token_count: 280,
        created_at: "2026-06-20T09:01:00Z",
        updated_at: "2026-06-20T09:02:00Z",
      },
      {
        id: 202,
        source_id: 6,
        source_filename: null,
        file_type: "full_page",
        external_id: "https://portfolio-frontend-teal-ten.vercel.app/contact",
        status: "INDEXED",
        extracted_text: `# Contact\n\nGet in touch with me for project inquiries or collaboration.\n\n- **Email**: john@example.com\n- **LinkedIn**: linkedin.com/in/johndoe\n- **GitHub**: github.com/johndoe`,
        extracted_text_bytes: 800,
        content_bytes: 1600,
        parent_chunk_count: 1,
        child_chunk_count: 2,
        embed_token_count: 120,
        created_at: "2026-06-20T09:02:00Z",
        updated_at: "2026-06-20T09:03:00Z",
      },
    ],
  },
  {
    id: 24,
    name: "Google Drive Docs",
    url: "https://drive.google.com",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Documentation",
    created_at: "2026-07-01T10:00:00Z",
    updated_at: "2026-07-01T10:30:00Z",
    documents: [],
  },
  {
    id: 25,
    name: "Zendesk Support",
    url: "https://zendesk.com",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Support",
    created_at: "2026-07-02T08:00:00Z",
    updated_at: "2026-07-02T08:15:00Z",
    documents: [],
  },
  {
    id: 26,
    name: "Slack Integration",
    url: "https://slack.com",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Communication",
    created_at: "2026-07-02T09:00:00Z",
    updated_at: "2026-07-02T09:20:00Z",
    documents: [],
  },
  {
    id: 27,
    name: "Stripe API",
    url: "https://stripe.com/docs",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Business",
    created_at: "2026-07-02T10:00:00Z",
    updated_at: "2026-07-02T10:30:00Z",
    documents: [],
  },
  {
    id: 28,
    name: "Healthcare Portal",
    url: "https://healthcareportal.com",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Healthcare",
    created_at: "2026-07-02T11:00:00Z",
    updated_at: "2026-07-02T11:45:00Z",
    documents: [],
  },
  {
    id: 29,
    name: "API Documentation",
    url: "https://api-docs.example.com",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Documentation",
    created_at: "2026-07-02T12:00:00Z",
    updated_at: "2026-07-02T12:30:00Z",
    documents: [],
  },
  {
    id: 30,
    name: "Customer Support Chat",
    url: "https://support.example.com/chat",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Support",
    created_at: "2026-07-02T13:00:00Z",
    updated_at: "2026-07-02T13:25:00Z",
    documents: [],
  },
  {
    id: 31,
    name: "GitHub Repository",
    url: "https://github.com/example/repo",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Business",
    created_at: "2026-07-02T14:00:00Z",
    updated_at: "2026-07-02T14:40:00Z",
    documents: [],
  },
  {
    id: 32,
    name: "Teams Channel",
    url: "https://teams.microsoft.com",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Communication",
    created_at: "2026-07-02T15:00:00Z",
    updated_at: "2026-07-02T15:20:00Z",
    documents: [],
  },
  {
    id: 33,
    name: "Notion Workspace",
    url: "https://notion.so",
    type: "INTEGRATION",
    status: "INDEXED",
    category: "Documentation",
    created_at: "2026-07-02T16:00:00Z",
    updated_at: "2026-07-02T16:35:00Z",
    documents: [],
  },
  {
    id: 34,
    name: "Developer Guide",
    url: "https://dev-guide.example.com",
    type: "WEBSITE",
    status: "INDEXED",
    category: "Documentation",
    created_at: "2026-07-02T17:00:00Z",
    updated_at: "2026-07-02T17:15:00Z",
    documents: [],
  },
]