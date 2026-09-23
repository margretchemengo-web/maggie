export type VehicleStatus = 'available' | 'hired' | 'maintenance';
export type PaymentStatus = 'pending' | 'partial' | 'paid';
export type BookingStatus = 'active' | 'completed' | 'cancelled';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: VehicleStatus;
  daily_rate: number;
  mileage: number;
  condition_notes?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  driver_license_number: string;
  address: string;
  created_at: string;
}

export interface Booking {
  id: string;
  vehicle_id: string;
  customer_id: string;
  start_date: string;
  expected_end_date: string;
  actual_return_date?: string;
  total_price?: number;
  payment_status: PaymentStatus;
  condition_before?: string;
  condition_after?: string;
  status: BookingStatus;
  created_at: string;
  
  // Joins
  vehicles?: Vehicle;
  customers?: Customer;
}
