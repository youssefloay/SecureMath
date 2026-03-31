'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/components/providers/AuthProvider';
import { ChatSystem } from './ChatSystem';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, User, ChevronRight } from 'lucide-react';

interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  updatedAt: number;
  videoId?: string;
}

export function TeacherChatManager() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(chatDocs);
    });

    return () => unsubscribe();
  }, [user]);

  const openChat = (id: string) => {
    setSelectedChatId(id);
    setIsChatOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-foreground">Inbox</h2>
           <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest italic leading-none">Student inquiries & support</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {chats.length === 0 && (
          <div className="app-card py-32 text-center opacity-20 border-dashed border-2">
             <MessageSquare className="h-12 w-12 mx-auto mb-4" />
             <p className="text-[10px] font-black uppercase tracking-widest">No active conversations</p>
          </div>
        )}
        
        {chats.map((chat) => (
          <div 
            key={chat.id}
            onClick={() => openChat(chat.id)}
            className="app-card p-6 bg-white dark:bg-card border-none hover:shadow-2xl hover:scale-[1.01] cursor-pointer transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/5">
                 <User className="h-6 w-6" />
              </div>
              <div>
                 <div className="flex items-center gap-3 mb-1">
                    <h4 className="font-black text-foreground">Student #{chat.participants.find(p => p !== user?.uid)?.substring(0, 5)}</h4>
                    <span className="text-[8px] font-black uppercase tracking-widest bg-muted px-2 py-0.5 rounded-full text-foreground/40">Active Session</span>
                 </div>
                 <p className="text-sm text-foreground/60 line-clamp-1 font-medium bg-muted/30 px-3 py-1 rounded-lg">
                    {chat.lastMessage || "Empty conversation..."}
                 </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-right hidden md:block">
                  <div className="flex items-center justify-end gap-2 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                     <Clock className="h-3 w-3" />
                     {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
               </div>
               <ChevronRight className="h-5 w-5 text-foreground/10 group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>

      {selectedChatId && (
        <ChatSystem 
          chatId={selectedChatId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
}
