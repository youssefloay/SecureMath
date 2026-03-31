'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/clientApp';
import { VideoDoc } from '@/types';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Loader2, PlayCircle, Lock, Sparkles, GraduationCap, ArrowRight, BookOpen, Clock, Play, Search, Menu, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [videos, setVideos] = useState<VideoDoc[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Multi-Filter State
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');

  const { user, userData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'videos'));
        const vids: VideoDoc[] = [];
        querySnapshot.forEach((doc) => {
          vids.push({ id: doc.id, ...doc.data() } as VideoDoc);
        });
        setVideos(vids);
      } catch (err) {
        console.error("Error fetching courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const subjects = ['All', ...Array.from(new Set(videos.map(v => v.subject)))];
  const grades = ['All', ...Array.from(new Set(videos.map(v => v.grade)))];
  const types = ['All', ...Array.from(new Set(videos.map(v => v.courseType)))];

  const filteredVideos = videos.filter(v => {
    return (selectedSubject === 'All' || v.subject === selectedSubject) &&
           (selectedGrade === 'All' || v.grade === selectedGrade) &&
           (selectedType === 'All' || v.courseType === selectedType);
  });

  const teachers = Array.from(new Set(videos.map(v => v.teacherName))).map(name => {
    const video = videos.find(v => v.teacherName === name);
    return { name, bio: video?.teacherBio };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-foreground/20 font-black tracking-widest text-xs uppercase animate-pulse">Initializing Platform...</p>
        </div>
      </div>
    );
  }

  const subjectCards = [
    { name: 'Math', color: 'bg-[#ff9c5e]', icon: 'Σ' },
    { name: 'Physics', color: 'bg-[#ffd36a]', icon: 'E' },
    { name: 'French', color: 'bg-[#9596ff]', icon: 'F' },
    { name: 'English', color: 'bg-[#4facfe]', icon: 'A' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24 px-8">
      <div className="mx-auto max-w-6xl">
        
        {/* Profile & Greeting Section */}
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-[24px] bg-gradient-to-br from-primary to-accent p-1 shadow-xl shadow-primary/20">
               <div className="h-full w-full rounded-[20px] bg-white flex items-center justify-center overflow-hidden border border-black/[0.05]">
                  <div className="text-xl font-black text-primary">
                    {user?.email?.charAt(0).toUpperCase() || 'S'}
                  </div>
               </div>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground/40 mb-1 leading-none uppercase tracking-widest">Let's learn</p>
              <h1 className="text-title leading-tight text-foreground">something new</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-black/[0.05] hover:bg-black/[0.02]">
                <Search className="h-5 w-5 text-foreground/40" />
             </Button>
             <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-black/[0.05] hover:bg-black/[0.02]">
                <Menu className="h-5 w-5 text-foreground/40" />
             </Button>
          </div>
        </div>

        {/* Dynamic Subject Blocks */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-5 duration-700">
           {subjectCards.map((sub, idx) => (
             <motion.div
               key={sub.name}
               whileHover={{ y: -8, scale: 1.02 }}
               onClick={() => setSelectedSubject(sub.name)}
               className={`${sub.color} aspect-square rounded-[40px] p-8 flex flex-col justify-between cursor-pointer shadow-xl shadow-black/5 group relative overflow-hidden`}
             >
               <div className="absolute top-0 right-0 p-4 opacity-10 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-700">
                  <span className="text-[12rem] font-black leading-none text-white">{sub.icon}</span>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                 <Sparkles className="h-5 w-5" />
               </div>
               <h3 className="text-white text-2xl font-black leading-none">{sub.name}</h3>
             </motion.div>
           ))}
        </div>

        {/* Advanced Filter Suite */}
        <div className="mb-12 flex flex-col gap-6 bg-white rounded-[32px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-black/[0.02]">
          <div className="flex items-center gap-2 text-foreground/40 font-black text-xs uppercase tracking-widest pl-1">
             <Filter className="h-4 w-4" />
             Refine your search
          </div>
          <div className="flex flex-wrap gap-x-12 gap-y-6">
            {/* Subject Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase text-foreground/30 tracking-wider">Subject</p>
               <div className="flex flex-wrap gap-2">
                 {subjects.filter(Boolean).map((subject, idx) => (
                   <button 
                     key={`sub-${subject}-${idx}`}
                     onClick={() => setSelectedSubject(subject)}
                     className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                       selectedSubject === subject ? 'bg-[#ff9c5e] text-white border-[#ff9c5e] shadow-lg shadow-[#ff9c5e]/20' : 'bg-muted/50 border-black/[0.03] hover:bg-muted text-foreground/40'
                     }`}
                   >
                     {subject}
                   </button>
                 ))}
               </div>
            </div>

            {/* Grade Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase text-foreground/30 tracking-wider">Class Grade</p>
               <div className="flex flex-wrap gap-2">
                 {grades.filter(Boolean).map((grade, idx) => (
                   <button 
                     key={`grade-${grade}-${idx}`}
                     onClick={() => setSelectedGrade(grade)}
                     className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                       selectedGrade === grade ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-muted/50 border-black/[0.03] hover:bg-muted text-foreground/40'
                     }`}
                   >
                     {grade}
                   </button>
                 ))}
               </div>
            </div>

            {/* Course Type Filter */}
            <div className="space-y-3">
               <p className="text-[10px] font-black uppercase text-foreground/30 tracking-wider">Type</p>
               <div className="flex flex-wrap gap-2">
                 {types.filter(Boolean).map((type, idx) => (
                   <button 
                     key={`type-${type}-${idx}`}
                     onClick={() => setSelectedType(type)}
                     className={`px-4 py-2 rounded-xl text-xs font-black transition-all border ${
                       selectedType === type ? 'bg-[#9596ff] text-white border-[#9596ff] shadow-lg shadow-[#9596ff]/20' : 'bg-muted/50 border-black/[0.03] hover:bg-muted text-foreground/40'
                     }`}
                   >
                     {type}
                   </button>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Top Mentors Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-foreground">Top Mentors</h2>
            <Button variant="ghost" className="text-foreground/40 font-bold hover:text-primary">Show All</Button>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {teachers.map((teacher, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.02 }}
                className="flex-shrink-0 w-80 app-card p-6 flex items-center gap-4 cursor-pointer group"
              >
                <div className="h-16 w-16 rounded-[20px] bg-muted flex items-center justify-center text-primary font-black text-xl border border-black/[0.03] shadow-inner">
                  {teacher.name?.charAt(0)}
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-black text-foreground mb-1 leading-none">{teacher.name}</h4>
                  <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider">{teacher.bio}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-foreground/20 group-hover:text-primary transition-all" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Course Catalog List */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-black text-foreground">Catalog — {selectedSubject}</h2>
            <div className="h-10 w-10 rounded-2xl bg-muted/50 border border-black/[0.03] flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-foreground/30" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                  className="app-card overflow-hidden group cursor-pointer"
                  onClick={() => {
                    if (!user) router.push('/signup');
                    else router.push(`/checkout/${video.id}`);
                  }}
                >
                  <div className="flex p-6 gap-6">
                    <div className={`h-32 w-32 rounded-[32px] shrink-0 border-white shadow-xl shadow-black/5 flex flex-col items-center justify-center text-white relative group-hover:scale-110 transition-transform duration-500 ${
                      video.subject === 'Math' ? 'bg-[#ff9c5e]' :
                      video.subject === 'Physics' ? 'bg-[#ffd36a]' :
                      video.subject === 'French' ? 'bg-[#9596ff]' : 'bg-[#4facfe]'
                    }`}>
                      <div className="text-3xl font-black mb-1 leading-none">{index + 1 < 10 ? `0${index + 1}` : index + 1}</div>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">{video.grade}</span>
                    </div>
                    
                    <div className="flex flex-col justify-center flex-1 pr-6">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] font-black uppercase text-primary tracking-widest">{video.courseType}</span>
                         <div className="h-1 w-1 rounded-full bg-black/10" />
                         <span className="text-[10px] font-black uppercase text-foreground/50 tracking-widest">{video.subject}</span>
                      </div>
                      <h3 className="text-xl font-black text-foreground mb-2 leading-snug group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 opacity-60">
                         <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-foreground/60">
                           <Clock className="h-3 w-3" />
                           24h ACCESS
                         </div>
                         <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-foreground/60">
                           <Lock className="h-3 w-3" />
                           LIMITED VIEW
                         </div>
                      </div>
                    </div>
                    
                    <div className="h-10 w-10 rounded-full border border-black/[0.05] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredVideos.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-20">
                <p className="font-black tracking-widest uppercase italic">No Content Matches Filters</p>
                <Button variant="ghost" className="mt-4" onClick={() => { setSelectedGrade('All'); setSelectedType('All'); setSelectedSubject('All'); }}>Reset Filters</Button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
