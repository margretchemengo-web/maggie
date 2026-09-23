import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { BookingModal } from '../components/bookings/BookingModal';

import { CalendarDays, Search, Plus, MoreVertical, ArrowRight, Pencil, Trash2 } from 'lucide-react';
import { Dropdown } from '../components/ui/Dropdown';

const mockBookings: any[] = [
  { 
    id: '1', 
    start_date: '2026-09-20T10:00:00Z', 
    expected_end_date: '2026-09-25T10:00:00Z', 
    status: 'active',
    total_price: 225,
    payment_status: 'paid',
    vehicles: { make: 'Toyota', model: 'Camry', license_plate: 'ABC-1234' },
    customers: { name: 'John Doe', phone: '555-0101' }
  },
  { 
    id: '2', 
    start_date: '2026-09-18T14:00:00Z', 
    expected_end_date: '2026-09-20T14:00:00Z', 
    actual_return_date: '2026-09-20T13:30:00Z',
    status: 'completed',
    total_price: 80,
    payment_status: 'paid',
    vehicles: { make: 'Honda', model: 'Civic', license_plate: 'XYZ-9876' },
    customers: { name: 'Jane Smith', phone: '555-0202' }
  }
];

export function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicles (make, model, license_plate),
          customers (name, phone)
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.warn('Using mock data, Supabase fetch failed:', error);
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'completed': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'cancelled': return 'bg-red-100 text-red-700 ring-red-600/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-600/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-emerald-600';
      case 'partial': return 'text-amber-600';
      case 'pending': return 'text-red-600';
      default: return 'text-slate-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500">Manage vehicle rentals, returns, and track payments.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Booking
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search bookings..." className="bg-transparent text-sm outline-none w-64" />
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">All</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Active</button>
            <button className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Completed</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer & Vehicle</th>
                <th className="px-6 py-4 font-semibold">Duration</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading bookings...</td></tr>
              ) : bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{booking.customers?.name}</div>
                        <div className="text-xs text-slate-500">
                          {booking.vehicles?.make} {booking.vehicles?.model} ({booking.vehicles?.license_plate})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="font-medium">{new Date(booking.expected_end_date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(booking.status)} capitalize`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900">${booking.total_price}</div>
                    <div className={`text-xs font-semibold capitalize ${getPaymentStatusColor(booking.payment_status)}`}>
                      {booking.payment_status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Dropdown 
                      options={[
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => console.log('Edit', booking.id) },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => console.log('Delete', booking.id), variant: 'danger' }
                      ]} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <BookingModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchBookings();
        }}
      />
    </div>
  );
}
