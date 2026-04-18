-- ============================================
-- BANU CAFE SUPABASE VERİTABANI ŞEMASI
-- ============================================

-- 1. Tabloların Oluşturulması

-- Profiller Tablosu (Supabase Auth ile Senkronize Çalışacak)
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name text,
    avatar_url text,
    role text DEFAULT 'user'::text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products Tablosu (Ürünler)
CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    image_url text,
    is_active boolean DEFAULT true,
    sales_count integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders Tablosu (Siparişler)
CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id),
    customer_name text NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status text DEFAULT 'Hazırlanıyor'::text, -- 'Tamamlandı', 'Hazırlanıyor', 'Kargoda', 'İptal'
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- 2. Trigger fonksiyonu (Yeni kayıt olanları profillere eklemek için)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    CASE WHEN new.email = 'admin@banucafe.com' THEN 'admin' ELSE 'user' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı oluşturmak
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. RLS Politikalarının Yazılması
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Profiles: Herkes kendi profilini görebilir.
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Products: Herkes ürünleri görebilir.
CREATE POLICY "Products are viewable by everyone." ON public.products FOR SELECT USING (true);
CREATE POLICY "Products editable by admin" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: Kullanıcılar kendi siparişlerini görebilir, admin hepsini görebilir.
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Orders editable by admin" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Örnek Veri Eklenmesi (İsteğe Bağlı Test İçin)
INSERT INTO public.products (name, description, price, is_active, sales_count)
VALUES 
('Banu Signature Blend', 'Yoğun çikolata ve tarçın notaları.', 185.00, true, 420),
('Ethiopia Yirgacheffe', 'Çiçeksi ve narenciye asiditesi yüksek, hafif gövdeli.', 195.00, true, 85),
('Colombia Supremo', 'Karamel tatlılığı ve dengeli asidite.', 175.00, true, 112);

-- Örnek Siparişler
-- Not: user_id değerleri foreign key olduğu için boş bırakılarak veya örnek hesap oluşturulduktan sonra doldurulması tavsiye edilir.
INSERT INTO public.orders (customer_name, total_amount, status) VALUES
('Ahmet Yılmaz', 320.00, 'Tamamlandı'),
('Elif Kaya', 145.50, 'Hazırlanıyor'),
('Caner Öz', 89.00, 'Kargoda'),
('Ayşe Demir', 450.00, 'Tamamlandı');
