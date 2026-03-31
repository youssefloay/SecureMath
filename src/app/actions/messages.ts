'use server';

import { adminDb } from '@/lib/firebase/adminApp';
import { Timestamp } from 'firebase-admin/firestore';

export async function getOrCreateChat(studentId: string, teacherId: string, videoId?: string) {
  try {
    if (!adminDb) return { success: false, error: "Database not configured." };

    // Search for existing chat between these two for this video (or a general one)
    let chatsQuery = adminDb.collection('chats')
      .where('participants', 'array-contains', studentId);

    const snapshot = await chatsQuery.get();
    let existingChat = snapshot.docs.find(doc => {
      const data = doc.data();
      return data.participants.includes(teacherId) && (videoId ? data.videoId === videoId : true);
    });

    if (existingChat) {
      return { success: true, chatId: existingChat.id };
    }

    // Create new chat
    const newChatRef = adminDb.collection('chats').doc();
    await newChatRef.set({
      participants: [studentId, teacherId],
      videoId: videoId || null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastMessage: ""
    });

    return { success: true, chatId: newChatRef.id };
  } catch (error: any) {
    console.error("Chat creation error:", error);
    return { success: false, error: error.message };
  }
}

export async function sendMessage(chatId: string, senderId: string, text: string) {
  try {
    if (!adminDb) return { success: false, error: "Database not configured." };

    const messageRef = adminDb.collection('chats').doc(chatId).collection('messages').doc();
    await messageRef.set({
      senderId,
      text,
      createdAt: Date.now()
    });

    // Update last message in parent doc
    await adminDb.collection('chats').doc(chatId).update({
      lastMessage: text,
      updatedAt: Date.now()
    });

    return { success: true };
  } catch (error: any) {
    console.error("Send message error:", error);
    return { success: false, error: error.message };
  }
}
