'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, Clock, ShieldCheck, ArrowLeft, Play, Sparkles, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

function CountdownTimer({ initialRemainingMs }: { initialRemainingMs: number }) {
  const [timeLeft, setTimeLeft] = useState(initialRemainingMs);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1000));
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  if (timeLeft <= 0) {
    return <span className="text-red-500 font-black">Access Expired</span>;
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return (
    <span className="font-mono text-xl text-primary font-black">
      {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { user, loading: authLoading } = useAuth();
  const [otp, setOtp] = useState<string | null>(null);
  const [playbackInfo, setPlaybackInfo] = useState<string | null>(null);
  const [remainingTimeMs, setRemainingTimeMs] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchSecureVideo = async () => {
      try {
        const token = await user.getIdToken(true);
        const res = await fetch('/api/vdocipher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId: unwrappedParams.id })
        });

        const data = await res.json();
        
        if (!res.ok) {
          setErrorMsg(data.error || 'Access Denied');
        } else {
          setOtp(data.otp);
          setPlaybackInfo(data.playbackInfo);
          setRemainingTimeMs(data.remainingTimeMs);
        }
      } catch (err) {
        console.error("VdoCipher route error:", err);
        setErrorMsg('Failed to connect to secure video server.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecureVideo();
  }, [user, authLoading, unwrappedParams.id, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa] p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg app-card p-12 text-center border-red-500/20 bg-red-500/[0.01]"
        >
          <div className="h-20 w-20 rounded-[32px] bg-red-500/10 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/10">
             <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Security Lockdown</h2>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mb-8">Unauthorized playback attempt</p>
          <p className="text-foreground/50 font-medium mb-10 leading-relaxed">
            {errorMsg}
          </p>
          <Button 
            className="w-full h-16 bg-primary text-white rounded-3xl text-xl font-black shadow-xl shadow-primary/20" 
            onClick={() => router.push('/')}
          >
            Return to Learning
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-24 px-8">
      <div className="mx-auto max-w-6xl">
         
         <div className="flex items-center justify-between mb-10">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-foreground/40 font-bold flex items-center gap-2 hover:text-primary transition-all"
            >
               <ArrowLeft className="h-4 w-4" /> Back to Catalog
            </Button>
            
            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-[24px] border border-black/[0.03] shadow-sm">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Secure Session</span>
               <div className="h-6 w-px bg-black/[0.05]" />
               <div className="flex items-center gap-3">
                 <Clock className="h-4 w-4 text-[#ff9c5e]" />
                 <CountdownTimer initialRemainingMs={remainingTimeMs || 0} />
               </div>
            </div>
         </div>

         {/* Video Player HUD */}
         <div className="app-card border-none bg-white p-2 shadow-2xl shadow-black/[0.05] overflow-hidden">
            <div className="relative aspect-video rounded-[28px] bg-black group overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
               
               {/* Player Content */}
               <div className="text-center z-10 px-12">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="h-20 w-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform cursor-pointer"
                  >
                     <Play className="h-8 w-8 text-white fill-white" />
                  </motion.div>
                  <p className="text-white/60 font-black tracking-widest uppercase text-xs mb-2">DRM Secure Playback Layer</p>
                  <p className="text-white/20 font-mono text-[10px] italic">
                    ID: {playbackInfo?.substring(0, 32)}...
                  </p>
               </div>

               {/* Watermark */}
               <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-20 pointer-events-none select-none">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    {user?.email}
                  </div>
                  <div className="text-[8px] font-black text-white/50 tracking-tighter uppercase mt-1">
                    Secure_Node_V3.1
                  </div>
               </div>
               
               {/* 
                 // Production Iframe Implementation
                 <iframe 
                   src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
                   style={{ border: 0, height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
                   allow="encrypted-media"
                   allowFullScreen
                 />
               */}
            </div>

            <div className="p-8 flex items-center justify-between bg-white">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-black/[0.03] flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-foreground/20" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-black text-foreground">Secure Learning Session</h1>
                    <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Order Reference: {unwrappedParams.id}</p>
                  </div>
               </div>

               <div className="flex gap-2">
                  <Button variant="outline" className="rounded-2xl h-12 px-6 font-bold flex items-center gap-2 border-black/[0.05] hover:bg-black/5">
                     Take Notes
                  </Button>
                  <Button className="rounded-2xl h-12 px-8 font-black bg-primary text-white shadow-lg shadow-primary/10">
                     Next Lesson
                  </Button>
               </div>
            </div>
         </div>

         <div className="mt-12 text-center opacity-10">
            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
               Anti_Piracy_Guardian_v4.5
            </div>
         </div>
      </div>
    </div>
  );
}
