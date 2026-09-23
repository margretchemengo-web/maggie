import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MaintenanceModal } from '../components/maintenance/MaintenanceModal';
import { Wrench, Search, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Dropdown } from '../components/ui/Dropdown';

const mockMaintenance: any[] = [
  { id: '1', date: '2026-09-22T10:00:00Z', description: 'Oil change and tire rotation', cost: 150, status: 'scheduled', vehicles: { make: 'Toyota', model: 'Camry', license_plate: 'ABC-1234' } },
  { id: '2', date: '2026-09-15T09:00:00Z', description: 'Brake pad replacement', cost: 320, status: 'completed', vehicles: { make: 'Ford', model: 'Mustang', license_plate: 'FAST-001' } },
];

export function Maintenance() {
  const [maintenanceRecords, setMaintenanceRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMaintenance = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('maintenance')
        .select(`
          *,
          vehicles (make, model, license_plate)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.warn('Using mock data, Supabase fetch failed:', error);
      setMaintenanceRecords(mockMaintenance);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-100 text-emerald-700 ring-emerald-600/20';
      case 'in_progress': return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'scheduled': return 'bg-amber-100 text-amber-700 ring-amber-600/20';
      default: return 'bg-slate-100 text-slate-700 ring-slate-600/20';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
          <p className="text-slate-500">Track vehicle repairs, routine maintenance, and associated costs.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Log Maintenance
        </button>
      </div>

      <div className="rounded-2xl bg-white shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 focus-within:ring-2 focus-within:ring-primary-500/50">
            <Search className="h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search records..." className="bg-transparent text-sm outline-none w-64" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Vehicle</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Cost</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading records...</td></tr>
              ) : maintenanceRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <Wrench className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{record.vehicles?.make} {record.vehicles?.model}</div>
                        <div className="text-xs text-slate-500">{record.vehicles?.license_plate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 max-w-xs truncate">{record.description}</td>
                  <td className="px-6 py-4 font-medium">${record.cost}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(record.status)} capitalize`}>
                      {record.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Dropdown 
                      options={[
                        { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => console.log('Edit', record.id) },
                        { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, onClick: () => console.log('Delete', record.id), variant: 'danger' }
                      ]} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <MaintenanceModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchMaintenance();
        }}
      />
    </div>
  );
}
