import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Customer } from '../types';
import { Search, Plus, MoreVertical, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { Dropdown } from '../components/ui/Dropdown';
import { useForm } from 'react-hook-form';
import { Modal } from '../components/ui/Modal';

const mockCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-0101', driver_license_number: 'DL12345678', address: '123 Main St, City', created_at: '2026-09-01T10:00:00Z' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-0202', driver_license_number: 'DL87654321', address: '456 Oak Ave, Town', created_at: '2026-09-05T14:30:00Z' },
];

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Customer, 'id' | 'created_at'>>();

  const onSubmit = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    setIsSubmitting(true);
    try {
      const { data: newCustomer, error } = await supabase
        .from('customers')
        .insert([data])
        .select()
        .single();
        
      if (error) throw error;
      
      setCustomers([newCustomer, ...customers]);
      setIsAddModalOpen(false);
      reset();
    } catch (error) {
      console.error('Error adding customer:', error);
      // Fallback for mock data if supabase is not connected
      const newMockCustomer: Customer = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        created_at: new Date().toISOString(),
      };
      setCustomers([newMockCustomer, ...customers]);
      setIsAddModalOpen(false);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchCustomers() {
      try {
        const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        setCustomers(data || []);
      } catch (error) {
        console.warn('Using mock data, Supabase fetch failed:', error);
        setCustomers(mockCustomers);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-slate-500">Manage your customer database and view their rental history.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search customers..." className="bg-transparent text-sm outline-none w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Driver's License</th>
                <th className="px-6 py-4 font-semibold">Member Since</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading customers...</td></tr>
              ) : customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="font-medium text-slate-900">{customer.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">{customer.driver_license_number}</td>
                  <td className="px-6 py-4">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <Dropdown 
                      options={[
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => console.log('Edit', customer.id) },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => console.log('Delete', customer.id), variant: 'danger' }
                      ]} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              {...register('name', { required: 'Name is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="John Doe"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="john@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input 
              {...register('phone', { required: 'Phone is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="+1 (555) 000-0000"
            />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Driver's License</label>
            <input 
              {...register('driver_license_number', { required: 'Driver license is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="DL12345678"
            />
            {errors.driver_license_number && <p className="text-xs text-red-500 mt-1">{errors.driver_license_number.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
            <textarea 
              {...register('address', { required: 'Address is required' })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              placeholder="123 Main St, City, State"
              rows={3}
            />
            {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address.message}</p>}
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
              {isSubmitting ? 'Adding...' : 'Add Customer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
