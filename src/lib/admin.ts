"use client";

export interface Organization {
  id: string;
  name: string;
  createdAt: number;
}

export interface OrgUser {
  id: string;
  orgId: string;
  role: "teacher" | "student" | "admin";
  username: string;
  password: string;
  name: string;
  createdAt: number;
}

const ORG_KEY = "edutrack_organizations";
const ORG_USERS_KEY = "edutrack_org_users";
const MASTER_ADMIN_KEY = "edutrack_master_admin";

// Master Super Admin Configuration
export const DEFAULT_MASTER_ADMIN = {
  id: "super-admin-001",
  orgId: "org-master-edutrack",
  role: "admin" as const,
  username: "ADMIN_MASTER_2026",
  password: "EduTrack@Master#2026!",
  name: "Main Platform Administrator",
  createdAt: 1700000000000
};

export const ADMIN_PORTAL_SECRET_SLUG = "vault-7890x";
export const ADMIN_PORTAL_ROUTE = `/admin-portal-${ADMIN_PORTAL_SECRET_SLUG}`;

export function getMasterAdminCredentials(): { username: string; password: string } {
  if (typeof window === "undefined") {
    return {
      username: DEFAULT_MASTER_ADMIN.username,
      password: DEFAULT_MASTER_ADMIN.password
    };
  }
  try {
    const custom = localStorage.getItem(MASTER_ADMIN_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      return {
        username: parsed.username || DEFAULT_MASTER_ADMIN.username,
        password: parsed.password || DEFAULT_MASTER_ADMIN.password
      };
    }
  } catch (e) {}
  return {
    username: DEFAULT_MASTER_ADMIN.username,
    password: DEFAULT_MASTER_ADMIN.password
  };
}

export function updateMasterAdminPassword(newPassword: string, newUsername?: string): void {
  if (typeof window === "undefined") return;
  const current = getMasterAdminCredentials();
  const updated = {
    username: newUsername || current.username,
    password: newPassword
  };
  localStorage.setItem(MASTER_ADMIN_KEY, JSON.stringify(updated));
}

// --- Organizations ---

export function getStoredOrganizations(): Organization[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOrganizations(orgs: Organization[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_KEY, JSON.stringify(orgs));
}

export function createOrganization(name: string): Organization {
  const orgs = getStoredOrganizations();
  const newOrg: Organization = {
    id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    name,
    createdAt: Date.now()
  };
  orgs.push(newOrg);
  saveOrganizations(orgs);
  return newOrg;
}

// --- Org Users ---

export function getStoredOrgUsers(): OrgUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ORG_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveOrgUsers(users: OrgUser[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ORG_USERS_KEY, JSON.stringify(users));
}

export function generateOrgUser(orgId: string, role: "teacher" | "student" | "admin", name: string): OrgUser {
  const users = getStoredOrgUsers();
  
  // Generate a friendly username based on role and a random number
  const prefix = role === "teacher" ? "tch" : role === "admin" ? "adm" : "std";
  const num = Math.floor(1000 + Math.random() * 9000);
  const username = `${prefix}_${num}`;
  
  // Generate a random 6-character alphanumeric password
  const password = Math.random().toString(36).slice(-6).toUpperCase();

  const newUser: OrgUser = {
    id: `usr-${Date.now()}`,
    orgId,
    role,
    username,
    password,
    name,
    createdAt: Date.now()
  };

  users.push(newUser);
  saveOrgUsers(users);
  return newUser;
}

export function verifyOrgCredentials(username: string, password: string): OrgUser | null {
  // 1. Check Master Super Admin Credentials
  const masterCreds = getMasterAdminCredentials();
  if (username === masterCreds.username && password === masterCreds.password) {
    return {
      ...DEFAULT_MASTER_ADMIN,
      username: masterCreds.username,
      password: masterCreds.password
    };
  }

  // 2. Check Standard Organization Users
  const users = getStoredOrgUsers();
  const user = users.find(u => u.username === username && u.password === password);
  return user || null;
}

export function deleteOrganization(orgId: string): void {
  // Delete the org
  const orgs = getStoredOrganizations();
  saveOrganizations(orgs.filter(o => o.id !== orgId));

  // Delete all users associated with this org
  const users = getStoredOrgUsers();
  saveOrgUsers(users.filter(u => u.orgId !== orgId));
}

export function bulkGenerateOrgUsers(orgId: string, role: "teacher" | "student", names: string[]): OrgUser[] {
  const users = getStoredOrgUsers();
  const newUsers: OrgUser[] = [];

  names.forEach((name, index) => {
    if (!name.trim()) return;
    
    const prefix = role === "teacher" ? "tch" : "std";
    const num = Math.floor(1000 + Math.random() * 9000);
    const username = `${prefix}_${num}_${index}`;
    
    const password = Math.random().toString(36).slice(-6).toUpperCase();

    const newUser: OrgUser = {
      id: `usr-${Date.now()}-${index}`,
      orgId,
      role,
      username,
      password,
      name: name.trim(),
      createdAt: Date.now()
    };

    newUsers.push(newUser);
  });

  users.push(...newUsers);
  saveOrgUsers(users);
  
  return newUsers;
}
