-- ─────────────────────────────────────────────
-- DEMO DATA — 3 Downtown Davis Restaurants
-- Run AFTER creating the auth users manually in Supabase dashboard,
-- then substitute the UUIDs below.
-- ─────────────────────────────────────────────

-- Create a demo admin user profile (run after creating user in Supabase Auth)
-- UPDATE public.profiles SET role = 'admin' WHERE id = '<your-admin-user-uuid>';

-- ─── Restaurant 1: Woodstock's Pizza ────────────────
insert into public.restaurants (id, user_id, name, address, logo_url, cuisine, hours, is_active)
values (
  'a1b2c3d4-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001', -- placeholder user_id
  'Woodstock''s Pizza Davis',
  '219 G St, Davis, CA 95616',
  null,
  'Pizza',
  '{
    "monday": {"open": "11:00", "close": "22:00"},
    "tuesday": {"open": "11:00", "close": "22:00"},
    "wednesday": {"open": "11:00", "close": "22:00"},
    "thursday": {"open": "11:00", "close": "23:00"},
    "friday": {"open": "11:00", "close": "23:00"},
    "saturday": {"open": "11:00", "close": "23:00"},
    "sunday": {"open": "11:00", "close": "22:00"}
  }',
  true
);

insert into public.menu_items (restaurant_id, name, description, price, category) values
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Pepperoni Pizza (12")', 'Classic pepperoni with house tomato sauce and mozzarella', 16.99, 'Pizza'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Veggie Supreme Pizza (12")', 'Bell peppers, mushrooms, onions, olives, tomatoes', 17.99, 'Pizza'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'BBQ Chicken Pizza (12")', 'Grilled chicken, BBQ sauce, red onion, cilantro', 18.99, 'Pizza'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Garlic Bread', 'Fresh baked with garlic butter and parmesan', 5.99, 'Sides'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Caesar Salad', 'Romaine, croutons, parmesan, house Caesar dressing', 8.99, 'Salads'),
  ('a1b2c3d4-0000-0000-0000-000000000001', 'Soda (20oz)', 'Pepsi, Diet Pepsi, Sierra Mist', 2.49, 'Drinks');

-- ─── Restaurant 2: Sam's Mediterranean ──────────────
insert into public.restaurants (id, user_id, name, address, logo_url, cuisine, hours, is_active)
values (
  'a1b2c3d4-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000002',
  'Sam''s Mediterranean',
  '301 B St, Davis, CA 95616',
  null,
  'Mediterranean',
  '{
    "monday": {"open": "10:00", "close": "21:00"},
    "tuesday": {"open": "10:00", "close": "21:00"},
    "wednesday": {"open": "10:00", "close": "21:00"},
    "thursday": {"open": "10:00", "close": "21:00"},
    "friday": {"open": "10:00", "close": "21:30"},
    "saturday": {"open": "10:00", "close": "21:30"},
    "sunday": {"closed": true}
  }',
  true
);

insert into public.menu_items (restaurant_id, name, description, price, category) values
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Falafel Plate', 'House-made falafel with hummus, pita, salad, and tzatziki', 13.99, 'Plates'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Chicken Shawarma Wrap', 'Marinated chicken, garlic sauce, tomato, pickles in warm pita', 12.99, 'Wraps'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Lamb Gyro', 'Slow-roasted lamb, onion, tomato, tzatziki in warm pita', 13.99, 'Wraps'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Hummus & Pita', 'Creamy house hummus with warm pita and olive oil drizzle', 7.99, 'Appetizers'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Greek Salad', 'Cucumber, tomato, Kalamata olives, feta, red onion', 9.99, 'Salads'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Baklava', 'House-made with pistachios and honey', 4.99, 'Desserts'),
  ('a1b2c3d4-0000-0000-0000-000000000002', 'Mango Lassi', 'Fresh mango blended with yogurt and cardamom', 4.49, 'Drinks');

-- ─── Restaurant 3: Davis Boba & Poke ─────────────────
insert into public.restaurants (id, user_id, name, address, logo_url, cuisine, hours, is_active)
values (
  'a1b2c3d4-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000003',
  'Davis Boba & Poke',
  '231 E St, Davis, CA 95616',
  null,
  'Asian Fusion',
  '{
    "monday": {"open": "11:00", "close": "22:00"},
    "tuesday": {"open": "11:00", "close": "22:00"},
    "wednesday": {"open": "11:00", "close": "22:00"},
    "thursday": {"open": "11:00", "close": "22:00"},
    "friday": {"open": "11:00", "close": "23:00"},
    "saturday": {"open": "10:00", "close": "23:00"},
    "sunday": {"open": "10:00", "close": "21:00"}
  }',
  true
);

insert into public.menu_items (restaurant_id, name, description, price, category) values
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Ahi Tuna Poke Bowl', 'Sushi-grade ahi, edamame, cucumber, avocado, sesame-soy over rice', 15.99, 'Poke Bowls'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Salmon Poke Bowl', 'Fresh salmon, mango, cucumber, wonton crisps, spicy mayo', 15.99, 'Poke Bowls'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Tofu Poke Bowl (V)', 'Seasoned tofu, mixed greens, avocado, pickled ginger, ponzu', 13.99, 'Poke Bowls'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Classic Milk Tea', 'House black tea with your choice of toppings', 5.99, 'Boba'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Taro Milk Tea', 'Creamy taro blend with boba pearls', 6.49, 'Boba'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Matcha Latte', 'Ceremonial grade matcha, oat milk, boba optional', 6.49, 'Boba'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Edamame', 'Lightly salted steamed edamame', 3.99, 'Snacks'),
  ('a1b2c3d4-0000-0000-0000-000000000003', 'Mochi Ice Cream (3pc)', 'Strawberry, mango, green tea', 5.99, 'Desserts');
