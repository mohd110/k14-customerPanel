-- BookMyTabarruk: Insert coming-soon stores for multi-vendor launch
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

INSERT INTO stores (name, slug, description, short_desc, logo_url, banner_url, theme_color, is_active, sort_order)
VALUES
  (
    'Kabacchi Biryani House',
    'kabacchi',
    'Authentic Mughlai biryani, korma, and kababs — crafted for every Majlis gathering.',
    'Biryani, Korma & Kababs',
    null,
    null,
    '#000000',
    false,
    2
  ),
  (
    'Al-Bayt Crockery',
    'al-bayt-crockery',
    'Quality crockery, serving ware, and kitchen essentials for your Majlis needs.',
    'Crockery & Serveware',
    null,
    null,
    '#000000',
    false,
    3
  )
ON CONFLICT (slug) DO NOTHING;
