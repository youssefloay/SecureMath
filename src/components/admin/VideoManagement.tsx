'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { VideoDoc } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Video, Trash2, Tag, BookOpen, GraduationCap, PlaySquare, DollarSign, Type } from 'lucide-react';
import { addVideo, deleteVideo } from '@/app/actions/videos';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function VideoManagement() {
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
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
    const q = query(collection(db, 'videos'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VideoDoc));
      setVideos(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await addVideo(formData);
    if (result.success) {
      toast.success("Course added to catalog successfully!");
      setShowForm(false);
      setFormData({
        title: '', description: '', price: 0, vdoId: '', teacherId: '', teacherName: '', teacherBio: '', category: '', grade: '', courseType: '', subject: ''
      });
    } else {
      toast.error(result.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Permanently delete this course? This cannot be undone.")) {
      const result = await deleteVideo(id);
      if (result.success) toast.success("Course deleted.");
      else toast.error("Failed to delete course.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-foreground mb-1">Video Library</h2>
          <p className="text-xs text-foreground/30 font-bold uppercase tracking-widest leading-none">Catalog management & categorization</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className={`rounded-2xl transition-all ${showForm ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-primary text-white shadow-xl shadow-primary/20'}`}
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
            className="app-card overflow-hidden p-8 border-primary/10 bg-primary/[0.01]"
          >
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Course Title</Label>
                 <div className="relative">
                   <PlaySquare className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                     value={formData.title}
                     onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                     placeholder="e.g. Calculus: Limits & Continuity"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">VdoCipher ID</Label>
                 <div className="relative">
                   <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-mono font-bold"
                     value={formData.vdoId}
                     onChange={(e) => setFormData({ ...formData, vdoId: e.target.value })}
                     placeholder="vdo_cipher_id_123"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Grade Level</Label>
                 <div className="relative">
                   <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                     value={formData.grade}
                     onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                     placeholder="Grade 12"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Subject</Label>
                 <div className="relative">
                   <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                     value={formData.subject}
                     onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                     placeholder="Math"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Course Type</Label>
                 <div className="relative">
                   <Tag className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] shadow-inner font-bold"
                     value={formData.courseType}
                     onChange={(e) => setFormData({ ...formData, courseType: e.target.value })}
                     placeholder="Revision"
                   />
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Teacher Name</Label>
                 <Input 
                   required
                   className="h-12 rounded-xl bg-white border-black/[0.05] font-bold"
                   value={formData.teacherName}
                   onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                 />
              </div>

              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Price (EGP)</Label>
                 <div className="relative">
                   <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/20" />
                   <Input 
                     required
                     type="number"
                     className="h-12 pl-11 rounded-xl bg-white border-black/[0.05] font-bold"
                     value={formData.price}
                     onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                   />
                 </div>
              </div>

              <div className="md:col-span-3 space-y-2">
                 <Label className="text-[10px] font-black uppercase text-foreground/40 ml-1">Description</Label>
                 <Input 
                   required
                   className="h-12 rounded-xl bg-white border-black/[0.05] font-bold"
                   value={formData.description}
                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                 />
              </div>

              <div className="md:col-span-3 flex justify-end pt-4">
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="bg-primary text-white px-10 h-14 rounded-2xl font-black shadow-xl shadow-primary/20"
                >
                  {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Publish Course'}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="app-card border-none shadow-xl shadow-black/[0.01] overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-foreground/40">Topic / Metadata</TableHead>
              <TableHead className="py-6 text-[10px] font-black uppercase tracking-widest text-foreground/40">Details</TableHead>
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
                     <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full">{v.grade}</span>
                     <span className="text-[9px] font-black uppercase tracking-widest bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{v.subject}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <p className="text-xs font-bold text-foreground/40 line-clamp-1">{v.description}</p>
                  <div className="text-[10px] font-black text-foreground/20 italic mt-1">{v.teacherName}</div>
                </TableCell>
                <TableCell className="font-black text-foreground">EGP {v.price}</TableCell>
                <TableCell className="py-6 pr-8 text-right">
                   <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(v.id)}
                    className="h-10 w-10 border border-black/[0.03] text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
