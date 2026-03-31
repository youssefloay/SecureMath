'use client';

import { useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Loader2, Database, ShieldCheck, UserPlus, Zap } from 'lucide-react';
import { seedVideos, seedTestUsers, promoteUserToAdmin } from '@/app/actions/seed';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function SeedPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (name: string, action: () => Promise<any>) => {
    setLoading(name);
    try {
      const result = await action();
      if (result.success) toast.success(result.message);
      else toast.error(result.error);
    } catch (err) {
      toast.error('Unexpected error occurred.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl app-card p-12 lg:p-16 text-center shadow-[0_40px_100px_rgba(0,0,0,0.06)]"
      >
        <div className="mb-12">
          <div className="h-20 w-20 rounded-[28px] bg-primary/10 flex items-center justify-center mb-8 mx-auto shadow-lg shadow-primary/5">
             <Database className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tighter">System Seeder</h1>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Development & Testing Control Center</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
           {/* Catalog Seed */}
           <div className="flex flex-col gap-4">
              <Button 
                onClick={() => handleAction('catalog', seedVideos)} 
                disabled={!!loading}
                className="h-20 bg-[#ff9c5e] hover:bg-[#ff9c5e]/90 text-white rounded-3xl font-black text-lg shadow-xl shadow-[#ff9c5e]/10 group"
              >
                {loading === 'catalog' ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <span className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6" /> Initialize Catalog
                  </span>
                )}
              </Button>
              <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest group-hover:text-foreground/40 transition-colors">Populate courses & tags</p>
           </div>

           {/* Test User Seed */}
           <div className="flex flex-col gap-4">
              <Button 
                onClick={() => handleAction('users', seedTestUsers)} 
                disabled={!!loading}
                className="h-20 bg-[#9596ff] hover:bg-[#9596ff]/90 text-white rounded-3xl font-black text-lg shadow-xl shadow-[#9596ff]/10 group"
              >
                {loading === 'users' ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                  <span className="flex items-center gap-3">
                    <UserPlus className="h-6 w-6" /> Test Accounts
                  </span>
                )}
              </Button>
              <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Create admin/student logins</p>
           </div>
        </div>

        {/* Backdoor Promotion */}
        <div className="border-t border-black/[0.05] pt-12">
          <div className="bg-[#ffd36a]/10 rounded-[32px] p-8 border border-[#ffd36a]/20">
             <h3 className="text-lg font-black text-foreground mb-2 flex items-center justify-center gap-2">
               <Zap className="h-5 w-5 text-[#ffd36a] fill-[#ffd36a]" />
               Logged in as: <span className="text-[#ff9c5e]">{user?.email || 'Guest'}</span>
             </h3>
             <p className="text-xs font-bold text-foreground/40 mb-8 max-w-sm mx-auto">
               Instantly promote your current session to <strong>ADMIN</strong> level to test the management dashboard.
             </p>

             <Button 
               onClick={() => handleAction('promote', () => promoteUserToAdmin(user?.uid || ''))}
               disabled={!user || !!loading}
               className="w-full h-14 bg-white border-2 border-[#ffd36a] text-[#ffd36a] hover:bg-[#ffd36a] hover:text-white rounded-2xl font-black transition-all"
             >
               {loading === 'promote' ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Promote Me to Admin'}
             </Button>
          </div>
        </div>

        <div className="mt-12 text-[10px] font-black text-foreground/10 uppercase tracking-[0.2em]">
           Dev_Environment_Tools_v2.0
        </div>
      </motion.div>
    </div>
  );
}
