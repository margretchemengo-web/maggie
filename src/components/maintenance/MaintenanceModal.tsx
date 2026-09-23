import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Modal } from '../ui/Modal';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type MaintenanceFormData = {
  vehicle_id: string;
  date: string;
  description: string;
  cost: number;
};

export function MaintenanceModal({ isOpen, onClose, onSuccess }: MaintenanceModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, reset } = useForm<MaintenanceFormData>();

  useEffect(() => {
    if (isOpen) {
      fetchVehicles();
      reset();
      setError('');
    }
  }, [isOpen]);

  const fetchVehicles = async () => {
    try {
      const { data } = await supabase.from('vehicles').select('*');
      if (data) setVehicles(data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  const onSubmit = async (data: MaintenanceFormData) => {
    setLoading(true);
    setError('');
    try {
      const { error: insertError } = await supabase
        .from('maintenance')
        .insert([{
          ...data,
          status: 'scheduled'
        }]);

      if (insertError) throw insertError;
      
      // Update vehicle status
      await supabase.from('vehicles').update({ status: 'maintenance' }).eq('id', data.vehicle_id);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log Maintenance">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>
        )}
        
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
          <input 
            type="datetime-local"
            {...register('date', { required: 'Date is required' })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            rows={3}
            {...register('description', { required: 'Description is required' })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Describe the maintenance work..."
          ></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Cost ($)</label>
          <input 
            type="number" step="0.01"
            {...register('cost', { required: 'Cost is required', valueAsNumber: true })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost.message}</p>}
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
            {loading ? 'Saving...' : 'Log Maintenance'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
