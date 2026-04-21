-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('customer', 'restaurant', 'driver', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);
-- Admins can view all profiles
create policy "Admins can view all profiles" on public.profiles
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'role', 'customer'));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- RESTAURANTS
-- ─────────────────────────────────────────────
create table public.restaurants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  address text not null,
  logo_url text,
  cuisine text not null,
  hours jsonb not null default '{}',
  is_active boolean default false,
  stripe_subscription_id text,
  created_at timestamptz default now()
);
alter table public.restaurants enable row level security;
create policy "Anyone can view active restaurants" on public.restaurants
  for select using (is_active = true);
create policy "Owners can manage their restaurant" on public.restaurants
  for all using (auth.uid() = user_id);
create policy "Admins can manage all restaurants" on public.restaurants
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- MENU ITEMS
-- ─────────────────────────────────────────────
create table public.menu_items (
  id uuid default uuid_generate_v4() primary key,
  restaurant_id uuid references public.restaurants on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  image_url text,
  category text not null default 'General',
  is_available boolean default true,
  created_at timestamptz default now()
);
alter table public.menu_items enable row level security;
create policy "Anyone can view available menu items" on public.menu_items
  for select using (is_available = true);
create policy "Restaurant owners can manage menu items" on public.menu_items
  for all using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.user_id = auth.uid()
    )
  );
create policy "Admins can manage all menu items" on public.menu_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- CUSTOMERS
-- ─────────────────────────────────────────────
create table public.customers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  name text not null,
  address text,
  phone text,
  created_at timestamptz default now()
);
alter table public.customers enable row level security;
create policy "Customers can manage their own record" on public.customers
  for all using (auth.uid() = user_id);
create policy "Admins can view all customers" on public.customers
  for select using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- DRIVERS
-- ─────────────────────────────────────────────
create table public.drivers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade unique not null,
  name text not null,
  ucd_email text not null,
  student_id text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'active', 'rejected')),
  created_at timestamptz default now()
);
alter table public.drivers enable row level security;
create policy "Drivers can view their own record" on public.drivers
  for select using (auth.uid() = user_id);
create policy "Drivers can update their own record" on public.drivers
  for update using (auth.uid() = user_id);
create policy "Anyone can insert driver application" on public.drivers
  for insert with check (auth.uid() = user_id);
create policy "Admins can manage all drivers" on public.drivers
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- ORDERS
-- ─────────────────────────────────────────────
create table public.orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references public.customers on delete restrict not null,
  restaurant_id uuid references public.restaurants on delete restrict not null,
  driver_id uuid references public.drivers on delete set null,
  status text not null default 'placed'
    check (status in ('placed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled')),
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 3.99,
  tip numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  delivery_address text not null,
  special_instructions text,
  stripe_payment_intent_id text,
  created_at timestamptz default now()
);
alter table public.orders enable row level security;
create policy "Customers can view their own orders" on public.orders
  for select using (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = auth.uid()
    )
  );
create policy "Customers can insert orders" on public.orders
  for insert with check (
    exists (
      select 1 from public.customers c
      where c.id = customer_id and c.user_id = auth.uid()
    )
  );
create policy "Restaurants can view their orders" on public.orders
  for select using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.user_id = auth.uid()
    )
  );
create policy "Restaurants can update order status" on public.orders
  for update using (
    exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id and r.user_id = auth.uid()
    )
  );
create policy "Drivers can view and update assigned orders" on public.orders
  for all using (
    exists (
      select 1 from public.drivers d
      where d.id = driver_id and d.user_id = auth.uid()
    )
  );
create policy "Admins can manage all orders" on public.orders
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- ORDER ITEMS
-- ─────────────────────────────────────────────
create table public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade not null,
  menu_item_id uuid references public.menu_items on delete restrict not null,
  quantity int not null check (quantity > 0),
  price numeric(10,2) not null,
  created_at timestamptz default now()
);
alter table public.order_items enable row level security;
create policy "Order items visible to order participants" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      left join public.customers c on c.id = o.customer_id
      left join public.restaurants r on r.id = o.restaurant_id
      where o.id = order_id
        and (c.user_id = auth.uid() or r.user_id = auth.uid())
    )
  );
create policy "Insert order items with valid order" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_id and c.user_id = auth.uid()
    )
  );
create policy "Admins can manage all order items" on public.order_items
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- SHIFTS
-- ─────────────────────────────────────────────
create table public.shifts (
  id uuid default uuid_generate_v4() primary key,
  driver_id uuid references public.drivers on delete cascade not null,
  date date not null,
  start_time time not null,
  end_time time,
  hourly_rate numeric(10,2) not null,
  created_at timestamptz default now()
);
alter table public.shifts enable row level security;
create policy "Drivers can view their own shifts" on public.shifts
  for select using (
    exists (
      select 1 from public.drivers d
      where d.id = driver_id and d.user_id = auth.uid()
    )
  );
create policy "Admins can manage all shifts" on public.shifts
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- DELIVERIES
-- ─────────────────────────────────────────────
create table public.deliveries (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders on delete cascade unique not null,
  driver_id uuid references public.drivers on delete restrict not null,
  shift_id uuid references public.shifts on delete restrict not null,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);
alter table public.deliveries enable row level security;
create policy "Drivers can view and update their deliveries" on public.deliveries
  for all using (
    exists (
      select 1 from public.drivers d
      where d.id = driver_id and d.user_id = auth.uid()
    )
  );
create policy "Customers can view their deliveries" on public.deliveries
  for select using (
    exists (
      select 1 from public.orders o
      join public.customers c on c.id = o.customer_id
      where o.id = order_id and c.user_id = auth.uid()
    )
  );
create policy "Admins can manage all deliveries" on public.deliveries
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- ─────────────────────────────────────────────
-- PLATFORM SETTINGS
-- ─────────────────────────────────────────────
create table public.platform_settings (
  id int primary key default 1 check (id = 1), -- singleton row
  driver_hourly_rate numeric(10,2) not null default 18.00,
  delivery_fee numeric(10,2) not null default 3.99,
  updated_at timestamptz default now()
);
alter table public.platform_settings enable row level security;
create policy "Anyone can read platform settings" on public.platform_settings
  for select using (true);
create policy "Admins can update platform settings" on public.platform_settings
  for all using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

insert into public.platform_settings (id, driver_hourly_rate, delivery_fee)
values (1, 18.00, 3.99)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- ENABLE REALTIME
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.deliveries;
