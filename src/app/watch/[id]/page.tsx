'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  Loader2, AlertTriangle, Clock, ShieldCheck, ArrowLeft, 
  Play, Sparkles, BookOpen, MessageSquare 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

import { getOrder } from '@/app/actions/orders';
import { getVideo } from '@/app/actions/videos';
import { getOrCreateChat } from '@/app/actions/messages';
import { ChatSystem } from '@/components/messaging/ChatSystem';

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
  const [videoData, setVideoData] = useState<any>(null);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
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
        
        const [orderRes, vdoRes] = await Promise.all([
          getOrder(unwrappedParams.id),
          fetch('/api/vdocipher', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ orderId: unwrappedParams.id })
          })
        ]);

        if (!orderRes.success) throw new Error("Order not found or invalid.");
        
        const videoRes = await getVideo(orderRes.data.videoId);
        if (videoRes.success) {
           setVideoData(videoRes.data);
        }

        const data = await vdoRes.json();
        if (!vdoRes.ok) {
          setErrorMsg(data.error || 'Access Denied');
        } else {
          setOtp(data.otp);
          setPlaybackInfo(data.playbackInfo);
          setRemainingTimeMs(data.remainingTimeMs);
        }
      } catch (err: any) {
        console.error("Watch page error:", err);
        setErrorMsg(err.message || 'Failed to connect to secure video server.');
      } finally {
        setLoading(false);
      }
    };

    fetchSecureVideo();
  }, [user, authLoading, unwrappedParams.id, router]);

  const handleAskTeacher = async () => {
    if (!videoData || !user) return;
    
    const result = await getOrCreateChat(user.uid, videoData.teacherId, videoData.id);
    if (result.success) {
      setChatId(result.chatId || null);
      setIsChatOpen(true);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-8">
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
    <div className="min-h-screen bg-background pt-32 pb-24 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
         
         <div className="flex items-center justify-between mb-10">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/')}
              className="text-foreground/40 font-bold flex items-center gap-2 hover:text-primary transition-all"
            >
               <ArrowLeft className="h-4 w-4" /> Back to Catalog
            </Button>
            
            <div className="flex items-center gap-4 bg-white dark:bg-card px-6 py-3 rounded-[24px] border border-black/[0.03] dark:border-white/[0.03] shadow-sm">
               <ShieldCheck className="h-5 w-5 text-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Secure Session</span>
               <div className="h-6 w-px bg-black/[0.05] dark:bg-white/[0.05]" />
               <div className="flex items-center gap-3">
                 <Clock className="h-4 w-4 text-[#ff9c5e]" />
                 <CountdownTimer initialRemainingMs={remainingTimeMs || 0} />
               </div>
            </div>
         </div>

         {/* Video Player HUD */}
         <div className="app-card border-none bg-white dark:bg-card p-2 shadow-2xl shadow-black/[0.05] overflow-hidden">
            <div className="relative aspect-video rounded-[28px] bg-black group overflow-hidden flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
               
               {/* Real VdoCipher Player */}
               {otp && playbackInfo ? (
                 <iframe
                   src={`https://player.vdocipher.com/v2/?otp=${otp}&playbackInfo=${playbackInfo}`}
                   className="w-full h-full border-0 rounded-[28px] z-10"
                   allow="encrypted-media"
                   allowFullScreen
                 />
               ) : (
                 <div className="text-center z-10 px-12">
                    <Loader2 className="h-12 w-12 animate-spin text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 font-black tracking-widest uppercase text-xs">Initializing Secure Stream...</p>
                 </div>
               )}

               {/* Watermark */}
               <div className="absolute bottom-10 right-10 flex flex-col items-end opacity-20 pointer-events-none select-none z-20">
                  <div className="flex items-center gap-2 text-white font-black uppercase text-[10px] tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    {user?.email}
                  </div>
                  <div className="text-[8px] font-black text-white/50 tracking-tighter uppercase mt-1">
                    Secure_Node_V3.1
                  </div>
               </div>
            </div>

            <div className="p-8 flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-card gap-6">
               <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-muted/50 border border-black/[0.03] dark:border-white/[0.03] flex items-center justify-center text-foreground/20">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-black text-foreground">{videoData?.title || "Secure Session"}</h1>
                    <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">Teacher: {videoData?.teacherName || "Loading..."}</p>
                  </div>
               </div>

               <div className="flex gap-2 w-full md:w-auto">
                  <Button 
                    onClick={handleAskTeacher}
                    className="flex-1 md:flex-none rounded-2xl h-12 px-8 font-black bg-accent text-white shadow-lg shadow-accent/10 flex items-center gap-2"
                  >
                     <MessageSquare className="h-4 w-4" /> Ask Teacher
                  </Button>
                  <Button className="flex-1 md:flex-none rounded-2xl h-12 px-8 font-black bg-primary text-white shadow-lg shadow-primary/10">
                     Next Lesson
                  </Button>
               </div>
            </div>
         </div>

         {/* Chat Interface */}
         {chatId && (
            <ChatSystem 
              chatId={chatId} 
              isOpen={isChatOpen} 
              onClose={() => setIsChatOpen(false)} 
            />
         )}

         <div className="mt-12 text-center opacity-10">
            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.4em]">
               Anti_Piracy_Guardian_v4.5
            </div>
         </div>
      </div>
    </div>
  );
}
