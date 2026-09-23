import { useState } from 'react';
import { CarFront, Users, CalendarDays, TrendingUp } from 'lucide-react';
import { BookingModal } from '../components/bookings/BookingModal';

const stats = [
  { name: 'Total Fleet', value: '24', icon: CarFront, trend: '+2 this month', color: 'bg-blue-500' },
  { name: 'Active Bookings', value: '12', icon: CalendarDays, trend: '4 returning today', color: 'bg-emerald-500' },
  { name: 'Total Customers', value: '156', icon: Users, trend: '+15 this week', color: 'bg-violet-500' },
  { name: 'Revenue (MTD)', value: '$12,450', icon: TrendingUp, trend: '+14% vs last month', color: 'bg-amber-500' },
];

export function Dashboard() {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening with your fleet today.</p>
        </div>
        <button 
          onClick={() => setIsBookingModalOpen(true)}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          + New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md group">
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} text-white shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-slate-500 bg-slate-50 px-2 py-1 rounded-md w-full text-center">
                  {stat.trend}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Recent Bookings</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            [Recent Bookings Table Placeholder]
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Fleet Status Overview</h2>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
            [Chart Placeholder]
          </div>
        </div>
      </div>
      <BookingModal 
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => {
          setIsBookingModalOpen(false);
          // Optional: refresh dashboard data if there was any real data fetching
        }}
      />
    </div>
  );
}
