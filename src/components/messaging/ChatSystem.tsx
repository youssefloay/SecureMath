'use client';

import React, { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, MessageSquare, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { sendMessage } from '@/app/actions/messages';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: number;
}

export function ChatSystem({ chatId, isOpen, onClose }: { chatId: string; isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId || !isOpen) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [chatId, isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    setSending(true);
    const text = inputText;
    setInputText('');

    const result = await sendMessage(chatId, user.uid, text);
    if (!result.success) {
      // Revert if failed
      setInputText(text);
    }
    setSending(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
           initial={{ opacity: 0, y: 100, scale: 0.9 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: 100, scale: 0.9 }}
           className="fixed bottom-8 right-8 w-full max-w-[400px] z-[100]"
        >
          <div className="app-card border-none shadow-2xl bg-white dark:bg-card overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-primary p-6 text-white flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-white/20 flex items-center justify-center">
                     <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                     <h3 className="font-black text-sm">Course Support</h3>
                     <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Connected to Teacher</p>
                  </div>
               </div>
               <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-xl">
                  <X className="h-5 w-5" />
               </Button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/30 dark:bg-black/20"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full opacity-20 text-center px-10">
                   <MessageSquare className="h-12 w-12 mb-4" />
                   <p className="text-[10px] font-black uppercase tracking-widest">Start a conversation with your teacher</p>
                </div>
              )}
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${
                    msg.senderId === user?.uid 
                      ? 'bg-primary text-white rounded-tr-none' 
                      : 'bg-white dark:bg-muted text-foreground rounded-tl-none border border-black/[0.03]'
                  }`}>
                    {msg.text}
                    <div className={`text-[8px] mt-1 font-black uppercase opacity-50 ${msg.senderId === user?.uid ? 'text-right' : 'text-left'}`}>
                       {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-card border-t border-black/[0.03] dark:border-white/[0.03] flex items-center gap-2">
               <Input 
                 value={inputText}
                 onChange={(e) => setInputText(e.target.value)}
                 placeholder="Type your message..."
                 className="h-12 rounded-xl bg-muted/50 border-none shadow-inner font-bold text-sm"
               />
               <Button 
                 type="submit" 
                 disabled={sending || !inputText.trim()}
                 size="icon" 
                 className="h-12 w-12 rounded-xl bg-primary text-white shrink-0 shadow-lg shadow-primary/20"
               >
                  {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
               </Button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
