'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, LogOut, BookOpen, Database, User as UserIcon, Search, Menu, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

export function Navbar() {
  const { user, userData, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const router = useRouter();

  // Handle hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-6 pt-6">
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex h-16 w-full max-w-6xl items-center justify-between rounded-[24px] bg-white/80 dark:bg-card/80 backdrop-blur-xl border border-white/20 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6"
      >
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 text-xl font-black">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/20">
              Σ
            </div>
            <span className="tracking-tight text-foreground hidden sm:block">SecureMath</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-bold text-foreground/60 dark:text-foreground/40 hover:text-primary transition-colors">
              Courses
            </Link>
            <Link href="/" className="text-sm font-bold text-foreground/60 dark:text-foreground/40 hover:text-primary transition-colors">
              Planning
            </Link>
            <Link href="/" className="text-sm font-bold text-foreground/60 dark:text-foreground/40 hover:text-primary transition-colors">
              Mentors
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-muted/50 rounded-full px-4 py-2 border border-black/[0.03] dark:border-white/[0.03]">
             <Search className="h-4 w-4 text-foreground/30 mr-2" />
             <input 
               type="text" 
               placeholder="Search courses..." 
               className="bg-transparent border-none outline-none text-xs font-bold text-foreground placeholder:text-foreground/20 w-32 focus:w-48 transition-all"
             />
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="h-10 w-10 rounded-2xl text-foreground/40 hover:bg-primary/5 transition-colors"
          >
            {mounted && (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
          </Button>

          <div className="h-8 w-px bg-black/[0.1] dark:bg-white/[0.1] mx-2 hidden sm:block" />

          <AnimatePresence mode="wait">
            {user ? (
              <div className="flex items-center gap-2">
                {(userData?.role === 'ADMIN' || userData?.role === 'TEACHER') && (
                  <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl text-primary hover:bg-primary/5">
                      <LayoutDashboard className="h-5 w-5" />
                    </Button>
                  </Link>
                )}
                
                <div className="flex items-center gap-2 p-1 pl-3 rounded-full bg-muted/30 border border-black/[0.02]">
                  <span className="text-[10px] font-black text-foreground/40 uppercase tracking-widest hidden lg:block mr-2">{userData?.role}</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-black border-2 border-white shadow-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={logout}
                    className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-500 text-foreground/30 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-10 font-bold shadow-lg shadow-primary/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </div>
  );
}
