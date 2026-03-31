'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/components/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import { OrderDoc } from '@/types';
import { updateOrderStatus } from '@/app/actions/orders';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Eye, ShieldCheck, XCircle, Users, Video, ShoppingCart, TrendingUp, Plus } from 'lucide-react';
import { toast } from 'sonner';

// Import our new modules (to be created)
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    // Protect route for ADMIN or TEACHER only
    if (!userData || (userData.role !== 'ADMIN' && userData.role !== 'TEACHER')) {
      router.push('/');
      return;
    }

    let q;
    if (userData.role === 'ADMIN') {
      q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, 'orders'), where('teacherId', '==', user?.uid), orderBy('createdAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OrderDoc));
      setOrders(docs);
      setDataLoading(false);
    }, (error) => {
      console.error("Error fetching dashboard orders:", error);
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData, authLoading, router]);

  const handleUpdateStatus = async (orderId: string, status: 'APPROVED' | 'REJECTED', userId: string) => {
    const mockEmail = "student@example.com"; 
    const result = await updateOrderStatus(orderId, status, mockEmail);
    if (result.success) {
      toast.success(`Order ${status.toLowerCase()} successfully`);
    } else {
      toast.error("Failed to update status.");
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const stats = {
    pending: orders.filter(o => o.status === 'PENDING').length,
    earnings: orders.filter(o => o.status === 'APPROVED').reduce((acc, curr) => acc + (Number(curr.price) || 0), 0),
    students: new Set(orders.map(o => o.userId)).size,
  };

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest mb-4">
              <TrendingUp className="h-4 w-4" />
              Management Dashboard
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tight underline decoration-primary/10 decoration-8 underline-offset-8">
              {userData?.role === 'ADMIN' ? 'Administrator Hub' : 'Teacher Panel'}
            </h1>
          </div>

          <div className="flex gap-4">
            <div className="app-card px-8 py-5 border-none shadow-xl shadow-black/[0.02]">
               <p className="text-[10px] font-black uppercase text-foreground/30 tracking-widest mb-1">Total Students</p>
               <span className="text-2xl font-black text-foreground">{stats.students}</span>
            </div>
            <div className="app-card px-8 py-5 bg-primary border-none shadow-xl shadow-primary/10">
               <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-1">Lifetime Earnings</p>
               <span className="text-2xl font-black text-white">EGP {stats.earnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Master Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-white rounded-3xl p-1 h-14 border border-black/[0.03] shadow-inner mb-10 w-fit">
            <TabsTrigger value="orders" className="rounded-[20px] px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
              {stats.pending > 0 && <span className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-full">{stats.pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="videos" className="rounded-[20px] px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-black text-xs uppercase tracking-widest flex items-center gap-2">
              <Video className="h-4 w-4" />
              Courses
            </TabsTrigger>
            {userData?.role === 'ADMIN' && (
              <TabsTrigger value="teachers" className="rounded-[20px] px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff Members
              </TabsTrigger>
            )}
          </TabsList>

          {/* Orders Management */}
          <TabsContent value="orders" className="focus-visible:outline-none">
            <div className="app-card overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">Reference / Date</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Security Code</TableHead>
                    <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Status</TableHead>
                    <TableHead className="py-6 pr-8 text-right text-[10px] font-black uppercase tracking-widest text-foreground/40">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-20 opacity-20 text-xs font-black uppercase tracking-widest italic">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {orders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/10 transition-colors border-black/[0.02]">
                      <TableCell className="py-6 px-8">
                        <div className="font-black text-foreground">{order.id}</div>
                        <div className="text-[10px] font-black text-foreground/30 uppercase mt-1">{new Date(order.createdAt).toLocaleString()}</div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-[#9596ff]/10 text-[#9596ff] px-3 py-1 rounded-lg text-xs font-black border border-[#9596ff]/10">
                          {order.paymentCode}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'APPROVED' ? 'default' : order.status === 'REJECTED' ? 'destructive' : 'secondary'} className="rounded-full px-4 h-7 border-none font-black text-[10px] uppercase tracking-widest">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-6 pr-8 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-2xl hover:bg-black/5 text-foreground/40">
                                  <Eye className="h-5 w-5" />
                                </Button>
                              }
                            />
                            <DialogContent className="max-w-xl rounded-[40px] p-10 border-none shadow-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Transaction Receipt</DialogTitle>
                                <DialogDescription className="text-xs font-bold uppercase tracking-widest text-foreground/30">
                                  Verify screenshot note matches OTP: <span className="text-primary">{order.paymentCode}</span>
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-8 flex flex-col items-center justify-center p-2 bg-muted rounded-[32px] overflow-hidden border border-black/[0.03]">
                                <img src={order.screenshotUrl} alt="Receipt" className="max-h-[500px] w-full object-contain rounded-[28px]" />
                              </div>
                            </DialogContent>
                          </Dialog>

                          {order.status === 'PENDING' && (
                            <>
                              <Button 
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                                onClick={() => handleUpdateStatus(order.id, 'APPROVED', order.userId)}
                              >
                                <ShieldCheck className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                                onClick={() => handleUpdateStatus(order.id, 'REJECTED', order.userId)}
                              >
                                <XCircle className="h-5 w-5" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Videos Management */}
          <TabsContent value="videos" className="focus-visible:outline-none">
            <VideoManagement />
          </TabsContent>

          {/* Teacher Management */}
          {userData?.role === 'ADMIN' && (
            <TabsContent value="teachers" className="focus-visible:outline-none">
              <TeacherManagement />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
