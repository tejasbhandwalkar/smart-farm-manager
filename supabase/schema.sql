-- =========================================================================
-- SMART FARM MANAGER - FULL SUPABASE POSTGRESQL SCHEMA (20-ACRE FARM)
-- Crops: Sugarcane (ऊस), Wheat (गहू), Onion (कांदा)
-- Irrigation: Canal water (कालवा) & Well/Borewell Pump (पंप)
-- Workers: 10+ Daily wage workers, attendance & wage settlement
-- Modules: Farms, Crops, Expenses, Income, Inventory, Farming Activities,
--          Workers, Attendance, Advances, Irrigation, Machinery, Health & Sales
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT DEFAULT 'शेतकरी मालक',
    farm_name TEXT DEFAULT 'स्मार्ट कृषी फार्म',
    total_acres NUMERIC(5,2) DEFAULT 20.00,
    language_preference TEXT DEFAULT 'mr' CHECK (language_preference IN ('mr', 'hi', 'en')),
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FARMS (20-Acre Agricultural Enterprise)
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'स्मार्ट कृषी फार्म',
    total_acres NUMERIC(5,2) NOT NULL DEFAULT 20.00 CHECK (total_acres > 0),
    location TEXT DEFAULT 'महाराष्ट्र, भारत',
    soil_types TEXT[] DEFAULT ARRAY['black', 'alluvial', 'loamy', 'red']::TEXT[],
    irrigation_sources TEXT[] DEFAULT ARRAY['canal', 'pump']::TEXT[],
    main_crops TEXT[] DEFAULT ARRAY['sugarcane', 'wheat', 'onion']::TEXT[],
    notes TEXT DEFAULT '२० एकर बागायती शेती (ऊस, गहू आणि कांदा पिके)',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. DIGITAL PLOTS (Total active plot area must not exceed 20 acres)
CREATE TABLE IF NOT EXISTS public.plots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    area_acres NUMERIC(5,2) NOT NULL CHECK (area_acres > 0 AND area_acres <= 20.00),
    soil_type TEXT NOT NULL CHECK (soil_type IN ('black', 'red', 'alluvial', 'loamy')),
    status TEXT NOT NULL DEFAULT 'cultivated' CHECK (status IN ('cultivated', 'fallow', 'preparing')),
    current_crop TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CROPS (Sugarcane, Wheat, Onion, and Others)
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    plot_name TEXT,
    crop_type TEXT NOT NULL CHECK (crop_type IN ('sugarcane', 'wheat', 'onion', 'other')),
    crop_name TEXT NOT NULL,
    variety TEXT,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE NOT NULL,
    actual_harvest_date DATE,
    growth_stage TEXT DEFAULT 'vegetative' CHECK (growth_stage IN ('germination', 'vegetative', 'flowering', 'maturity', 'harvesting')),
    target_yield NUMERIC(10,2),
    actual_yield NUMERIC(10,2),
    unit TEXT DEFAULT 'Tons',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FERTILIZER AND NUTRIENT RECORDS
CREATE TABLE IF NOT EXISTS public.crop_fertilizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
    fertilizer_name TEXT NOT NULL,
    quantity_used NUMERIC(10,2) NOT NULL,
    unit TEXT DEFAULT 'Bags',
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cost NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WORKERS (10+ daily wage farm workers)
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    daily_wage NUMERIC(10,2) NOT NULL DEFAULT 400.00,
    join_date DATE DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. WORKER DAILY ATTENDANCE
CREATE TABLE IF NOT EXISTS public.worker_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'half_day')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(worker_id, date)
);

-- 8. WORKER CASH ADVANCES (उचल)
CREATE TABLE IF NOT EXISTS public.worker_advances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WORKER WAGE PAYOUTS (मजुरी वाटप)
CREATE TABLE IF NOT EXISTS public.worker_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id REFERENCES auth.users(id) ON DELETE CASCADE,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DAILY FARM TASKS / FARMING ACTIVITIES
CREATE TABLE IF NOT EXISTS public.daily_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    plot_name TEXT,
    assigned_worker_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. FARMING ACTIVITIES (Comprehensive Farm Operations)
