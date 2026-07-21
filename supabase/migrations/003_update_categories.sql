-- ============================================================
-- 003_update_categories.sql
-- UPDATE CATEGORIES TANPA NGAPUS DATA TRANSAKSI
-- AMAN DIJALANKAN BERKALI-KALI
-- ============================================================

-- 1. UPDATE CATEGORIES (AMAN — PAKE ON CONFLICT)
insert into categories (id, name, icon, ramp, type, sort_order) values
  ('gaji','Gaji','ti-cash','green','inc',1),
  ('freelance','Cuan Sampingan','ti-briefcase','green','inc',2),
  ('uangjajan','Uang Jajan','ti-gift-card','green','inc',3),
  ('investasi','Hasil Investasi','ti-chart-line','green','inc',4),
  ('makan','Makan','ti-basket','coral','exp',10),
  ('jajan','Jajan','ti-cup','coral','exp',11),
  ('bahanmakanan','Bahan Makanan','ti-shopping-cart','coral','exp',12),
  ('ojol','Transportasi & Ojol','ti-bus','amber','exp',13),
  ('bensin','Bensin & Parkir','ti-gas-station','amber','exp',14),
  ('kos','Kos & Sewa','ti-home','pink','exp',15),
  ('tagihan','Listrik & Air','ti-flame','amber','exp',16),
  ('internet','Internet','ti-wifi','amber','exp',17),
  ('langganan','Langganan Apps','ti-device-tv','purple','exp',18),
  ('cicilan','Cicilan & Pinjol','ti-credit-card','green','exp',19),
  ('nongkrong','Nongkrong & Hangout','ti-glass-cocktail','purple','exp',20),
  ('fashion','Fashion & Style','ti-hanger','pink','exp',21),
  ('skincare','Skincare & Glow Up','ti-flower','teal','exp',22),
  ('selfreward','Self Reward','ti-heart','pink','exp',23),
  ('healing','Healing & Liburan','ti-beach','blue','exp',24),
  ('hewan','Peliharaan','ti-dog','amber','exp',25),
  ('orangtua','Kirim ke Ortu','ti-heart-handshake','blue','exp',26),
  ('hadiah','Hadiah & Kado','ti-gift','purple','both',27),
  ('lainnya','Lainnya','ti-dots','pink','both',999)
on conflict (id) do update set
  name = excluded.name,
  icon = excluded.icon,
  ramp = excluded.ramp,
  type = excluded.type,
  sort_order = excluded.sort_order;

-- 2. VERIFIKASI (CEK DATA MASIH ADA)
select '✅ CATEGORIES UPDATED!' as status;
select count(*) as total_categories from categories;
select count(*) as total_transactions from transactions;  -- HARUSNYA TETAP SAMA