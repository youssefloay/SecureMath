'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/clientApp';
import { UserDoc } from '@/types';
import { clearSessionCookie, getSessionCookie } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  userData: UserDoc | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = async () => {
    await clearSessionCookie();
    await signOut(auth);
    router.push('/login');
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Listen to User document for RBAC and One-Screen policy
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // We use onSnapshot to detect immediately if another session logs in
        const unsubscribeSnapshot = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserDoc;
            setUserData(data);

            // One-Screen Policy Guard
            const currentSessionCookie = await getSessionCookie();
            if (data.currentSessionId && currentSessionCookie && data.currentSessionId !== currentSessionCookie) {
              console.warn("Session hijacked or logged in elsewhere. Logging out from this device.");
              await logout();
            }
          } else {
            setUserData(null);
          }
          setLoading(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
