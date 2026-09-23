-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Vehicles table
create type vehicle_status as enum ('available', 'hired', 'maintenance');

create table public.vehicles (
    id uuid default uuid_generate_v4() primary key,
    make text not null,
    model text not null,
    year integer not null,
    license_plate text not null unique,
    status vehicle_status default 'available',
    daily_rate decimal(10, 2) not null,
    mileage integer default 0,
    condition_notes text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Customers table
create table public.customers (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    email text not null unique,
    phone text not null,
    driver_license_number text not null unique,
    address text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Bookings table
create type payment_status as enum ('pending', 'partial', 'paid');
create type booking_status as enum ('active', 'completed', 'cancelled');

create table public.bookings (
    id uuid default uuid_generate_v4() primary key,
    vehicle_id uuid references public.vehicles(id) on delete restrict not null,
    customer_id uuid references public.customers(id) on delete restrict not null,
    start_date timestamp with time zone not null,
    expected_end_date timestamp with time zone not null,
    actual_return_date timestamp with time zone,
    total_price decimal(10, 2),
    payment_status payment_status default 'pending',
    condition_before text,
    condition_after text,
    status booking_status default 'active',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Maintenance table
create type maintenance_status as enum ('scheduled', 'in_progress', 'completed');

create table public.maintenance (
    id uuid default uuid_generate_v4() primary key,
    vehicle_id uuid references public.vehicles(id) on delete cascade not null,
    date timestamp with time zone not null,
    description text not null,
    cost decimal(10, 2),
    status maintenance_status default 'scheduled',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insert dummy data
insert into public.vehicles (make, model, year, license_plate, daily_rate, mileage) values
('Toyota', 'Camry', 2022, 'ABC-1234', 45.00, 15000),
('Honda', 'Civic', 2023, 'XYZ-9876', 40.00, 8000),
('Ford', 'Mustang', 2021, 'FAST-001', 85.00, 25000),
('Tesla', 'Model 3', 2023, 'EVS-007', 95.00, 5000),
('Chevrolet', 'Malibu', 2020, 'CHV-5544', 35.00, 45000),
('BMW', '3 Series', 2022, 'BMW-9900', 70.00, 12000);

insert into public.customers (name, email, phone, driver_license_number, address) values
('John Doe', 'john@example.com', '555-0101', 'DL12345678', '123 Main St, City, ST 12345'),
('Jane Smith', 'jane.smith@example.com', '555-0202', 'DL87654321', '456 Oak Ave, Town, ST 67890'),
('Michael Johnson', 'mjohnson@example.com', '555-0303', 'DL55556666', '789 Pine Rd, Village, ST 13579'),
('Emily Davis', 'emilyd@example.com', '555-0404', 'DL99990000', '321 Elm St, City, ST 24680');
