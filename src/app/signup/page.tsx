'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useRouter } from 'next/navigation';
import { setSessionCookie } from '@/app/actions/auth';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, Sparkles, ShieldCheck, ArrowRight, User, Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { UserDoc } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const sessionId = uuidv4();
      
      const userDoc: UserDoc = {
        uid: user.uid,
        email: user.email!,
        name: name,
        role: 'STUDENT',
        currentSessionId: sessionId,
        createdAt: Date.now(),
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);
      await setSessionCookie(sessionId);
      router.push('/');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already exists.');
      } else {
        setError('Failed to create account.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white rounded-[48px] shadow-[0_20px_100px_rgba(0,0,0,0.06)] border border-black/[0.03] overflow-hidden"
      >
        <div className="flex flex-col p-12 lg:p-16">
          <div className="mb-10 text-center lg:text-left">
            <div className="h-16 w-16 rounded-[24px] bg-[#9596ff]/10 flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-lg shadow-[#9596ff]/5">
               <div className="h-10 w-10 rounded-2xl bg-[#9596ff] text-white flex items-center justify-center">
                  <UserPlus className="h-5 w-5" />
               </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
              Create student <br/>
              <span className="text-[#9596ff] underline decoration-[#9596ff]/10 decoration-8 underline-offset-4">account</span>
            </h2>
            <p className="text-foreground/30 font-bold uppercase tracking-widest text-xs">Join our secure math community</p>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-foreground/40 font-black text-[10px] uppercase tracking-widest ml-1">Full Name</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-[#9596ff] transition-colors">
                     <User className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    required
                    className="bg-muted/30 border-black/[0.05] h-16 rounded-3xl px-16 focus:bg-white transition-all text-foreground font-bold shadow-inner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                  />
                </div>
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label className="text-foreground/40 font-black text-[10px] uppercase tracking-widest ml-1">Email address</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-[#9596ff] transition-colors">
                     <Mail className="h-5 w-5" />
                  </div>
                  <Input
                    type="email"
                    required
                    className="bg-muted/30 border-black/[0.05] h-16 rounded-3xl px-16 focus:bg-white transition-all text-foreground font-bold shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-1">
                <Label className="text-foreground/40 font-black text-[10px] uppercase tracking-widest ml-1">Password</Label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-[#9596ff] transition-colors">
                     <Lock className="h-5 w-5" />
                  </div>
                  <Input
                    type="password"
                    required
                    className="bg-muted/30 border-black/[0.05] h-16 rounded-3xl px-16 focus:bg-white transition-all text-foreground font-bold shadow-inner"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm font-black text-red-500 bg-red-50 p-4 rounded-3xl text-center border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              type="submit" 
              className="w-full h-16 bg-[#9596ff] hover:bg-[#9596ff]/90 text-white rounded-3xl text-xl font-black shadow-2xl shadow-[#9596ff]/20 group transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-3">
                  Account join
                  <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1" />
                </span>
              )}
            </Button>

            <div className="pt-6 text-center">
              <p className="text-foreground/40 text-sm font-bold">
                Member already?{' '}
                <Link href="/login" className="text-[#9596ff] font-black hover:underline transition-all">
                   Let's started
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
