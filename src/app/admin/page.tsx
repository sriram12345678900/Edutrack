"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Shield, Building, Users, KeyRound, PlusCircle, LayoutDashboard, Copy, CheckCircle2, Trash2, UploadCloud, FileText, Loader2 } from "lucide-react";
import { getStoredOrganizations, getStoredOrgUsers, createOrganization, generateOrgUser, deleteOrganization, bulkGenerateOrgUsers, Organization, OrgUser } from "@/lib/admin";
import { motion } from "framer-motion";

export default function AdminPortal() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [orgUsers, setOrgUsers] = useState<OrgUser[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [copiedId, setCopiedId] = useState("");
  
  // Bulk upload states
  const [uploadingOrgId, setUploadingOrgId] = useState<string | null>(null);
  const [bulkRole, setBulkRole] = useState<"student" | "teacher">("student");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    setOrgs(getStoredOrganizations());
    setOrgUsers(getStoredOrgUsers());
  }, []);

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName) return;
    const org = createOrganization(newOrgName);
    generateOrgUser(org.id, "admin", "School Admin");
    setOrgs(getStoredOrganizations());
    setOrgUsers(getStoredOrgUsers());
    setNewOrgName("");
  };

  const handleDeleteOrg = (orgId: string) => {
    if (confirm("Are you sure you want to delete this organization? All generated users will be permanently lost.")) {
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

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060814] pb-24">
      {/* Header */}
      <div className="bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-white/10 px-6 py-5 sticky top-0 z-30 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Super Admin Portal</h1>
            <p className="text-xs text-slate-500 font-medium">Platform Management & Credentials</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgs.length}</p>
              <p className="text-sm font-bold text-slate-500">Organizations</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgUsers.filter(u => u.role === "teacher").length}</p>
              <p className="text-sm font-bold text-slate-500">Teachers</p>
            </div>
          </div>
          <div className="bg-white dark:bg-[#0B0F19] p-6 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center gap-5 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-7 h-7" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{orgUsers.filter(u => u.role === "student").length}</p>
              <p className="text-sm font-bold text-slate-500">Students</p>
            </div>
          </div>
        </div>

        {/* Global Broadcast */}
        <div className="bg-indigo-600 rounded-3xl p-6 mb-10 shadow-lg text-white flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-indigo-200" />
              Global Notice Broadcast
            </h2>
            <p className="text-sm text-indigo-200">Push an alert or document to all organizations (Coming soon via Firebase)</p>
          </div>
          <button className="bg-white text-indigo-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors shadow-sm">
            Broadcast Notice
          </button>
        </div>

        {/* Create Organization */}
        <div className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl p-6 mb-10 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
            <PlusCircle className="w-5 h-5 text-indigo-500" />
            Create New Organization
          </h2>
          <form onSubmit={handleCreateOrg} className="flex gap-4">
            <input 
              type="text" 
              placeholder="E.g. Delhi Public School"
              value={newOrgName}
              onChange={(e) => setNewOrgName(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl text-sm transition-colors shadow-sm">
              Create Org
            </button>
          </form>
        </div>

        {/* List Organizations & Credentials */}
        <div className="space-y-6">
          {orgs.map(org => {
            const users = orgUsers.filter(u => u.orgId === org.id);
            return (
              <motion.div key={org.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-sm">
                
                {/* Org Header */}
                <div className="bg-slate-50 dark:bg-white/5 px-6 py-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-slate-400" />
                    {org.name}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => handleCreateTeacher(org.id)} className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors shadow-sm">
                      + Teacher
                    </button>
                    <button onClick={() => handleCreateStudent(org.id)} className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 transition-colors shadow-sm">
                      + Student
                    </button>
                    <div className="w-px h-5 bg-slate-200 dark:bg-white/10 mx-2" />
                    <button onClick={() => handleDeleteOrg(org.id)} className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Delete Organization">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bulk Import Zone */}
                <div className="px-6 py-4 bg-indigo-50/50 dark:bg-indigo-500/5 border-b border-indigo-100 dark:border-indigo-500/10 flex items-center justify-between">
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
                      className="text-xs font-bold bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
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
                      className="cursor-pointer text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-2"
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
                    <p className="text-sm text-slate-500 text-center py-4">No users generated yet.</p>
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
          })}
        </div>

      </div>
    </div>
  );
}
