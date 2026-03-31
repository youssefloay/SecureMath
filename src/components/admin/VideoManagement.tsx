'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { useAuth } from '@/components/providers/AuthProvider';
import { VideoDoc } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Video, Trash2, Tag, GraduationCap, PlaySquare, DollarSign, UploadCloud, CheckCircle2 } from 'lucide-react';
import { addVideo, deleteVideo } from '@/app/actions/videos';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function VideoManagement() {
  const { user, userData } = useAuth();
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<Omit<VideoDoc, 'id'>>({
    title: '',
    description: '',
    price: 0,
    vdoId: '',
    teacherId: '',
    teacherName: '',
    teacherBio: '',
    category: '',
    grade: '',
    courseType: '',
    subject: '',
  });

  useEffect(() => {
    if (!userData) return;

    let q;
    if (userData.role === 'ADMIN') {
      q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    } else {
      q = query(
        collection(db, 'videos'), 
        where('teacherId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoDoc));
      setVideos(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, userData]);

  const handleFileUpload = async () => {
    if (!selectedFile || !user) return;
    
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const token = await user.getIdToken();
      
      // 1. Get Upload Credentials
      const initRes = await fetch('/api/vdocipher/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: formData.title || selectedFile.name })
      });

      if (!initRes.ok) throw new Error("Failed to initialize upload");
      
      const { video_id, clientPayload } = await initRes.json();
      setUploadProgress(30);

      // 2. Upload to S3 (VdoCipher)
      const uploadData = new FormData();
      
      // S3 requires specific field order: all policy/auth fields first, then file
      const fields = [
        'policy', 'key', 'x-amz-signature', 'x-amz-algorithm', 
        'x-amz-date', 'x-amz-credential', 'success_action_status', 
        'x-amz-meta-videoid'
      ];

      fields.forEach(field => {
        if (clientPayload[field]) {
          uploadData.append(field, clientPayload[field]);
        }
      });
      
      uploadData.append('file', selectedFile);

      const uploadRes = await fetch(clientPayload.upload_link_secure, {
        method: 'POST',
        body: uploadData,
      });

      if (!uploadRes.ok) throw new Error("Video upload failed");

      setUploadProgress(100);
      setFormData(prev => ({ ...prev, vdoId: video_id }));
      toast.success("Video uploaded successfully!");
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload failed");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    
    if (!formData.vdoId) {
       toast.error("Please upload a video or provide a VdoCipher ID");
       return;
    }

    setSubmitting(true);
    
    // Automatically set teacher identity for security
    const finalData = {
       ...formData,
       teacherId: user.uid,
       teacherName: userData.name || "Staff Member",
       category: formData.subject, // Map subject to category for sorting
    };

    const result = await addVideo(finalData);
    if (result.success) {
      toast.success("Course published!");
      setShowForm(false);
      setFormData({
        title: '', description: '', price: 0, vdoId: '', teacherId: '', teacherName: '', teacherBio: '', category: '', grade: '', courseType: '', subject: ''
      });
      setSelectedFile(null);
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const setShowStatus = (val: boolean) => setShowForm(val);

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this course?")) {
      const result = await deleteVideo(id);
      if (result.success) toast.success("Course removed.");
      else toast.error("Delete failed.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1">Video Library</h2>
          <p className="text-[10px] text-foreground/30 font-black uppercase tracking-widest leading-none">Catalog management & categorization</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`rounded-2xl transition-all h-12 md:h-10 px-6 font-black text-[10px] uppercase tracking-widest ${showForm ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
        >
          {showForm ? 'Cancel Operation' : (
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Course
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="app-card overflow-hidden p-6 md:p-8 border-primary/10 bg-primary/[0.01]"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Course Title</Label>
                 <div className="relative">
                   <PlaySquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     placeholder="e.g. Calculus: Limits & Continuity"
                   />
                 </div>
              </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Video Asset</Label>
                    <div className="flex flex-col gap-3">
                      <div className="relative group">
                        <input 
                          type="file" 
                          id="video-upload" 
                          accept="video/*" 
                          className="hidden" 
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <label 
                          htmlFor="video-upload"
                          className="flex flex-col items-center justify-center border-2 border-dashed border-black/[0.05] rounded-2xl h-32 cursor-pointer hover:bg-black/[0.01] transition-all group-hover:border-primary/20"
                        >
                          {selectedFile ? (
                            <div className="flex flex-col items-center gap-2">
                               <CheckCircle2 className="h-6 w-6 text-green-500" />
                               <span className="text-[10px] font-black uppercase max-w-[150px] truncate">{selectedFile.name}</span>
                               <span className="text-[8px] font-bold opacity-30">Change File</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                               <UploadCloud className="h-6 w-6 text-foreground/20" />
                               <span className="text-[10px] font-black uppercase text-foreground/40">Select Video File</span>
                            </div>
                          )}
                        </label>
                      </div>

                      {selectedFile && !formData.vdoId && (
                         <Button 
                           type="button"
                           onClick={handleFileUpload}
                           disabled={uploading}
                           className="h-12 rounded-xl bg-orange-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20"
                         >
                           {uploading ? `Uploading ${uploadProgress}%` : 'Upload to VdoCipher'}
                         </Button>
                      )}

                      {uploading && (
                         <div className="w-full bg-black/5 h-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            />
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">VdoCipher ID (Auto-filled)</Label>
                     <div className="relative">
                       <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                       <Input 
                         required
                         className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-mono font-bold"
                         value={formData.vdoId}
                         onChange={(e) => setFormData({ ...formData, vdoId: e.target.value })}
                         placeholder="vdo_id_..."
                       />
                     </div>
                  </div>
               </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Grade Level</Label>
                 <div className="relative">
                   <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input required className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05]" value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} placeholder="Grade 12"/>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Subject</Label>
                 <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input required className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05]" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} placeholder="Math"/>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Price (EGP)</Label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input required type="number" className="h-14 md:h-12 pl-11 rounded-xl bg-white border-black/[0.05]" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}/>
                 </div>
              </div>

              <div className="md:col-span-3">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Course Type (e.g. Revision)</Label>
                 <Input required className="h-14 md:h-12 rounded-xl bg-white border-black/[0.05]" value={formData.courseType} onChange={(e) => setFormData({...formData, courseType: e.target.value})}/>
              </div>

              <div className="md:col-span-3 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full md:w-auto bg-primary text-white px-10 h-14 rounded-2xl font-black shadow-xl shadow-primary/20 text-[10px] uppercase tracking-widest"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publish to Catalog'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course List: Tabular on Desktop, Card-based on Mobile */}
      <div className="app-card border-none shadow-xl shadow-black/[0.01] overflow-hidden bg-white">
        {/* Desktop View */}
        <div className="hidden md:block">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">Topic / Metadata</TableHead>
                <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Price</TableHead>
                <TableHead className="py-6 pr-8 text-right text-[10px] font-black uppercase tracking-widest text-foreground/40">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((v) => (
                <TableRow key={v.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell className="py-6 px-8">
                    <div className="font-black text-foreground">{v.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">{v.grade}</span>
                       <span className="text-[8px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{v.subject}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-foreground">EGP {v.price}</TableCell>
                  <TableCell className="py-6 pr-8 text-right">
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="h-10 w-10 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Card List */}
        <div className="md:hidden space-y-px">
           {videos.map((v) => (
             <div key={v.id} className="flex items-center justify-between p-6 border-b border-black/[0.03] last:border-none">
                <div className="flex-1 pr-4">
                   <h4 className="font-black text-foreground text-sm leading-tight mb-1">{v.title}</h4>
                   <div className="flex items-center gap-2">
                       <span className="text-[7px] font-black uppercase tracking-widest text-primary/60">{v.grade}</span>
                       <div className="h-0.5 w-0.5 rounded-full bg-black/10" />
                       <span className="text-[7px] font-black uppercase tracking-widest text-orange-500/60">{v.subject}</span>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-sm font-black text-foreground">EGP {v.price}</span>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} className="h-10 w-10 text-red-500 bg-red-50/50 rounded-xl">
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
             </div>
           ))}
           {videos.length === 0 && (
              <div className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-widest italic">
                 Catalog is empty
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
