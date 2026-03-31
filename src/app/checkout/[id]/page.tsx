'use client';

import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/clientApp';
import { VideoDoc, OrderDoc } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, CheckCircle2, ShieldCheck, ArrowLeft, CreditCard, Sparkles, Copy, Laptop, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const [video, setVideo] = useState<VideoDoc | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentCode, setPaymentCode] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Generate unique payment OTP on load
    setPaymentCode(Math.random().toString(36).substring(2, 8).toUpperCase());

    const fetchVideo = async () => {
      try {
        const vidDoc = await getDoc(doc(db, 'videos', unwrappedParams.id));
        if (vidDoc.exists()) {
          setVideo({ id: vidDoc.id, ...vidDoc.data() } as VideoDoc);
        } else {
          router.push('/');
        }
      } catch (err) {
        console.error("Error fetching video", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [unwrappedParams.id, router]);

  const handleCheckout = async () => {
    if (!user || !video || !file) return;
    setSubmitting(true);

    try {
      const newOrderRef = doc(collection(db, 'orders'));
      const orderId = newOrderRef.id;

      const storageRef = ref(storage, `proofs/${user.uid}/${orderId}.jpg`);
      await uploadBytes(storageRef, file);
      const screenshotUrl = await getDownloadURL(storageRef);

      const newOrder: OrderDoc = {
        id: orderId,
        userId: user.uid,
        teacherId: video.teacherId,
        videoId: video.id,
        status: 'PENDING',
        paymentCode,
        screenshotUrl,
        activatedAt: null,
        viewCount: 0,
        price: video.price,
        createdAt: Date.now(),
      };

      await setDoc(newOrderRef, newOrder);
      setSuccess(true);
      toast.success("Payment proof submitted for verification!");
    } catch (err) {
      console.error(err);
      toast.error('Error submitting payment proof.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-[#fafafa]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg app-card p-12 text-center shadow-2xl shadow-green-500/5 border-green-500/20"
        >
          <div className="h-20 w-20 rounded-[32px] bg-green-500/10 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-500/10">
             <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-4">Verification Pending</h2>
          <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px] mb-8">Proof successfully uploaded</p>
          <p className="text-foreground/50 font-medium mb-10 leading-relaxed">
            Our team will verify your payment notes match the code <strong>{paymentCode}</strong>. 
            Once approved, your catalog will unlock instantly.
          </p>
          <Button 
            className="w-full h-16 bg-primary text-white rounded-3xl text-xl font-black shadow-xl shadow-primary/20" 
            onClick={() => router.push('/')}
          >
            Return to Catalog
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-24 px-8">
      <div className="mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Left Side: Course Info & Payment Details */}
        <div className="space-y-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Button 
              variant="ghost" 
              onClick={() => router.back()} 
              className="text-foreground/40 hover:text-primary font-bold mb-6 flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
            <h1 className="text-title text-4xl mb-4">Secure Checkout</h1>
            <p className="text-foreground/40 font-bold uppercase tracking-widest text-[10px]">Verify and unlock access</p>
          </motion.div>

          <div className="app-card border-none bg-white p-8 space-y-6 shadow-xl shadow-black/[0.02]">
             <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-2xl font-black">
                   <ShieldCheck className="h-8 w-8" />
                </div>
                <div>
                   <h3 className="font-black text-foreground">{video?.title}</h3>
                   <span className="text-[10px] font-black uppercase text-foreground/30 tracking-widest">{video?.subject} / {video?.grade}</span>
                </div>
             </div>
             
             <div className="h-px bg-black/[0.05]" />
             
             <div className="flex items-center justify-between">
                <span className="text-foreground/40 font-bold text-sm">Course Total</span>
                <span className="text-3xl font-black text-foreground">EGP {video?.price}</span>
             </div>
          </div>

          <div className="bg-[#ff9c5e]/10 rounded-[32px] p-8 border border-[#ff9c5e]/20">
             <div className="flex items-center gap-3 text-[#ff9c5e] font-black mb-4">
                <Smartphone className="h-5 w-5" />
                <span>Mobile Wallet Transfer</span>
             </div>
             <p className="text-sm font-medium text-foreground/60 leading-relaxed mb-6">
                Transfer exactly <strong className="text-foreground">EGP {video?.price}</strong> to the school wallet. 
                Crucial: Write this code in the <strong>Notes/Message</strong> field:
             </p>
             <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-[#ff9c5e]/20">
                <span className="text-2xl font-black text-foreground flex-1 tracking-widest">{paymentCode}</span>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(paymentCode)}>
                   <Copy className="h-5 w-5 text-[#ff9c5e]" />
                </Button>
             </div>
          </div>
        </div>

        {/* Right Side: Upload Proof */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="app-card p-12 bg-white flex flex-col justify-center border-none shadow-[0_40px_100px_rgba(0,0,0,0.04)]"
        >
          <div className="mb-10 text-center">
             <h2 className="text-2xl font-black text-foreground mb-2">Upload Transfer Receipt</h2>
             <p className="text-xs font-bold text-foreground/30 uppercase tracking-widest">Verify payment proof for approval</p>
          </div>

          <div className="space-y-8">
            <div className={`relative h-64 rounded-[40px] border-2 border-dashed transition-all cursor-pointer group flex flex-col items-center justify-center ${
              file ? 'border-primary bg-primary/[0.02]' : 'border-black/[0.05] hover:border-primary/40 hover:bg-muted/30 font-medium'
            }`}>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <div className="text-center">
                <div className={`h-20 w-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl transition-all ${
                  file ? 'bg-primary text-white scale-110' : 'bg-muted text-foreground/20'
                }`}>
                  <UploadCloud className="h-10 w-10" />
                </div>
                {file ? (
                  <p className="text-primary font-black text-sm">{file.name}</p>
                ) : (
                  <>
                    <p className="text-foreground/40 font-bold text-sm">Drag screenshot here</p>
                    <p className="text-[10px] font-black uppercase text-foreground/20 mt-1">JPEG, PNG, HEIC (MAX 5MB)</p>
                  </>
                )}
              </div>
            </div>

            <Button 
              className="w-full h-20 bg-primary hover:bg-primary/90 text-white rounded-[32px] text-xl font-black shadow-2xl shadow-primary/20 group transition-all"
              onClick={handleCheckout}
              disabled={!file || submitting}
            >
              {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <span className="flex items-center gap-3">
                  Confirm Payment
                  <Sparkles className="h-6 w-6 text-white/50 group-hover:rotate-12 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
