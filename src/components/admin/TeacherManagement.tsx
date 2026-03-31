'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, UserPlus, Mail, Shield, User, Trash2, MailCheck } from 'lucide-react';
import { createTeacherAccount } from '@/app/actions/admin';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function TeacherManagement() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', 'in', ['TEACHER', 'ADMIN']));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaff(docs);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await createTeacherAccount(formData);
    if (result.success) {
      toast.success(result.message);
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1">Staff Directory</h2>
          <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest leading-none">Manage educators and portal access</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`h-12 md:h-10 rounded-2xl transition-all px-6 font-black text-[10px] uppercase tracking-widest ${showForm ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
        >
          {showForm ? 'Cancel Operation' : (
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add New Teacher
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="app-card overflow-hidden p-6 md:p-8 border-primary/10 bg-primary/[0.01]"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                  <Input 
                    required
                    className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Dr. Jane Smith"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                  <Input 
                    required
                    type="email"
                    className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="jane@university.edu"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Temporary Password</Label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                  <Input 
                    required
                    type="password"
                    className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="md:col-span-3 flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full md:w-auto bg-primary text-white px-10 h-14 rounded-2xl font-black shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register Staff Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {staff.map((member) => (
           <div key={member.id} className="app-card p-6 bg-white border border-black/[0.03] flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center font-black text-primary border border-black/[0.02]">
                    {member.name?.charAt(0)}
                 </div>
                 <div>
                    <h4 className="font-black text-foreground text-sm leading-none mb-1">{member.name}</h4>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">{member.role}</span>
                       <span className="text-[8px] font-bold text-foreground/30 truncate max-w-[100px]">{member.email}</span>
                    </div>
                 </div>
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-foreground/20 group-hover:text-red-500 rounded-xl transition-colors">
                 <Trash2 className="h-4 w-4" />
              </Button>
           </div>
         ))}
      </div>

      {staff.length === 0 && (
        <div className="app-card p-12 text-center opacity-40">
           <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-foreground/30" />
           </div>
           <h4 className="text-xs font-black uppercase tracking-widest italic">No staff members registered yet</h4>
        </div>
      )}
    </div>
  );
}