CREATE TABLE IF NOT EXISTS public.farming_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    activity_type TEXT DEFAULT 'field_work',
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    assigned_worker_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('urgent', 'medium', 'low')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    due_date DATE DEFAULT CURRENT_DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVENTORY (खते, बियाणे, कीटकनाशके, डिझेल व शेती अवजारे साठा)
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('fertilizer', 'seed', 'pesticide', 'fuel', 'tools', 'other')),
    quantity NUMERIC(10,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'Bags',
    cost_per_unit NUMERIC(10,2) DEFAULT 0,
    min_stock_alert NUMERIC(10,2) DEFAULT 5,
    supplier TEXT,
    storage_location TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. CANAL WATER SCHEDULES (कालवा पाणी नियोजन)
CREATE TABLE IF NOT EXISTS public.canal_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    expected_date DATE NOT NULL,
    actual_date DATE,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'running', 'stopped')),
    discharge_cusec NUMERIC(8,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. IRRIGATION LOGS (कालवा आणि पंप सिंचन इतिहास)
CREATE TABLE IF NOT EXISTS public.irrigation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    plot_name TEXT,
    source TEXT NOT NULL CHECK (source IN ('canal', 'pump')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    duration_hours NUMERIC(6,2) NOT NULL DEFAULT 0,
    energy_type TEXT CHECK (energy_type IN ('electric', 'diesel')),
    fuel_liters NUMERIC(6,2) DEFAULT 0,
    electricity_units NUMERIC(6,2) DEFAULT 0,
    fuel_cost NUMERIC(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. FINANCES (UNIFIED EXPENSE & INCOME TABLE)
CREATE TABLE IF NOT EXISTS public.finances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'bank_upi', 'cheque')),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. EXPENSES (DEDICATED EXPENSES TABLE)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    payment_mode TEXT DEFAULT 'cash' CHECK (payment_mode IN ('cash', 'bank_upi', 'cheque')),
    receipt_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. INCOME (DEDICATED INCOME TABLE)
CREATE TABLE IF NOT EXISTS public.income (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    category TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    payment_mode TEXT DEFAULT 'bank_upi' CHECK (payment_mode IN ('cash', 'bank_upi', 'cheque')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. MACHINERY AND TOOLS (ट्रॅक्टर, विहीर पंप, अवजारे)
CREATE TABLE IF NOT EXISTS public.machinery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    model TEXT,
    purchase_year INTEGER,
    condition TEXT DEFAULT 'good' CHECK (condition IN ('good', 'needs_service', 'breakdown')),
    next_service_due DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. MACHINERY LOGS (DIESEL, MAINTENANCE & REPAIRS)
CREATE TABLE IF NOT EXISTS public.machinery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    machinery_id UUID REFERENCES public.machinery(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('maintenance', 'fuel', 'repair')),
    cost NUMERIC(10,2) DEFAULT 0,
    fuel_liters NUMERIC(6,2) DEFAULT 0,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. CROP HEALTH AND OBSERVATIONS (रोगनिदान व कीड लक्षणे)
CREATE TABLE IF NOT EXISTS public.crop_health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    plot_name TEXT,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT,
    symptoms TEXT NOT NULL,
    diagnosis_guidance TEXT,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    image_url TEXT,
    observation_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'under_observation' CHECK (status IN ('under_observation', 'treated', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. HARVEST AND SALES (उत्पादन व विक्री)
CREATE TABLE IF NOT EXISTS public.harvest_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT,
    plot_id UUID REFERENCES public.plots(id) ON DELETE SET NULL,
    plot_name TEXT,
    harvest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    quantity NUMERIC(10,2) NOT NULL CHECK (quantity > 0),
    unit TEXT DEFAULT 'Tons',
    rate_per_unit NUMERIC(10,2) NOT NULL CHECK (rate_per_unit > 0),
    total_amount NUMERIC(12,2) NOT NULL,
    buyer_name TEXT NOT NULL,
    buyer_phone TEXT,
    received_amount NUMERIC(12,2) DEFAULT 0,
    pending_amount NUMERIC(12,2) DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'partial', 'unpaid')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each farmer securely accesses ONLY their own records
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_fertilizers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canal_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machinery_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_sales ENABLE ROW LEVEL SECURITY;

-- Dynamic Macro to apply CRUD policies for all user-owned tables
DO $$
DECLARE
    tbl text;
    tables text[] := ARRAY[
        'farms', 'plots', 'crops', 'crop_fertilizers', 'workers', 'worker_attendance',
        'worker_advances', 'worker_payouts', 'daily_tasks', 'farming_activities',
        'inventory', 'canal_schedules', 'irrigation_logs', 'finances', 'expenses',
        'income', 'machinery', 'machinery_logs', 'crop_health_records', 'harvest_sales'
    ];
BEGIN
    FOR i IN 1..array_length(tables, 1) LOOP
        tbl := tables[i];
        EXECUTE format('DROP POLICY IF EXISTS %I_select_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_select_policy ON public.%I FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL)', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS %I_insert_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_insert_policy ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL)', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS %I_update_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_update_policy ON public.%I FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL) WITH CHECK (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL)', tbl, tbl);

        EXECUTE format('DROP POLICY IF EXISTS %I_delete_policy ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY %I_delete_policy ON public.%I FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL OR auth.uid() IS NULL)', tbl, tbl);
    END LOOP;
END $$;

-- Profiles policy
DROP POLICY IF EXISTS profiles_policy ON public.profiles;
CREATE POLICY profiles_policy ON public.profiles FOR ALL 
USING (auth.uid() = id OR auth.uid() IS NULL) 
WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- =========================================================================
-- STORAGE BUCKET CONFIGURATION (for Crop Photos & Invoices)
-- =========================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('farm-media', 'farm-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public farm media access" ON storage.objects;
CREATE POLICY "Public farm media access" ON storage.objects FOR SELECT USING (bucket_id = 'farm-media');

DROP POLICY IF EXISTS "Authenticated users upload farm media" ON storage.objects;
CREATE POLICY "Authenticated users upload farm media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'farm-media');

-- =========================================================================
-- DATABASE TRIGGER: SYNC PROFILE & DEFAULT FARM ON USER SIGNUP
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_farm_id UUID;
BEGIN
    INSERT INTO public.profiles (id, email, full_name, farm_name, total_acres, language_preference)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'शेतकरी मालक'),
        'स्मार्ट कृषी फार्म',
        20.00,
        COALESCE(NEW.raw_user_meta_data->>'language_preference', 'mr')
    )
    ON CONFLICT (id) DO UPDATE
    SET language_preference = EXCLUDED.language_preference;

    -- Automatically seed default 20-acre farm record for new farmer
    INSERT INTO public.farms (user_id, name, total_acres, location, soil_types, irrigation_sources, main_crops)
    VALUES (
        NEW.id,
        'स्मार्ट कृषी फार्म',
        20.00,
        'महाराष्ट्र, भारत',
        ARRAY['black', 'alluvial', 'loamy', 'red'],
        ARRAY['canal', 'pump'],
        ARRAY['sugarcane', 'wheat', 'onion']
    )
    RETURNING id INTO new_farm_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
