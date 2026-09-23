import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const mockVehicles = [
  { id: '1', make: 'Toyota', model: 'Camry', license_plate: 'ABC-1234' },
  { id: '2', make: 'Honda', model: 'Civic', license_plate: 'XYZ-9876' }
];

const mockCustomers = [
  { id: '1', name: 'John Doe' },
  { id: '2', name: 'Jane Smith' }
];

type BookingFormData = {
  vehicle_id: string;
  customer_id: string;
  start_date: string;
  expected_end_date: string;
  total_price: number;
};

export function BookingModal({ isOpen, onClose, onSuccess }: BookingModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>();

  useEffect(() => {
    if (isOpen) {
      fetchData();
      reset();
      setError('');
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [vehiclesRes, customersRes] = await Promise.all([
        supabase.from('vehicles').select('*').eq('status', 'available'),
        supabase.from('customers').select('*')
      ]);
      
      if (vehiclesRes.error) throw vehiclesRes.error;
      if (customersRes.error) throw customersRes.error;

      setVehicles(vehiclesRes.data || []);
      setCustomers(customersRes.data || []);
    } catch (err) {
      console.error('Failed to fetch data from Supabase, using mock data:', err);
      setVehicles(mockVehicles);
      setCustomers(mockCustomers);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase
        .from('bookings')
        .insert([{
          ...data,
          status: 'active',
          payment_status: 'pending'
        }]);

      if (insertError) throw insertError;
      
      // Also update vehicle status
      await supabase.from('vehicles').update({ status: 'hired' }).eq('id', data.vehicle_id);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Booking">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
          <select 
            {...register('customer_id', { required: 'Customer is required' })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select a customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
          <select 
            {...register('vehicle_id', { required: 'Vehicle is required' })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">Select a vehicle</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.make} {v.model} ({v.license_plate})</option>
            ))}
          </select>
          {errors.vehicle_id && <p className="text-red-500 text-xs mt-1">{errors.vehicle_id.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input 
              type="datetime-local"
              {...register('start_date', { required: 'Start date is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input 
              type="datetime-local"
              {...register('expected_end_date', { required: 'End date is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {errors.expected_end_date && <p className="text-red-500 text-xs mt-1">{errors.expected_end_date.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Total Price ($)</label>
          <input 
            type="number" step="0.01"
            {...register('total_price', { required: 'Total price is required', valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.total_price && <p className="text-red-500 text-xs mt-1">{errors.total_price.message}</p>}
        </div>

        <div className="pt-4 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
