export type UserRole = 'customer' | 'restaurant' | 'driver' | 'admin'

export interface Restaurant {
  id: string
  user_id: string
  name: string
  address: string
  logo_url: string | null
  cuisine: string
  hours: RestaurantHours
  is_active: boolean
  stripe_subscription_id: string | null
  created_at: string
}

export interface RestaurantHours {
  monday?: DayHours
  tuesday?: DayHours
  wednesday?: DayHours
  thursday?: DayHours
  friday?: DayHours
  saturday?: DayHours
  sunday?: DayHours
}

export interface DayHours {
  open: string
  close: string
  closed?: boolean
}

export interface MenuItem {
  id: string
  restaurant_id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string
  is_available: boolean
  created_at: string
}

export interface Customer {
  id: string
  user_id: string
  name: string
  address: string | null
  phone: string | null
  created_at: string
}

export type OrderStatus = 'placed' | 'preparing' | 'ready_for_pickup' | 'out_for_delivery' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  customer_id: string
  restaurant_id: string
  driver_id: string | null
  status: OrderStatus
  subtotal: number
  delivery_fee: number
  tip: number
  total: number
  delivery_address: string
  special_instructions: string | null
  created_at: string
  restaurant?: Restaurant
  customer?: Customer
  driver?: Driver
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  price: number
  menu_item?: MenuItem
}

export type DriverStatus = 'pending' | 'approved' | 'active' | 'rejected'

export interface Driver {
  id: string
  user_id: string
  name: string
  ucd_email: string
  student_id: string
  status: DriverStatus
  created_at: string
}

export interface Shift {
  id: string
  driver_id: string
  date: string
  start_time: string
  end_time: string | null
  hourly_rate: number
  created_at: string
  driver?: Driver
}

export interface Delivery {
  id: string
  order_id: string
  driver_id: string
  shift_id: string
  picked_up_at: string | null
  delivered_at: string | null
  order?: Order
}

export interface CartItem {
  menu_item: MenuItem
  quantity: number
}
