import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Vehicle } from '../types';
import { CarFront, Search, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Modal } from '../components/ui/Modal';
import { Dropdown } from '../components/ui/Dropdown';
import { Pencil, Trash2 } from 'lucide-react';

const mockVehicles: Vehicle[] = [
  { id: '1', make: 'Toyota', model: 'Camry', year: 2022, license_plate: 'ABC-1234', status: 'available', daily_rate: 45, mileage: 15000, created_at: '' },
  { id: '2', make: 'Honda', model: 'Civic', year: 2023, license_plate: 'XYZ-9876', status: 'hired', daily_rate: 40, mileage: 8000, created_at: '' },
  { id: '3', make: 'Ford', model: 'Mustang', year: 2021, license_plate: 'FAST-001', status: 'maintenance', daily_rate: 85, mileage: 25000, created_at: '' },
];

export function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Vehicle, 'id' | 'created_at'>>();

  const onSubmit = async (data: Omit<Vehicle, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      const { data: newVehicle, error } = await supabase
        .from('vehicles')
        .insert([data])
        .select()
        .single();
        
      if (error) throw error;
      
      setVehicles([newVehicle, ...vehicles]);
      setIsAddModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding vehicle:', error);
      // Fallback for mock data if supabase is not connected
      const newMockVehicle: Vehicle = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        created_at: new Date().toISOString(),
      };
      setVehicles([newMockVehicle, ...vehicles]);
      setIsAddModalOpen(false);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.warn('Using mock data, Supabase fetch failed:', error);
        setVehicles(mockVehicles);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'hired': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'maintenance': return 'bg-red-100 text-red-700 ring-red-600/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
          <p className="text-slate-500">Manage your entire fleet and view their current status.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search vehicles..." className="bg-transparent text-sm outline-none w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">License Plate</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Daily Rate</th>
                <th className="px-6 py-4 font-semibold">Mileage</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading vehicles...</td></tr>
              ) : vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <CarFront className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{vehicle.make} {vehicle.model}</div>
                        <div className="text-xs text-slate-500">{vehicle.year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">{vehicle.license_plate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(vehicle.status)} capitalize`}>
                      {vehicle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium">${vehicle.daily_rate}/day</td>
                  <td className="px-6 py-4">{vehicle.mileage.toLocaleString()} mi</td>
                  <td className="px-6 py-4 text-right">
                    <Dropdown 
                      options={[
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => console.log('Edit', vehicle.id) },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => console.log('Delete', vehicle.id), variant: 'danger' }
                      ]} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Vehicle">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Make</label>
              <input 
                {...register('make', { required: 'Make is required' })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Toyota"
              />
              {errors.make && <p className="text-xs text-red-500 mt-1">{errors.make.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Model</label>
              <input 
                {...register('model', { required: 'Model is required' })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="Camry"
              />
              {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Year</label>
              <input 
                type="number"
                {...register('year', { 
                  required: 'Year is required',
                  valueAsNumber: true,
                  min: { value: 1900, message: 'Invalid year' },
                  max: { value: new Date().getFullYear() + 1, message: 'Invalid year' }
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="2023"
              />
              {errors.year && <p className="text-xs text-red-500 mt-1">{errors.year.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">License Plate</label>
              <input 
                {...register('license_plate', { required: 'License plate is required' })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="ABC-1234"
              />
              {errors.license_plate && <p className="text-xs text-red-500 mt-1">{errors.license_plate.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Daily Rate ($)</label>
              <input 
                type="number"
                step="0.01"
                {...register('daily_rate', { 
                  required: 'Daily rate is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="45.00"
              />
              {errors.daily_rate && <p className="text-xs text-red-500 mt-1">{errors.daily_rate.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Mileage</label>
              <input 
                type="number"
                {...register('mileage', { 
                  required: 'Mileage is required',
                  valueAsNumber: true,
                  min: { value: 0, message: 'Must be positive' }
                })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                placeholder="15000"
              />
              {errors.mileage && <p className="text-xs text-red-500 mt-1">{errors.mileage.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
            <select 
              {...register('status', { required: 'Status is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white"
            >
              <option value="available">Available</option>
              <option value="hired">Hired</option>
              <option value="maintenance">Maintenance</option>
            </select>
            {errors.status && <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
