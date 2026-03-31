'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, UserPlus, Mail, Shield, User } from 'lucide-react';
import { createTeacherAccount } from '@/app/actions/admin';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export function TeacherManagement() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1">Staff Directory</h2>
          <p className="text-xs text-foreground/30 font-bold uppercase tracking-widest leading-none">Manage educators and portal access</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`rounded-2xl transition-all ${showForm ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
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
            className="app-card overflow-hidden p-8 border-primary/10 bg-primary/[0.01]"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                  <Input 
                    required
                    className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
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
                    className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
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
                    className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
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
                  className="bg-primary text-white px-10 h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register Staff Account'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-card p-12 text-center opacity-40">
         <div className="h-16 w-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-foreground/30" />
         </div>
         <h4 className="text-sm font-black uppercase tracking-widest italic">Staff List Integration Pending...</h4>
      </div>
    </div>
  );
}
