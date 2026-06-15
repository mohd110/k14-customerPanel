-- ============================================================
-- Seed/Update Wali Baba Foods Pamphlet Menu Items
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

INSERT INTO public.products (id, name, description, price, is_available) VALUES
-- ── BIRYANI ──
('9170d644-5efd-4147-a094-f0f9c50c55cc', 'Chicken Biryani', 'Aromatic basmati rice slow-cooked with tender chicken, whole spices, caramelised onions and saffron.', 160, TRUE),
('240ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Tikka Rice', 'Flavorful basmati rice served with chunks of roasted chicken tikka and spiced gravies.', 240, TRUE),
('250ed7aa-80c8-4e2e-913e-247b88a8d599', 'Mutton Biryani', 'Rich basmati rice slow-cooked with tender mutton pieces, saffron, and aromatic spices.', 250, TRUE),
('130ed7aa-80c8-4e2e-913e-247b88a8d599', 'Biryani Rice', 'Plain aromatic basmati rice cooked in biryani stock and saffron.', 130, TRUE),

-- ── GRAVY ──
('b01ed7aa-80c8-4e2e-913e-247b88a8d599', 'Butter Chicken', 'Classic murgh makhani in rich, buttery tomato sauce with aromatic spices and fresh cream.', 250, TRUE),
('b02ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Stew', 'Comforting, lightly spiced chicken gravy cooked with onions and whole garam masala.', 250, TRUE),
('b03ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Korma', 'Tender chicken slow-cooked in a rich yogurt and cashew-based curry with cardamom flavor.', 250, TRUE),
('b04ed7aa-80c8-4e2e-913e-247b88a8d599', 'Mutton Rogan Josh', 'Kashmiri style slow-cooked mutton in a rich red onion and tomato gravy flavored with fennel.', 250, TRUE),

-- ── BREADS ──
('b05ed7aa-80c8-4e2e-913e-247b88a8d599', 'Rumali Roti', 'Ultra-thin, soft flatbread cooked on an inverted iron griddle.', 15, TRUE),
('b06ed7aa-80c8-4e2e-913e-247b88a8d599', 'Tandoori Roti (Butter)', 'Whole wheat flatbread baked in clay tandoor and brushed with fresh butter.', 25, TRUE),
('b07ed7aa-80c8-4e2e-913e-247b88a8d599', 'Lachha Paratha', 'Layered whole wheat flatbread crispy outside and soft inside.', 30, TRUE),
('b08ed7aa-80c8-4e2e-913e-247b88a8d599', 'Garlic Naan (Butter)', 'Fine flour leavened flatbread topped with minced garlic and butter, baked in tandoor.', 45, TRUE),

-- ── FRY ──
('b09ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Leg / Chest Fry', 'Crispy deep-fried chicken leg or chest piece marinated in red chili paste and spices.', 140, TRUE),
('b10ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Lollipop (4pcs)', 'Crispy fried chicken wings shaped like lollipops, coated in a spicy batter.', 180, TRUE),
('b11ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Tikka Fry (6pcs)', 'Spiced chicken chunks pan-fried with green chilies, onions, and chat masala.', 220, TRUE),
('b12ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Kaleji Fry', 'Spicy chicken liver dry fry with ginger, garlic, and fresh green herbs.', 130, TRUE),

-- ── KEBABS ──
('b13ed7aa-80c8-4e2e-913e-247b88a8d599', 'Special Galouti Kebab', 'Melt-in-mouth minced mutton patties cooked with over 150 aromatic spices.', 299, TRUE),
('b14ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Shami Kebab', 'Soft spiced chicken patties made with lentils, fried until golden.', 180, TRUE),
('b15ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Adana Kebab', 'Long hand-minced chicken skewers seasoned with red bell peppers and spices, grilled.', 250, TRUE),

-- ── TANDOOR ──
('b16ed7aa-80c8-4e2e-913e-247b88a8d599', 'Paneer Malai Tikka', 'Creamy cubes of cottage cheese marinated in malai, grilled to perfection in the tandoor.', 349, TRUE),
('b17ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Tikka', 'Classic spiced boneless chicken chunks grilled on skewers in clay oven.', 250, TRUE),
('b18ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Aatishi', 'Fiery whole chicken marinated in red spices, cooked in a clay tandoor until perfectly charred.', 300, TRUE),
('b19ed7aa-80c8-4e2e-913e-247b88a8d599', 'Chicken Tandoori (Full)', 'Full tandoori chicken marinated in yogurt and Indian spices, roasted on skewers.', 500, TRUE),

-- ── DESSERTS & BEVERAGES ──
('b20ed7aa-80c8-4e2e-913e-247b88a8d599', 'Special Sweet Lassi', 'Thick churned yogurt drink sweetened and garnished with malai and dry fruits.', 50, TRUE),
('b21ed7aa-80c8-4e2e-913e-247b88a8d599', 'Zafrani Kheer', 'Rich slow-cooked rice pudding flavored with saffron, cardamom, and sliced almonds.', 70, TRUE),
('b22ed7aa-80c8-4e2e-913e-247b88a8d599', 'Shahi Tukda', 'Crispy fried bread slices soaked in saffron sugar syrup and topped with rabri.', 80, TRUE),

-- ── COMBOS ──
('b23ed7aa-80c8-4e2e-913e-247b88a8d599', 'Family Combo Meal', 'Includes 1 Mutton Korma, 1 Butter Chicken, 2 Butter Tandoori/Rumali Roti, 2 Chicken Biryani, and 1 Salad Raita.', 1111, TRUE),
('b24ed7aa-80c8-4e2e-913e-247b88a8d599', 'Friends Combo Meal', 'Includes 2 Chicken Biryani, 4 Tandoori/Rumali Roti, 1 Butter Chicken, and 2 Soft Drinks.', 599, TRUE)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  is_available = EXCLUDED.is_available;
