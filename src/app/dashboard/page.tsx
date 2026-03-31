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
import { Loader2, Eye, ShieldCheck, XCircle, Users, Video, ShoppingCart, TrendingUp, Plus, Calendar, Hash } from 'lucide-react';
import { toast } from 'sonner';

// Import our new modules
import { TeacherManagement } from '@/components/admin/TeacherManagement';
import { VideoManagement } from '@/components/admin/VideoManagement';

export default function DashboardPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderDoc[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
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
      setDataLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData, authLoading, router]);

  const handleUpdateStatus = async (orderId: string, status: 'APPROVED' | 'REJECTED', userId: string) => {
    const mockEmail = "student@example.com"; 
    const result = await updateOrderStatus(orderId, status, mockEmail);
    if (result.success) toast.success(`Order ${status.toLowerCase()}ed.`);
    else toast.error("Update failed.");
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
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-4 md:px-8">
      <div className="mx-auto max-w-7xl">
        
        {/* Responsive Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-3">
              <TrendingUp className="h-3 w-3" />
              Management Dashboard
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
              {userData?.role === 'ADMIN' ? 'Administrator Hub' : 'Teacher Panel'}
            </h1>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="app-card px-6 py-4 md:px-8 md:py-5 border-none shadow-xl shadow-black/[0.02] flex flex-col justify-center">
               <p className="text-[9px] font-black uppercase text-foreground/30 tracking-widest mb-1">Students</p>
               <span className="text-xl md:text-2xl font-black text-foreground">{stats.students}</span>
            </div>
            <div className="app-card px-6 py-4 md:px-8 md:py-5 bg-primary border-none shadow-xl shadow-primary/10 flex flex-col justify-center">
               <p className="text-[9px] font-black uppercase text-white/50 tracking-widest mb-1">Earnings</p>
               <span className="text-xl md:text-2xl font-black text-white leading-none">EGP {stats.earnings.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Master Tabs - Now scrollable on mobile */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="bg-white rounded-2xl md:rounded-[24px] p-1 h-14 border border-black/[0.03] shadow-inner mb-10 w-full md:w-fit flex overflow-x-auto scrollbar-hide no-scrollbar flex-nowrap">
            <TabsTrigger value="orders" className="shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
              {stats.pending > 0 && <span className="bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full">{stats.pending}</span>}
            </TabsTrigger>
            <TabsTrigger value="videos" className="shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <Video className="h-4 w-4" />
              Courses
            </TabsTrigger>
            {userData?.role === 'ADMIN' && (
              <TabsTrigger value="teachers" className="shrink-0 rounded-xl md:rounded-2xl px-6 md:px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff Members
              </TabsTrigger>
            )}
          </TabsList>

          {/* Orders Management */}
          <TabsContent value="orders" className="focus-visible:outline-none">
            {/* Desktop Table View */}
            <div className="hidden md:block app-card overflow-hidden">
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
                                className="h-10 w-10 rounded-2xl bg-green-50 text-green-600 hover:bg-green-100"
                                onClick={() => handleUpdateStatus(order.id, 'APPROVED', order.userId)}
                              >
                                <ShieldCheck className="h-5 w-5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 hover:bg-red-100"
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

            {/* Mobile Card List View */}
            <div className="md:hidden space-y-4">
               {orders.map((order) => (
                 <div key={order.id} className="app-card p-6 bg-white border border-black/[0.03] shadow-lg shadow-black/[0.01]">
                    <div className="flex items-center justify-between mb-4">
                       <div className="flex items-center gap-2 text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                          <Hash className="h-3 w-3" />
                          {order.id.substring(0, 12)}...
                       </div>
                       <Badge variant={order.status === 'APPROVED' ? 'default' : order.status === 'REJECTED' ? 'destructive' : 'secondary'} className="rounded-full px-3 h-6 border-none font-black text-[8px] uppercase tracking-widest">
                          {order.status}
                       </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-6">
                       <div className="px-3 py-1 bg-[#9596ff]/10 text-[#9596ff] rounded-lg text-xs font-black border border-[#9596ff]/10">
                          {order.paymentCode}
                       </div>
                       <div className="h-1 w-1 rounded-full bg-black/10" />
                       <div className="flex items-center gap-1.5 text-[10px] font-black text-foreground/30 uppercase">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString()}
                       </div>
                    </div>

                    <div className="flex items-center gap-3">
                       <Dialog>
                          <DialogTrigger
                             render={
                               <Button className="flex-1 bg-muted/50 hover:bg-muted text-foreground/40 font-black text-[10px] uppercase py-6 rounded-2xl border border-black/[0.02]">
                                  <Eye className="h-4 w-4 mr-2" /> View Proof
                               </Button>
                             }
                          />
                          <DialogContent className="w-[90vw] max-w-sm rounded-[32px] p-6 border-none shadow-2xl">
                             <DialogHeader>
                                <DialogTitle className="text-xl font-black">Transfer Receipt</DialogTitle>
                                <DialogDescription className="text-[10px] font-black uppercase tracking-widest text-foreground/30">
                                   Verify OTP: <span className="text-primary">{order.paymentCode}</span>
                                </DialogDescription>
                             </DialogHeader>
                             <div className="mt-6 p-2 bg-muted rounded-2xl overflow-hidden shadow-inner">
                                <img src={order.screenshotUrl} alt="Receipt" className="w-full object-contain rounded-xl" />
                             </div>
                          </DialogContent>
                       </Dialog>

                       {order.status === 'PENDING' && (
                         <div className="flex gap-2 shrink-0">
                           <Button 
                             className="h-12 w-12 bg-green-50 text-green-600 rounded-2xl hover:bg-green-100"
                             onClick={() => handleUpdateStatus(order.id, 'APPROVED', order.userId)}
                           >
                              <ShieldCheck className="h-5 w-5" />
                           </Button>
                           <Button 
                             className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100"
                             onClick={() => handleUpdateStatus(order.id, 'REJECTED', order.userId)}
                           >
                              <XCircle className="h-5 w-5" />
                           </Button>
                         </div>
                       )}
                    </div>
                 </div>
               ))}
               {orders.length === 0 && (
                 <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-widest italic">
                    No transactions found
                 </div>
               )}
            </div>
          </TabsContent>

          {/* Videos Management - Sub-components handle their own responsiveness */}
          <TabsContent value="videos" className="focus-visible:outline-none">
            <VideoManagement />
          </TabsContent>

          {/* Teacher Management - Sub-components handle their own responsiveness */}
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
