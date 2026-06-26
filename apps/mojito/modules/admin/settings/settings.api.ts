import { delay, USE_MOCK } from "../shared/mock.utils";

// TODO(backend): replace with real API

// ─── User / Profile ───────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  timezone: string;
  role: "owner" | "admin" | "editor" | "viewer";
}

let userProfile: UserProfile = {
  id: "u_1",
  name: "Alex Johnson",
  email: "alex@yourbrand.com",
  avatarUrl: "https://picsum.photos/seed/profile/80/80",
  timezone: "America/New_York",
  role: "owner",
};

export async function fetchUserProfile(): Promise<UserProfile> {
  await delay();
  return { ...userProfile };
}

export async function updateUserProfile(
  patch: Partial<UserProfile>,
): Promise<UserProfile> {
  await delay();
  userProfile = { ...userProfile, ...patch };
  return { ...userProfile };
} // TODO(backend): PATCH /user/profile

// ─── Workspace ────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  logoUrl?: string;
  timezone: string;
  website?: string;
  industry?: string;
}

let workspace: Workspace = {
  id: "ws_1",
  name: "Your Brand HQ",
  logoUrl: "https://picsum.photos/seed/ws/100/40",
  timezone: "America/New_York",
  website: "https://yourbrand.com",
  industry: "Technology",
};

export async function fetchWorkspace(): Promise<Workspace> {
  await delay();
  return { ...workspace };
}

export async function updateWorkspace(
  patch: Partial<Workspace>,
): Promise<Workspace> {
  await delay();
  workspace = { ...workspace, ...patch };
  return { ...workspace };
} // TODO(backend): multi-workspace switcher

// ─── Team Members ─────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatarUrl?: string;
  joinedAt: Date;
  status: "active" | "invited" | "suspended";
}

let teamMembers: TeamMember[] = [
  {
    id: "m_1",
    name: "Alex Johnson",
    email: "alex@yourbrand.com",
    role: "owner",
    joinedAt: new Date("2024-01-15"),
    status: "active",
  },
  {
    id: "m_2",
    name: "Sam Rivera",
    email: "sam@yourbrand.com",
    role: "admin",
    joinedAt: new Date("2024-02-10"),
    status: "active",
  },
  {
    id: "m_3",
    name: "Jordan Lee",
    email: "jordan@yourbrand.com",
    role: "editor",
    joinedAt: new Date("2024-03-05"),
    status: "active",
  },
  {
    id: "m_4",
    name: "Casey Park",
    email: "casey@yourbrand.com",
    role: "viewer",
    joinedAt: new Date("2024-04-01"),
    status: "active",
  },
  {
    id: "m_5",
    name: "Morgan Chen",
    email: "morgan@yourbrand.com",
    role: "editor",
    joinedAt: new Date("2024-05-20"),
    status: "invited",
  },
];

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  await delay();
  return [...teamMembers];
}

export async function inviteMember(
  email: string,
  role: TeamMember["role"],
): Promise<TeamMember> {
  await delay();
  const member: TeamMember = {
    id: `m_${Date.now()}`,
    name: email.split("@")[0],
    email,
    role,
    joinedAt: new Date(),
    status: "invited",
  };
  teamMembers.push(member);
  return member;
}

export async function updateMemberRole(
  id: string,
  role: TeamMember["role"],
): Promise<TeamMember> {
  await delay();
  const idx = teamMembers.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Member not found");
  teamMembers[idx] = { ...teamMembers[idx], role };
  return teamMembers[idx];
}

export async function removeMember(id: string): Promise<void> {
  await delay();
  const member = teamMembers.find((m) => m.id === id);
  if (member?.role === "owner")
    throw new Error("Cannot remove workspace owner");
  teamMembers = teamMembers.filter((m) => m.id !== id);
} // TODO(backend): DELETE /team/:id

// ─── Notification Preferences ─────────────────────────────────────────────────

export interface NotificationPrefs {
  email: {
    approvals: boolean;
    mentions: boolean;
    weeklyReport: boolean;
    teamActivity: boolean;
    billing: boolean;
  };
  inApp: {
    approvals: boolean;
    mentions: boolean;
    automationAlerts: boolean;
    publishingFailures: boolean;
  };
}

let notifPrefs: NotificationPrefs = {
  email: {
    approvals: true,
    mentions: true,
    weeklyReport: true,
    teamActivity: false,
    billing: true,
  },
  inApp: {
    approvals: true,
    mentions: true,
    automationAlerts: true,
    publishingFailures: true,
  },
};

export async function fetchNotificationPrefs(): Promise<NotificationPrefs> {
  await delay(100);
  return JSON.parse(JSON.stringify(notifPrefs));
}

export async function updateNotificationPrefs(
  patch: Partial<NotificationPrefs>,
): Promise<NotificationPrefs> {
  await delay();
  notifPrefs = { ...notifPrefs, ...patch };
  return JSON.parse(JSON.stringify(notifPrefs));
} // TODO(backend): PATCH /user/notification-prefs

// ─── Integrations ─────────────────────────────────────────────────────────────

