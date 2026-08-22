"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { 
  Shield, Building, Users, KeyRound, PlusCircle, LayoutDashboard, 
  Copy, CheckCircle2, Trash2, UploadCloud, FileText, Loader2, 
  Lock, Eye, EyeOff, Key, Sparkles, ExternalLink, ShieldAlert, LogOut 
} from "lucide-react";
import { 
  getStoredOrganizations, getStoredOrgUsers, createOrganization, 
  generateOrgUser, deleteOrganization, bulkGenerateOrgUsers, 
  Organization, OrgUser, getMasterAdminCredentials, updateMasterAdminPassword,
  ADMIN_PORTAL_ROUTE, ADMIN_PORTAL_SECRET_SLUG
} from "@/lib/admin";
import { motion, AnimatePresence } from "framer-motion";

export default function SecureSuperAdminPortal() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [copiedId, setCopiedId] = useState("");

  // Master Admin Credentials state
  const [masterCreds, setMasterCreds] = useState<{ username: string; password: string }>({
    username: "",
    password: ""
  });
  const [showMasterPass, setShowMasterPass] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newMasterPassword, setNewMasterPassword] = useState("");
  const [passSaveSuccess, setPassSaveSuccess] = useState(false);
  
  // Bulk upload states
  const [uploadingOrgId, setUploadingOrgId] = useState<string | null>(null);
  const [bulkRole, setBulkRole] = useState<"student" | "teacher">("student");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verification & Auth check
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "admin") {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    setOrgs(getStoredOrganizations());
    setOrgUsers(getStoredOrgUsers());
    setMasterCreds(getMasterAdminCredentials());
  }, []);

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    const org = createOrganization(newOrgName);
    generateOrgUser(org.id, "admin", `${newOrgName} Admin`);
    setOrgs(getStoredOrganizations());
    setOrgUsers(getStoredOrgUsers());
    setNewOrgName("");
  };

  const handleDeleteOrg = (orgId: string) => {
    if (confirm("Are you sure you want to delete this organization? All generated teacher and student accounts will be permanently lost.")) {
      deleteOrganization(orgId);
      setOrgs(getStoredOrganizations());
      setOrgUsers(getStoredOrgUsers());
    }
  };

  const handleCreateTeacher = (orgId: string) => {
    generateOrgUser(orgId, "teacher", "New Teacher");
    setOrgUsers(getStoredOrgUsers());
  };

  const handleCreateStudent = (orgId: string) => {
    generateOrgUser(orgId, "student", "New Student");
    setOrgUsers(getStoredOrgUsers());
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  const handleSaveMasterPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterPassword.trim() || newMasterPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    updateMasterAdminPassword(newMasterPassword.trim());
    setMasterCreds(getMasterAdminCredentials());
    setIsEditingPassword(false);
    setNewMasterPassword("");
    setPassSaveSuccess(true);
    setTimeout(() => setPassSaveSuccess(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, orgId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingOrgId(orgId);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/parse-doc", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.names.length > 0) {
        bulkGenerateOrgUsers(orgId, bulkRole, data.names);
        setOrgUsers(getStoredOrgUsers());
        alert(`Successfully generated ${data.names.length} ${bulkRole} accounts!`);
      } else {
        alert(data.error || "No names found in the document.");
      }
    } catch (err) {
      alert("Failed to process document.");
      console.error(err);
    } finally {
      setUploadingOrgId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Access Denied screen for non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-3xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black mb-2">Access Denied</h1>
          <p className="text-sm text-slate-400 mb-6">
            This endpoint is strictly isolated and reserved for the Main Super Administrator.
          </p>
          <button 
            onClick={() => router.push("/login")}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
          >
            Go to Admin Login
          </button>
        </div>
      </div>
    );
  }

  const originUrl = typeof window !== "undefined" ? window.location.origin : "";
  const fullSecretUrl = `${originUrl}${ADMIN_PORTAL_ROUTE}`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060814] pb-24 text-slate-900 dark:text-slate-100">
      
      {/* Top Secret Vault Header */}
      <div className="bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/10 px-6 py-5 sticky top-0 z-30 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Master Super Admin Vault</h1>
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/20">
                Encrypted & Isolated
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Supreme Authority & Platform Control</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => logout()} 
            className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        
        {/* ── MASTER ADMIN CREDENTIALS & SECRET ENDPOINT CARD ── */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 relative overflow-hidden"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Key className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-black tracking-tight">Your Master Admin Access Keys</h2>
              </div>
              <p className="text-xs sm:text-sm text-indigo-200/80">
                Keep these credentials safe. Only you have full root authority to manage all organizations and accounts.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/20 text-indigo-300 font-mono px-3 py-1.5 rounded-xl border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Vault Key: {ADMIN_PORTAL_SECRET_SLUG}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
            
            {/* Usercode Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">Admin Usercode / Username</p>
                <p className="font-mono text-base font-black text-white">{masterCreds.username}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => copyToClipboard(masterCreds.username, "master_user")}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition-colors"
                >
                  {copiedId === "master_user" ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Usercode</>
                  )}
                </button>
              </div>
            </div>

            {/* Password Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">Master Password</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-base font-black text-white">
                    {showMasterPass ? masterCreds.password : "••••••••••••••••"}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowMasterPass(!showMasterPass)}
                    className="text-indigo-300 hover:text-white transition-colors p-1"
                  >
                    {showMasterPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-center">
                <button
                  onClick={() => setIsEditingPassword(!isEditingPassword)}
                  className="text-xs font-bold text-purple-300 hover:text-white transition-colors"
                >
                  {isEditingPassword ? "Cancel" : "Change Pass"}
                </button>
                <button
                  onClick={() => copyToClipboard(masterCreds.password, "master_pass")}
                  className="flex items-center gap-1.5 text-xs font-bold text-indigo-300 hover:text-white transition-colors"
                >
                  {copiedId === "master_pass" ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Pass</>
                  )}
                </button>
              </div>
            </div>

            {/* Unique Secret URL Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-300 mb-1">Unique Secret Portal URL</p>
                <p className="font-mono text-xs font-bold text-white break-all">{fullSecretUrl}</p>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => copyToClipboard(fullSecretUrl, "master_url")}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition-colors"
                >
                  {copiedId === "master_url" ? (
                    <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied URL!</>
                  ) : (
                    <><Copy className="w-3.5 h-3.5" /> Copy Secret Link</>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Change Password Inline Form */}
          <AnimatePresence>
            {isEditingPassword && (
              <motion.form 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSaveMasterPassword} 
                className="mt-6 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Enter new master password"
                  value={newMasterPassword}
                  onChange={(e) => setNewMasterPassword(e.target.value)}
                  className="w-full sm:flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md"
                >
                  Save New Password
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {passSaveSuccess && (
            <p className="text-xs font-bold text-emerald-400 mt-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Master password successfully updated!
            </p>
          )}
        </motion.div>

        {/* ── STATS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgs.length}</p>
              <p className="text-sm font-bold text-slate-500">Registered Organizations</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgUsers.filter(u => u.role === "teacher").length}</p>
              <p className="text-sm font-bold text-slate-500">Active Teachers</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgUsers.filter(u => u.role === "student").length}</p>
              <p className="text-sm font-bold text-slate-500">Enrolled Students</p>
            </div>
          </div>
        </div>

        {/* ── CREATE NEW ORGANIZATION ── */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            Create New School / Organization
          </h2>
          <form onSubmit={handleCreateOrg} className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              placeholder="E.g. Delhi Public School or Harvard Academy"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-colors shadow-sm">
              Create Organization
            </button>
          </form>
        </div>

        {/* ── ORGANIZATIONS LIST & CREDENTIAL GENERATORS ── */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-indigo-500" />
              Organizations & Account Vaults
            </h2>
            <span className="text-xs font-bold text-slate-500">{orgs.length} total</span>
          </div>

          {orgs.length === 0 ? (
            <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl p-12 text-center">
              <Building className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">No organizations created yet</h3>
              <p className="text-xs text-slate-500 mt-1">Use the form above to add your first school or institution.</p>
            </div>
          ) : (
            orgs.map(org => {
              const users = orgUsers.filter(u => u.orgId === org.id);
              return (
                <motion.div 
                  key={org.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm"
                >
                  
                  {/* Org Header */}
                  <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-base">
                      <Building className="w-5 h-5 text-indigo-500" />
                      {org.name}
                    </h3>
                    <div className="flex gap-2 items-center flex-wrap">
                      <button onClick={() => handleCreateTeacher(org.id)} className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors shadow-sm">
                        + Teacher
                      </button>
                      <button onClick={() => handleCreateStudent(org.id)} className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors shadow-sm">
                        + Student
                      </button>
                      <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-1" />
                      <button onClick={() => handleDeleteOrg(org.id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete Organization">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bulk Import Zone */}
                  <div className="px-6 py-4 bg-indigo-50/50 dark:bg-indigo-500/5 border-b border-indigo-100 dark:border-indigo-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#0B0F19] border border-indigo-100 dark:border-indigo-500/20 flex items-center justify-center shadow-sm">
                        <UploadCloud className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Bulk Account Generator</p>
                        <p className="text-xs text-slate-500">Upload a PDF, DOCX, CSV, or TXT list of names.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <select 
                        value={bulkRole} 
                        onChange={(e) => setBulkRole(e.target.value as "student" | "teacher")}
                        className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                      >
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                      </select>
                      
                      <input 
                        type="file" 
                        accept=".pdf,.docx,.csv,.txt"
                        className="hidden" 
                        id={`file-upload-${org.id}`}
                        onChange={(e) => handleFileUpload(e, org.id)}
                        ref={fileInputRef}
                      />
                      <label 
                        htmlFor={`file-upload-${org.id}`}
                        className="cursor-pointer text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-2"
                      >
                        {uploadingOrgId === org.id ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Parsing...</>
                        ) : (
                          "Upload Document"
                        )}
                      </label>
                    </div>
                  </div>
                  
                  {/* Users Table */}
                  <div className="p-6">
                    {users.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-4">No users generated yet for this organization.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5">
                              <th className="pb-3 font-semibold w-1/4">Role</th>
                              <th className="pb-3 font-semibold w-1/4">Name</th>
                              <th className="pb-3 font-semibold w-1/4">Username</th>
                              <th className="pb-3 font-semibold w-1/4">Password</th>
                            </tr>
                          </thead>
                          <tbody>
                            {users.map(u => (
                              <tr key={u.id} className="border-b border-slate-50 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                                <td className="py-3">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                    u.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                                  }`}>
                                    {u.role}
                                  </span>
                                </td>
                                <td className="py-3 text-slate-700 dark:text-slate-300 font-medium">{u.name}</td>
                                <td className="py-3 text-slate-900 dark:text-white font-bold">{u.username}</td>
                                <td className="py-3">
                                  <div className="flex items-center gap-3">
                                    <span className="font-mono bg-slate-100 dark:bg-white/10 px-2 py-1 rounded text-slate-700 dark:text-slate-300">
                                      {u.password}
                                    </span>
                                    <button onClick={() => copyToClipboard(`Username: ${u.username} | Password: ${u.password}`, u.id)} className="text-slate-400 hover:text-indigo-500 transition-colors">
                                      {copiedId === u.id ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
