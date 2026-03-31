'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { useRouter } from 'next/navigation';
import { setSessionCookie } from '@/app/actions/auth';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ShieldCheck, ArrowRight, Sparkles, User, Lock } from 'lucide-react';
import { UserDoc } from '@/types';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const newSessionId = uuidv4();
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        await setDoc(userRef, { currentSessionId: newSessionId }, { merge: true });
        const userData = userDoc.data() as UserDoc;
        await setSessionCookie(newSessionId);

        if (userData.role === 'ADMIN' || userData.role === 'TEACHER') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setError('User profile not found. Please contact support.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-[48px] shadow-[0_20px_100px_rgba(0,0,0,0.06)] border border-black/[0.03] overflow-hidden"
      >
        <div className="flex flex-col p-12 lg:p-16">
          <div className="mb-10 text-center lg:text-left">
            <div className="h-16 w-16 rounded-[24px] bg-primary/10 flex items-center justify-center mb-8 mx-auto lg:mx-0 shadow-lg shadow-primary/5">
               <div className="h-10 w-10 rounded-2xl bg-primary text-white flex items-center justify-center font-black">Σ</div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-foreground mb-4 leading-tight tracking-tight">
              Let's get <br/>
              <span className="text-primary underline decoration-primary/10 decoration-8 underline-offset-4">started</span>
            </h2>
            <p className="text-foreground/30 font-bold uppercase tracking-widest text-xs">Enter your secure credentials</p>
          </div>

          <form className="space-y-8" onSubmit={handleLogin}>
            <div className="space-y-2">
              <Label className="text-foreground/40 font-black text-[10px] uppercase tracking-widest ml-1">Email address</Label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors">
                   <User className="h-5 w-5" />
                </div>
                <Input
                  type="email"
                  required
                  className="bg-muted/30 border-black/[0.05] h-16 rounded-3xl px-16 focus:bg-white transition-all text-foreground font-bold shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@university.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground/40 font-black text-[10px] uppercase tracking-widest ml-1">Password</Label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-foreground/20 group-focus-within:text-primary transition-colors">
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
              className="w-full h-16 bg-primary hover:bg-primary/90 text-white rounded-3xl text-xl font-black shadow-2xl shadow-primary/20 group transition-all"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-3">
                  Log In
                  <ArrowRight className="h-5 w-5 transition-all group-hover:translate-x-1" />
                </span>
              )}
            </Button>

            <div className="pt-6 text-center">
              <p className="text-foreground/40 text-sm font-bold">
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary font-black hover:underline transition-all">
                  Create one now
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
