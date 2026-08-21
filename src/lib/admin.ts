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
