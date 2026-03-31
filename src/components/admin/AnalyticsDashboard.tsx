'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell 
} from 'recharts';
import { getAnalyticsStats } from '@/app/actions/stats';
import { useAuth } from '@/components/providers/AuthProvider';
import { TrendingUp, Award, BarChart3, Loader2 } from 'lucide-react';

export function AnalyticsDashboard() {
  const { user, userData } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const teacherId = userData?.role === 'TEACHER' ? user?.uid : undefined;
      const result = await getAnalyticsStats(teacherId);
      if (result.success) {
        setData(result.data);
      }
      setLoading(false);
    }
    fetchData();
  }, [user, userData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="app-card p-8 border-none bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-primary font-black text-[9px] uppercase tracking-widest mb-1">
                 <TrendingUp className="h-3 w-3" />
                 Net Profit
              </div>
              <h3 className="text-xl font-black text-foreground">Revenue Trend</h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
               Last 7 Days
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '16px',
                    fontSize: '12px',
                    fontWeight: '900',
                    boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                  }}
                  itemStyle={{ color: 'var(--primary)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Courses Bar Chart */}
        <div className="app-card p-8 border-none bg-white dark:bg-card">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-accent font-black text-[9px] uppercase tracking-widest mb-1">
                 <Award className="h-3 w-3" />
                 Market Demand
              </div>
              <h3 className="text-xl font-black text-foreground">Top Courses</h3>
            </div>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.performanceData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  width={100}
                  tick={{ fill: 'var(--foreground)', fontSize: 10, fontWeight: 900 }}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    borderColor: 'var(--border)', 
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: '900'
                  }}
                />
                <Bar dataKey="sales" radius={[0, 10, 10, 0]} barSize={20}>
                  {data.performanceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : 'var(--accent)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="app-card p-6 border-none bg-primary text-white flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black uppercase opacity-60 mb-1">Weekly Growth</p>
               <h4 className="text-2xl font-black">+14.2%</h4>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center">
               <TrendingUp className="h-6 w-6" />
            </div>
         </div>
         <div className="app-card p-6 border-none bg-white dark:bg-card border border-border flex items-center justify-between">
            <div>
               <p className="text-[10px] font-black uppercase text-foreground/40 mb-1">Courses Active</p>
               <h4 className="text-2xl font-black">24</h4>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-foreground/30">
               <BarChart3 className="h-6 w-6" />
            </div>
         </div>
      </div>

    </div>
  );
}