export interface Integration {
  id: string;
  name: string;
  description: string;
  category: "analytics" | "crm" | "ecommerce" | "messaging" | "productivity";
  logoUrl: string;
  connected: boolean;
  connectedAt?: Date;
}

let integrations: Integration[] = [
  {
    id: "int_1",
    name: "Google Analytics",
    description: "Track website traffic and conversions",
    category: "analytics",
    logoUrl: "https://picsum.photos/seed/ga/40/40",
    connected: true,
    connectedAt: new Date("2024-02-01"),
  },
  {
    id: "int_2",
    name: "HubSpot",
    description: "Sync leads and CRM data",
    category: "crm",
    logoUrl: "https://picsum.photos/seed/hs/40/40",
    connected: false,
  },
  {
    id: "int_3",
    name: "Shopify",
    description: "Link product catalog to posts",
    category: "ecommerce",
    logoUrl: "https://picsum.photos/seed/sh/40/40",
    connected: true,
    connectedAt: new Date("2024-03-15"),
  },
  {
    id: "int_4",
    name: "Slack",
    description: "Post-publish notifications to channels",
    category: "messaging",
    logoUrl: "https://picsum.photos/seed/sl/40/40",
    connected: true,
    connectedAt: new Date("2024-01-20"),
  },
  {
    id: "int_5",
    name: "Zapier",
    description: "Automate workflows with 5000+ apps",
    category: "productivity",
    logoUrl: "https://picsum.photos/seed/zap/40/40",
    connected: false,
  },
  {
    id: "int_6",
    name: "Stripe",
    description: "Link campaign spend to revenue",
    category: "ecommerce",
    logoUrl: "https://picsum.photos/seed/str/40/40",
    connected: false,
  },
  {
    id: "int_7",
    name: "Mailchimp",
    description: "Sync newsletter audience data",
    category: "messaging",
    logoUrl: "https://picsum.photos/seed/mc/40/40",
    connected: false,
  },
  {
    id: "int_8",
    name: "Notion",
    description: "Import content briefs and docs",
    category: "productivity",
    logoUrl: "https://picsum.photos/seed/nt/40/40",
    connected: false,
  },
];

export async function fetchIntegrations(): Promise<Integration[]> {
  await delay();
  return [...integrations];
}

export async function connectIntegration(id: string): Promise<Integration> {
  await delay(1200);
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Integration not found");
  integrations[idx] = {
    ...integrations[idx],
    connected: true,
    connectedAt: new Date(),
  };
  return integrations[idx];
}

export async function disconnectIntegration(id: string): Promise<Integration> {
  await delay();
  const idx = integrations.findIndex((i) => i.id === id);
  if (idx === -1) throw new Error("Integration not found");
  integrations[idx] = {
    ...integrations[idx],
    connected: false,
    connectedAt: undefined,
  };
  return integrations[idx];
} // TODO(backend): DELETE /integrations/:id/connection

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: "monthly" | "annual";
  features: string[];
}

export interface Invoice {
  id: string;
  date: Date;
  amount: number;
  status: "paid" | "pending" | "failed";
  pdfUrl?: string;
}

export interface BillingInfo {
  currentPlan: Plan;
  nextBillingDate: Date;
  paymentMethod: { brand: string; last4: string };
  usage: {
    channels: { used: number; limit: number };
    posts: { used: number; limit: number };
    team: { used: number; limit: number };
  };
  invoices: Invoice[];
  availablePlans: Plan[];
}

export async function fetchBillingInfo(): Promise<BillingInfo> {
  await delay();
  return {
    currentPlan: {
      id: "plan_pro",
      name: "Pro",
      price: 49,
      period: "monthly",
      features: [
        "10 channels",
        "500 posts/month",
        "5 team members",
        "Analytics",
        "Automation",
      ],
    },
    nextBillingDate: new Date(Date.now() + 15 * 86_400_000),
    paymentMethod: { brand: "Visa", last4: "4242" },
    usage: {
      channels: { used: 4, limit: 10 },
      posts: { used: 187, limit: 500 },
      team: { used: 5, limit: 5 },
    },
    invoices: Array.from({ length: 6 }, (_, i) => ({
      id: `inv_${i + 1}`,
      date: new Date(Date.now() - i * 30 * 86_400_000),
      amount: 49,
      status: "paid" as const,
      pdfUrl: "#",
    })),
    availablePlans: [
      {
        id: "plan_starter",
        name: "Starter",
        price: 19,
        period: "monthly",
        features: [
          "3 channels",
          "100 posts/month",
          "1 team member",
          "Basic analytics",
        ],
      },
      {
        id: "plan_pro",
        name: "Pro",
        price: 49,
        period: "monthly",
        features: [
          "10 channels",
          "500 posts/month",
          "5 team members",
          "Analytics",
          "Automation",
        ],
      },
      {
        id: "plan_business",
        name: "Business",
        price: 99,
        period: "monthly",
        features: [
          "Unlimited channels",
          "Unlimited posts",
          "15 team members",
          "Advanced analytics",
          "Priority support",
        ],
      },
    ],
  };
} // TODO(backend): GET /billing
