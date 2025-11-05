import React, { useMemo, useEffect, useState, useRef } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Deal, Contact } from '../types';

interface AnalyticsProps {
    deals: Deal[];
    contacts: Contact[];
}

const StatCard: React.FC<{ title: string; value: string; icon: string; change?: string; changeType?: 'increase' | 'decrease' }> = ({ title, value, icon, change, changeType }) => {
    const isIncrease = changeType === 'increase';
    return (
        <div className="bg-card dark:bg-dark-card p-5 rounded-xl border border-border dark:border-dark-border flex items-center">
            <div className="p-3 rounded-full bg-secondary dark:bg-dark-secondary mr-4">
                <i data-lucide={icon} className="w-6 h-6 text-primary"></i>
            </div>
            <div>
                <h3 className="text-sm font-medium text-muted-foreground dark:text-dark-muted-foreground">{title}</h3>
                <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
            {change && (
                 <div className={`ml-auto flex items-center text-xs font-semibold px-1.5 py-0.5 rounded ${isIncrease ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}`}>
                   {isIncrease ? <i data-lucide="arrow-up" className="w-3 h-3"></i> : <i data-lucide="arrow-down" className="w-3 h-3"></i>}
                   <span className="ml-1">{change}</span>
                </div>
            )}
        </div>
    );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const name = payload[0].name; // For Pie Chart
    const formattedValue = payload[0].dataKey === 'revenue' ? `$${Number(value).toLocaleString()}` : value;
    return (
      <div className="bg-card dark:bg-dark-card text-foreground dark:text-dark-foreground p-3 rounded-lg shadow-lg border border-border dark:border-dark-border">
        <p className="label font-semibold text-sm">{`${label || name}`}</p>
        <p className="intro text-sm text-muted-foreground dark:text-dark-muted-foreground">{`${payload[0].name}: ${formattedValue}`}</p>
      </div>
    );
  }
  return null;
};

const Analytics: React.FC<AnalyticsProps> = ({ deals, contacts }) => {
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filter, setFilter] = useState('This Quarter');
    const filterOptions = ['Today', 'Last 7 Days', 'This Month', 'This Quarter', 'This Year'];
    const filterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // @ts-ignore
        if (window.lucide) {
            // @ts-ignore
            window.lucide.createIcons();
        }
    }, [isFilterOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredDeals = useMemo(() => {
        const now = new Date();
        let startDate: Date | null = null;

        switch (filter) {
            case 'Today':
                startDate = new Date(now.setHours(0, 0, 0, 0));
                break;
            case 'Last 7 Days':
                startDate = new Date();
                startDate.setDate(now.getDate() - 7);
                break;
            case 'This Month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'This Quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startDate = new Date(now.getFullYear(), quarter * 3, 1);
                break;
            case 'This Year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return deals;
        }

        return deals.filter(deal => new Date(deal.createdDate) >= startDate!);
    }, [deals, filter]);


    const totalRevenue = useMemo(() => filteredDeals.filter(d => d.stage === 'Won').reduce((acc, item) => acc + item.value, 0), [filteredDeals]);
    const wonDeals = useMemo(() => filteredDeals.filter(d => d.stage === 'Won'), [filteredDeals]);
    const dealsWonCount = wonDeals.length;
    const totalDealsInPeriod = filteredDeals.length;
    const conversionRate = useMemo(() => (totalDealsInPeriod > 0 ? (dealsWonCount / totalDealsInPeriod * 100).toFixed(1) : '0.0'), [dealsWonCount, totalDealsInPeriod]);
    const averageDealSize = useMemo(() => {
        if (dealsWonCount === 0) return 0;
        const wonDealsValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0);
        return wonDealsValue / dealsWonCount;
    }, [wonDeals, dealsWonCount]);

    const revenueByMonth = useMemo(() => {
        const monthlyData: { [key: string]: number } = {};
        filteredDeals.forEach(deal => {
            if (deal.stage === 'Won') {
                const month = new Date(deal.createdDate).toLocaleString('default', { month: 'short' });
                if (!monthlyData[month]) monthlyData[month] = 0;
                monthlyData[month] += deal.value;
            }
        });
        const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return monthOrder.map(month => ({
            month,
            revenue: monthlyData[month] || 0
        }));
    }, [filteredDeals]);

    const salesFunnelData = useMemo(() => {
        return [
            { stage: 'Lead In', value: filteredDeals.filter(d => d.stage === 'Lead In').length },
            { stage: 'Contact Made', value: filteredDeals.filter(d => d.stage === 'Contact Made').length },
            { stage: 'Proposal Sent', value: filteredDeals.filter(d => d.stage === 'Proposal Sent').length },
            { stage: 'Won', value: wonDeals.length },
        ].filter(d => d.value > 0);
    }, [filteredDeals, wonDeals]);


  const PIE_COLORS = ['#22C55E', '#4ADE80', '#86EFAC', '#BBF7D0'];

  return (
    <div className="space-y-6 h-full overflow-y-auto p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-foreground dark:text-dark-foreground">Analytics Overview</h1>
                <p className="text-muted-foreground dark:text-dark-muted-foreground mt-1">Deep dive into your sales and performance metrics.</p>
            </div>
            <div className="relative w-full sm:w-auto" ref={filterRef}>
                <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center bg-card dark:bg-dark-card border border-border dark:border-dark-border px-4 py-2 rounded-md font-medium hover:bg-secondary dark:hover:bg-dark-secondary text-sm w-full sm:w-auto justify-center"
                >
                    <i data-lucide="calendar-days" className="w-4 h-4 mr-2 text-muted-foreground dark:text-dark-muted-foreground"></i>
                    <span>{filter}</span>
                    <i data-lucide="chevron-down" className="w-4 h-4 ml-2 text-muted-foreground dark:text-dark-muted-foreground"></i>
                </button>
                {isFilterOpen && (
                    <div className="absolute right-0 mt-2 w-full sm:w-48 bg-card dark:bg-dark-card border border-border dark:border-dark-border rounded-md shadow-lg z-10 py-1">
                        {filterOptions.map(option => (
                            <a
                                key={option}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setFilter(option);
                                    setIsFilterOpen(false);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon="dollar-sign" change="15.2%" changeType="increase" />
            <StatCard title="Deals Won" value={dealsWonCount.toString()} icon="trophy" change="5.1%" changeType="increase" />
            <StatCard title="Conversion Rate" value={`${conversionRate}%`} icon="target" change="1.8%" changeType="increase" />
            <StatCard title="Avg. Deal Size" value={`$${Math.round(averageDealSize).toLocaleString()}`} icon="briefcase" change="3.2%" changeType="decrease" />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl border border-border dark:border-dark-border min-h-[300px]">
          <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-dark-foreground">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 93%)" className="dark:stroke-dark-border" />
              <XAxis dataKey="month" stroke="hsl(220, 9%, 46%)" fontSize={12} className="dark:stroke-dark-muted-foreground" />
              <YAxis stroke="hsl(220, 9%, 46%)" fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} className="dark:stroke-dark-muted-foreground" />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(220, 16%, 96%)', className: 'dark:fill-dark-secondary'}}/>
              <Bar dataKey="revenue" fill="#22C55E" name="Revenue" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl border border-border dark:border-dark-border min-h-[300px]">
          <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-dark-foreground">Sales Funnel Conversion</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salesFunnelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="stage"
                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                fontSize={12}
              >
                {salesFunnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
               <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-muted-foreground dark:text-dark-muted-foreground text-sm">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;