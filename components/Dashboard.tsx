import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts';
import { dealStages } from '../data/mockData';
import { Task, Page, Deal, Contact, Activity, ActivityType } from '../types';

const StatCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease', data: any[] }> = ({ title, value, change, changeType, data }) => {
    const isIncrease = changeType === 'increase';
    const color = isIncrease ? '#22C55E' : '#EF4444';

    return (
        <div className="bg-card dark:bg-dark-card p-5 rounded-xl border border-border dark:border-dark-border h-full transition-shadow hover:shadow-md">
            <div className="flex justify-between items-start">
                <h3 className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">{title}</h3>
                <div className={`flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${isIncrease ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                   {isIncrease ? <i data-lucide="arrow-up" className="w-3 h-3"></i> : <i data-lucide="arrow-down" className="w-3 h-3"></i>}
                   <span className="ml-1">{change}</span>
                </div>
            </div>
            <p className="text-3xl font-bold mt-2 text-foreground dark:text-dark-foreground">{value}</p>
            <div className="h-16 mt-4 -mb-5 -mx-5">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id={isIncrease ? "colorUv" : "colorPv"} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                                <stop offset="95%" stopColor={color} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip
                            cursor={false}
                            contentStyle={{ display: 'none' }}
                        />
                        <Area type="monotone" dataKey="uv" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#${isIncrease ? "colorUv" : "colorPv"})`} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const formatDistanceToNow = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

const ActivityIcon: React.FC<{ type: ActivityType }> = ({ type }) => {
    const iconMap: Record<ActivityType, string> = {
        deal_won: 'trophy',
        new_contact: 'user-plus',
        task_completed: 'check-circle-2',
        proposal_accepted: 'file-check',
        new_lead: 'target'
    };
    const colorMap: Record<ActivityType, string> = {
        deal_won: 'bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400',
        new_contact: 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400',
        task_completed: 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
        proposal_accepted: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-400',
        new_lead: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'
    };

    return (
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorMap[type]}`}>
            <i data-lucide={iconMap[type]} className="w-5 h-5"></i>
        </div>
    );
};

const ActivityItem: React.FC<{ item: Activity }> = ({ item }) => (
    <div className="flex items-start space-x-4 py-3 border-b border-border dark:border-dark-border last:border-b-0">
        <ActivityIcon type={item.type} />
        <div className="flex-1">
            <p className="text-sm text-foreground dark:text-dark-foreground">
                <span className="font-semibold">{item.user.name}</span> {item.details}
            </p>
            <p className="text-xs text-muted-foreground dark:text-dark-muted-foreground mt-0.5">{formatDistanceToNow(item.timestamp)}</p>
        </div>
    </div>
);


const ChartContainer: React.FC<{ title: string; children: React.ReactNode; className?: string; showViewAll?: boolean; onShowAll?: () => void; }> = ({ title, children, className = '', showViewAll = false, onShowAll }) => (
    <div className={`bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl border border-border dark:border-dark-border flex flex-col ${className}`}>
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold text-foreground dark:text-dark-foreground">{title}</h3>
            {showViewAll && <a href="#" onClick={(e) => { e.preventDefault(); onShowAll?.(); }} className="text-sm font-medium text-primary hover:underline">View all</a>}
        </div>
        <div className="flex-1 w-full h-full min-h-0">{children}</div>
    </div>
);

interface DashboardProps {
  setCurrentPage: (page: Page) => void;
  contacts: Contact[];
  deals: Deal[];
  tasks: Task[];
  activity: Activity[];
}

const Dashboard: React.FC<DashboardProps> = ({ setCurrentPage, contacts, deals, tasks, activity }) => {
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState('Last 30 days');
  const dateFilterOptions = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'This Year'];
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // @ts-ignore
    if (window.lucide) {
        // @ts-ignore
        window.lucide.createIcons();
    }
  }, [isDateFilterOpen, activity]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
            setIsDateFilterOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const filteredDeals = useMemo(() => {
    const dateRanges: { [key: string]: number } = {
        'Last 7 days': 7,
        'Last 30 days': 30,
        'Last 90 days': 90,
    };
    const days = dateRanges[dateFilter];
    
    if (dateFilter === 'This Year') {
        const currentYear = new Date().getFullYear();
        return deals.filter(deal => new Date(deal.createdDate).getFullYear() === currentYear);
    }
    
    if (days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        return deals.filter(deal => new Date(deal.createdDate) >= cutoffDate);
    }

    return deals; // Default case
  }, [deals, dateFilter]);

  const trendData = [
    { name: 'Jan', uv: 2100 }, { name: 'Feb', uv: 3000 }, { name: 'Mar', uv: 2000 },
    { name: 'Apr', uv: 2780 }, { name: 'May', uv: 1890 }, { name: 'Jun', uv: 2390 },
    { name: 'Jul', uv: 3490 },
  ];

  const totalRevenue = filteredDeals.filter(d => d.stage === 'Won').reduce((sum, deal) => sum + deal.value, 0);
  const totalLeads = contacts.filter(c => c.status === 'lead').length; // Leads are not typically date-filtered in this context
  const openTasks = tasks.filter(t => t.status !== 'done').length;

  const funnelData = dealStages
      .filter(stage => stage !== 'Lost' && stage !== 'Won')
      .map(stage => ({
        name: stage,
        value: filteredDeals.filter(deal => deal.stage === stage).length,
      }));

  const dealsByStageData = dealStages.map(stage => ({
      name: stage,
      value: filteredDeals.filter(deal => deal.stage === stage).length,
  })).filter(d => d.value > 0);
  
  const PIE_COLORS = ['#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0', '#F0FDF4'];
  
  const revenueByMonth = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    filteredDeals.forEach(deal => {
        if(deal.stage === 'Won') {
            const month = new Date(deal.createdDate).toLocaleString('default', { month: 'short' });
            if (!monthlyData[month]) monthlyData[month] = 0;
            monthlyData[month] += deal.value;
        }
    });
    
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    return monthOrder.map(month => ({
        month,
        revenue: monthlyData[month] || 0
    })).filter(d => d.revenue > 0);

  }, [filteredDeals]);

  const taskStatusData = [
      { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
      { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
      { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ];
  const TASK_COLORS = ['#FBBF24', '#60A5FA', '#22C55E'];

  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6 overflow-y-auto">
       <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Welcome, Brian!</h1>
                <p className="text-muted-foreground dark:text-dark-muted-foreground mt-1">Here's your dashboard overview for today.</p>
            </div>
            <div className="relative w-full sm:w-auto" ref={dateFilterRef}>
                <button
                    onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                    className="flex items-center bg-card dark:bg-dark-card border border-border dark:border-dark-border px-4 py-2 rounded-md font-medium hover:bg-secondary dark:hover:bg-dark-secondary text-sm w-full sm:w-auto justify-center"
                >
                    <i data-lucide="calendar-days" className="w-4 h-4 mr-2 text-muted-foreground dark:text-dark-muted-foreground"></i>
                    <span>{dateFilter}</span>
                    <i data-lucide="chevron-down" className="w-4 h-4 ml-2 text-muted-foreground dark:text-dark-muted-foreground"></i>
                </button>
                {isDateFilterOpen && (
                    <div className="absolute right-0 mt-2 w-full sm:w-48 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-md shadow-lg z-10 py-1">
                        {dateFilterOptions.map(option => (
                            <a
                                key={option}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setDateFilter(option);
                                    setIsDateFilterOpen(false);
                                }}
                                className="block px-4 py-2 text-sm text-foreground dark:text-dark-foreground hover:bg-secondary dark:hover:bg-dark-secondary"
                            >
                                {option}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>

      <div className="flex-shrink-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div onClick={() => setCurrentPage('Analytics')} className="cursor-pointer"><StatCard title="Sales" value={`$${totalRevenue.toLocaleString()}`} change="12.5%" changeType="increase" data={trendData} /></div>
        <div onClick={() => setCurrentPage('Leads')} className="cursor-pointer"><StatCard title="Leads" value={totalLeads.toString()} change="10.2%" changeType="increase" data={trendData.slice().reverse()} /></div>
        <div onClick={() => setCurrentPage('Tasks')} className="cursor-pointer"><StatCard title="Open Tasks" value={openTasks.toString()} change="2.1%" changeType="decrease" data={trendData} /></div>
        <div><StatCard title="Tasks Done" value={tasks.filter(t => t.status === 'done').length.toString()} change="8.0%" changeType="increase" data={trendData.slice().reverse()} /></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartContainer title="Revenue Overview" className="lg:col-span-2 min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
               <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 93%)" className="dark:stroke-dark-border" />
              <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} className="dark:stroke-dark-muted-foreground" />
              <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} className="dark:stroke-dark-muted-foreground" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                  borderRadius: '0.75rem',
                  color: 'var(--foreground)'
                }}
                wrapperClassName="dark:!bg-dark-card"
              />
              <Area type="monotone" dataKey="revenue" stroke="#22C55E" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <ChartContainer title="Recent Activity" className="min-h-[300px]">
            <div className="space-y-1 h-full overflow-y-auto pr-2 -mr-4">
                {activity.map(item => (
                    <ActivityItem key={item.id} item={item} />
                ))}
            </div>
        </ChartContainer>
        
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ChartContainer title="Deal Pipeline" className="min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(220, 14%, 93%)" className="dark:stroke-dark-border"/>
                    <XAxis type="number" stroke="hsl(220, 9%, 46%)" fontSize={12} className="dark:stroke-dark-muted-foreground" />
                    <YAxis type="category" dataKey="name" stroke="hsl(220, 9%, 46%)" fontSize={12} width={80} tick={{ transform: 'translate(0, 0)' }} className="dark:stroke-dark-muted-foreground"/>
                    <Tooltip cursor={{fill: 'hsl(220, 16%, 96%)', className: 'dark:!fill-dark-secondary'}} contentStyle={{ borderRadius: '0.75rem' }}/>
                    <Bar dataKey="value" fill="#22C55E" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
            </ResponsiveContainer>
            </ChartContainer>

            <ChartContainer title="Deals by Stage" className="min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie data={dealsByStageData} cx="50%" cy="50%" outerRadius={'80%'} fill="#8884d8" dataKey="value" nameKey="name" labelLine={false} label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}>
                    {dealsByStageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '0.75rem' }} />
                <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-muted-foreground dark:text-dark-muted-foreground text-sm">{value}</span>} />
                </PieChart>
            </ResponsiveContainer>
            </ChartContainer>
            
            <ChartContainer title="Task Status" className="min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={taskStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={'60%'} outerRadius={'80%'} paddingAngle={5}>
                            {taskStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={TASK_COLORS[index % TASK_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '0.75rem' }} />
                        <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-muted-foreground dark:text-dark-muted-foreground text-sm">{value}</span>} />
                    </PieChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;