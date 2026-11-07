import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import {
  Plot,
  Crop,
  FertilizerRecord,
  Worker,
  WorkerAttendance,
  WorkerAdvance,
  WorkerPayout,
  DailyTask,
  CanalSchedule,
  IrrigationLog,
  FinanceItem,
  MachineryItem,
  MachineryLog,
  CropHealthRecord,
  HarvestSale,
  UserProfile,
} from '../types';

// Default initial state for the 20-acre family farm
const INITIAL_PLOTS: Plot[] = [
  {
    id: 'plot-1',
    name: 'प्लॉट १ (विहीर शेजारी मळा)',
    area_acres: 8.0,
    soil_type: 'black',
    status: 'cultivated',
    current_crop: 'ऊस (Sugarcane)',
    notes: 'काळी कसदार माती, ठिबक सिंचन बसवलेले आहे',
  },
  {
    id: 'plot-2',
    name: 'प्लॉट २ (कालवा बाजू शेत)',
    area_acres: 6.0,
    soil_type: 'alluvial',
    status: 'cultivated',
    current_crop: 'गहू (Wheat)',
    notes: 'कॅनॉलच्या मुख्य चारी लगत, मुबलक पाणी',
  },
  {
    id: 'plot-3',
    name: 'प्लॉट ३ (खालची शेतजमीन)',
    area_acres: 4.0,
    soil_type: 'loamy',
    status: 'cultivated',
    current_crop: 'कांदा (Onion)',
    notes: 'उत्तम निचरा होणारी जमीन, गादीवाफे पद्धत',
  },
  {
    id: 'plot-4',
    name: 'प्लॉट ४ (घर शेजारी तुकडा)',
    area_acres: 2.0,
    soil_type: 'red',
    status: 'preparing',
    current_crop: 'पडीक / मशागत',
    notes: 'शेणखत टाकून रोटाव्हेटर मारणे चालू',
  },
];

const INITIAL_CROPS: Crop[] = [
  {
    id: 'crop-1',
    plot_id: 'plot-1',
    plot_name: 'प्लॉट १ (विहीर शेजारी मळा)',
    crop_type: 'sugarcane',
    crop_name: 'ऊस',
    variety: 'को-८६०३२ (नीरा)',
    sowing_date: '2026-06-15',
    expected_harvest_date: '2027-08-15',
    growth_stage: 'vegetative',
    target_yield: 650,
    actual_yield: 0,
    unit: 'Tons',
    notes: '८ एकर ऊस जोमदार वाढीत आहे. ठिबक मधून १९:१९:१९ व युरिया चालू आहे.',
  },
  {
    id: 'crop-2',
    plot_id: 'plot-2',
    plot_name: 'प्लॉट २ (कालवा बाजू शेत)',
    crop_type: 'wheat',
    crop_name: 'गहू',
    variety: 'लोकवन (Lokwan)',
    sowing_date: '2026-11-01',
    expected_harvest_date: '2027-03-05',
    growth_stage: 'germination',
    target_yield: 120,
    actual_yield: 0,
    unit: 'Quintals',
    notes: '६ एकर गहू पेरणी नुकतीच पूर्ण झाली असून उगवण छान झाली आहे.',
  },
  {
    id: 'crop-3',
    plot_id: 'plot-3',
    plot_name: 'प्लॉट ३ (खालची शेतजमीन)',
    crop_type: 'onion',
    crop_name: 'कांदा',
    variety: 'गावरान फुर्सुंगी',
    sowing_date: '2026-09-20',
    expected_harvest_date: '2027-01-25',
    growth_stage: 'flowering',
    target_yield: 280,
    actual_yield: 0,
    unit: 'Quintals',
    notes: '४ एकर रांगडा कांदा कंद पोसत आहे, बुरशीनाशक व १३:००:४५ फवारले.',
  },
];

const INITIAL_WORKERS: Worker[] = [
  { id: 'w-1', name: 'रंगराव पाटील (मुकादम)', phone: '9822011223', daily_wage: 500, join_date: '2025-01-10', is_active: true, notes: 'मुख्य कामे व मजूर नियोजन' },
  { id: 'w-2', name: 'दत्तू शिंदे', phone: '9850123456', daily_wage: 450, join_date: '2025-02-15', is_active: true, notes: 'ट्रॅक्टर ड्रायव्हर व अवजारे ऑपरेटर' },
  { id: 'w-3', name: 'मारुती जाधव', phone: '9421890123', daily_wage: 400, join_date: '2025-03-01', is_active: true, notes: 'पाणी भरणे व ठिबक देखरेख' },
  { id: 'w-4', name: 'बाबूराव सावंत', phone: '9763456789', daily_wage: 400, join_date: '2025-03-10', is_active: true, notes: 'ऊस बांधणी व रासायनिक खते' },
  { id: 'w-5', name: 'सोमनाथ गायकवाड', phone: '9890234567', daily_wage: 400, join_date: '2025-04-01', is_active: true, notes: 'कांदा निंदणी व फवारणी' },
  { id: 'w-6', name: 'सुनील पवार', phone: '9637890123', daily_wage: 400, join_date: '2025-04-15', is_active: true, notes: 'शेत मशागत कामे' },
  { id: 'w-7', name: 'सुमनबाई जाधव', phone: '9823112233', daily_wage: 350, join_date: '2025-03-01', is_active: true, notes: 'कांदा खुरपणी व काढणी' },
  { id: 'w-8', name: 'कमलबाई सावंत', phone: '9860334455', daily_wage: 350, join_date: '2025-03-10', is_active: true, notes: 'खुरपणी व स्वच्छता' },
  { id: 'w-9', name: 'अलकाबाई शिंदे', phone: '9890556677', daily_wage: 350, join_date: '2025-04-01', is_active: true, notes: 'कांदा प्रतवारी व पॅकिंग' },
  { id: 'w-10', name: 'विठ्ठल माने', phone: '9765123450', daily_wage: 400, join_date: '2025-05-01', is_active: true, notes: 'गहू पेरणी व पाट पाणी' },
  { id: 'w-11', name: 'ज्ञानेश्वर भोसले', phone: '9822887766', daily_wage: 400, join_date: '2025-05-15', is_active: true, notes: 'खत टाकणे व चारा कापणे' },
  { id: 'w-12', name: 'शारदाबाई भोसले', phone: '9822998877', daily_wage: 350, join_date: '2025-05-15', is_active: true, notes: 'खुरपणी व वेचणी' },
];

const getTodayDateStr = () => new Date().toISOString().split('T')[0];

const INITIAL_ATTENDANCE: WorkerAttendance[] = INITIAL_WORKERS.slice(0, 10).map((w, idx) => ({
  id: `att-${idx + 1}`,
  worker_id: w.id,
  date: getTodayDateStr(),
  status: idx === 4 ? 'absent' : idx === 8 ? 'half_day' : 'present',
  notes: idx === 4 ? 'गावी गेले आहेत' : '',
}));

const INITIAL_ADVANCES: WorkerAdvance[] = [
  { id: 'adv-1', worker_id: 'w-1', date: '2026-11-01', amount: 2000, reason: 'घरगुती खर्च' },
  { id: 'adv-2', worker_id: 'w-3', date: '2026-11-03', amount: 1000, reason: 'दवाखाना खर्च' },
  { id: 'adv-3', worker_id: 'w-5', date: '2026-11-04', amount: 1500, reason: 'सणासाठी उचल' },
];

const INITIAL_TASKS: DailyTask[] = [
  {
    id: 'task-1',
    title: 'कांद्याला १३:००:४५ आणि बुरशीनाशक फवारणी',
    description: 'प्लॉट ३ मधील ४ एकर कांद्यावर करपा नियंत्रणासाठी फवारणी करणे.',
    plot_id: 'plot-3',
    plot_name: 'प्लॉट ३ (खालची शेतजमीन)',
    assigned_worker_ids: ['w-2', 'w-5'],
    priority: 'urgent',
    status: 'in_progress',
    due_date: getTodayDateStr(),
  },
  {
    id: 'task-2',
    title: 'उसाला ठिबक द्वारे विद्राव्य खत सोडणे',
    description: 'प्लॉट १ मध्ये ८ एकर उसाला विहिरीच्या पंपावरून ठिबक सिंचन चालवणे.',
    plot_id: 'plot-1',
    plot_name: 'प्लॉट १ (विहीर शेजारी मळा)',
    assigned_worker_ids: ['w-3', 'w-4'],
    priority: 'medium',
    status: 'pending',
    due_date: getTodayDateStr(),
  },
  {
    id: 'task-3',
    title: 'गव्हाच्या वाफ्यांची तपासणी व पाट पाणी नियोजन',
    description: 'कालव्याचे पाणी सुटण्यापूर्वी मुख्य चारीची साफसफाई करणे.',
    plot_id: 'plot-2',
    plot_name: 'प्लॉट २ (कालवा बाजू शेत)',
    assigned_worker_ids: ['w-1', 'w-10'],
    priority: 'medium',
    status: 'pending',
    due_date: getTodayDateStr(),
  },
  {
    id: 'task-4',
    title: 'प्लॉट ४ मध्ये रोटाव्हेटर मारणे',
    description: '२ एकर मोकळ्या जमिनीत शेणखत मिसळून पेरणीयोग्य करणे.',
    plot_id: 'plot-4',
    plot_name: 'प्लॉट ४ (घर शेजारी तुकडा)',
    assigned_worker_ids: ['w-2'],
    priority: 'low',
    status: 'completed',
    due_date: '2026-11-05',
  },
];

const INITIAL_CANAL_SCHEDULES: CanalSchedule[] = [
  {
    id: 'canal-1',
    expected_date: '2026-11-12',
    actual_date: undefined,
    status: 'scheduled',
    discharge_cusec: 450,
    notes: 'नीरा डावा कालवा रब्बी पाणी पाळी क्र. १ - गहू व कांदा क्षेत्रासाठी',
  },
  {
    id: 'canal-2',
    expected_date: '2026-10-18',
    actual_date: '2026-10-19',
    status: 'stopped',
    discharge_cusec: 500,
    notes: 'मागील आवर्तन - ८ एकर उसाला पूर्ण पाणी भरून घेतले',
  },
];

const INITIAL_IRRIGATION_LOGS: IrrigationLog[] = [
  {
    id: 'irr-1',
    plot_id: 'plot-1',
    plot_name: 'प्लॉट १ (विहीर शेजारी मळा)',
    source: 'pump',
    date: '2026-11-06',
    duration_hours: 5.5,
    energy_type: 'electric',
    electricity_units: 32,
    fuel_cost: 0,
    notes: 'किर्लोस्कर ७.५ HP विहीर पंप - ठिबक सिंचन ५ तास चालले',
  },
  {
    id: 'irr-2',
    plot_id: 'plot-3',
    plot_name: 'प्लॉट ३ (खालची शेतजमीन)',
    source: 'pump',
    date: '2026-11-04',
    duration_hours: 4.0,
    energy_type: 'diesel',
    fuel_liters: 6.5,
    fuel_cost: 620,
    notes: 'लाईट कट झाल्यामुळे डिझेल इंजिन चालू करून पाणी दिले',
  },
  {
    id: 'irr-3',
    plot_id: 'plot-2',
    plot_name: 'प्लॉट २ (कालवा बाजू शेत)',
    source: 'canal',
    date: '2026-10-20',
    duration_hours: 12.0,
    notes: 'कॅनॉलचे पाणी थेट पाटाने ६ एकर शेतात भरले',
  },
];

const INITIAL_FINANCES: FinanceItem[] = [
  {
    id: 'fin-1',
    type: 'income',
    category: 'cat_sale_sugarcane',
    amount: 145000,
    date: '2026-10-28',
    crop_id: 'crop-1',
    crop_name: 'ऊस (Sugarcane)',
    payment_mode: 'bank_upi',
    notes: 'साखर कारखाना बिल पहिली उचल खात्यावर जमा',
  },
  {
    id: 'fin-2',
    type: 'income',
    category: 'cat_sale_onion',
    amount: 68000,
    date: '2026-10-15',
    crop_id: 'crop-3',
    crop_name: 'कांदा (Onion)',
    payment_mode: 'cash',
    notes: 'मागील कांदा चाळ विक्री - व्यापारी रोख पावती',
  },
  {
    id: 'fin-3',
    type: 'expense',
    category: 'cat_labour',
    amount: 22400,
    date: '2026-11-02',
    payment_mode: 'cash',
    notes: 'मजुरांचे साप्ताहिक देयक वाटप',
  },
  {
    id: 'fin-4',
    type: 'expense',
    category: 'cat_fertilizer',
    amount: 18500,
    date: '2026-11-03',
    crop_id: 'crop-1',
    crop_name: 'ऊस (Sugarcane)',
    payment_mode: 'bank_upi',
    notes: '१०:२६:२६ आणि युरिया खत खरेदी (कृषी केंद्र पावती)',
  },
  {
    id: 'fin-5',
    type: 'expense',
    category: 'cat_machinery',
    amount: 7200,
    date: '2026-11-04',
    payment_mode: 'cash',
    notes: 'ट्रॅक्टर डिझेल ७५ लिटर खरेदी',
  },
  {
    id: 'fin-6',
    type: 'expense',
    category: 'cat_seeds',
    amount: 12000,
    date: '2026-10-29',
    crop_id: 'crop-2',
    crop_name: 'गहू (Wheat)',
    payment_mode: 'cash',
    notes: 'लोकवन गहू प्रमाणित बियाणे खरेदी',
  },
];

const INITIAL_MACHINERY: MachineryItem[] = [
  {
    id: 'mac-1',
    name: 'महिंद्रा ट्रॅक्टर ५७५ DI',
    model: 'Mahindra 575 DI (45 HP)',
    purchase_year: 2021,
    condition: 'good',
    next_service_due: '2026-12-15',
    notes: 'इंजिन व हायड्रॉलिक उत्तम स्थितीत आहे',
  },
  {
    id: 'mac-2',
    name: 'किर्लोस्कर विहीर पंप',
    model: 'Kirloskar 7.5 HP Submersible',
    purchase_year: 2020,
    condition: 'good',
    next_service_due: '2027-01-20',
    notes: 'विहिरीतील मुख्य सिंचन पंप',
  },
  {
    id: 'mac-3',
    name: 'शक्तिमान रोटाव्हेटर',
    model: 'Shaktiman 6 Feet Rotary Tiller',
    purchase_year: 2022,
    condition: 'good',
    next_service_due: '2026-11-30',
    notes: 'ब्लेड्स उत्तम आहेत, ग्रीसिंग केले',
  },
  {
    id: 'mac-4',
    name: 'अस्पी बॅटरी फवारणी पंप',
    model: 'Aspee 16 Liter Battery Sprayer',
    purchase_year: 2023,
    condition: 'needs_service',
    next_service_due: '2026-11-15',
    notes: 'बॅटरी बॅकअप कमी झाला आहे, तपासणी आवश्यक',
  },
];

const INITIAL_CROP_HEALTH: CropHealthRecord[] = [
  {
    id: 'health-1',
    plot_id: 'plot-1',
    plot_name: 'प्लॉट १ (विहीर शेजारी मळा)',
    crop_id: 'crop-1',
    crop_name: 'ऊस (Sugarcane)',
    symptoms: 'उसाच्या काही कांडीवर पांढरा पिठ्या ढेकूण व खोडकिडीची लक्षणे दिसत आहेत.',
    diagnosis_guidance: 'संभाव्य कारण: खोडकिड (Early shoot borer) किंवा मिलीबग प्रादुर्भाव. प्राथमिक उपाय: पिकाला पुरेसे पाणी देणे, निंबोळी अर्क ५% फवारणी, ट्रायकोकार्ड्स वापरणे.',
    severity: 'medium',
    observation_date: '2026-11-04',
    status: 'under_observation',
  },
  {
    id: 'health-2',
    plot_id: 'plot-3',
    plot_name: 'प्लॉट ३ (खालची शेतजमीन)',
    crop_id: 'crop-3',
    crop_name: 'कांदा (Onion)',
    symptoms: 'कांद्याच्या पानाच्या शेंड्यावर जांभळे ठिपके (करपा) पडत आहेत आणि पीळ पडत आहे.',
    diagnosis_guidance: 'संभाव्य कारण: जांभळा करपा (Purple Blotch) व थ्रिप्स (फुलकिडे) प्रादुर्भाव. प्राथमिक उपाय: मॅन्कोझेब २.५ ग्रॅम प्रति लिटर किंवा प्रोपिकोनेझोल १ मिली प्रति लिटर सोबत स्टीकर वापरावा.',
    severity: 'high',
    observation_date: '2026-11-06',
    status: 'under_observation',
  },
];

const INITIAL_HARVEST_SALES: HarvestSale[] = [
  {
    id: 'sale-1',
    crop_id: 'crop-1',
    crop_name: 'ऊस (Sugarcane)',
    plot_id: 'plot-1',
    plot_name: 'प्लॉट १ (विहीर शेजारी मळा)',
    harvest_date: '2026-10-25',
    quantity: 85,
    unit: 'Tons',
    rate_per_unit: 3100,
    total_amount: 263500,
    buyer_name: 'श्री छत्रपती सहकारी साखर कारखाना, भवानीनगर',
    buyer_phone: '02118-242201',
    received_amount: 145000,
    pending_amount: 118500,
    payment_status: 'partial',
  },
  {
    id: 'sale-2',
    crop_id: 'crop-3',
    crop_name: 'कांदा (Onion)',
    plot_id: 'plot-3',
    plot_name: 'प्लॉट ३ (खालची शेतजमीन)',
    harvest_date: '2026-10-14',
    quantity: 35,
    unit: 'Quintals',
    rate_per_unit: 2200,
    total_amount: 77000,
    buyer_name: 'कृषी उत्पन्न बाजार समिती (APMC) आडत व्यापारी',
    buyer_phone: '9822456789',
    received_amount: 68000,
    pending_amount: 9000,
    payment_status: 'partial',
  },
];

// Helper to get / set from localStorage
const getLocal = <T>(key: string, defaultVal: T): T => {
  try {
    const raw = localStorage.getItem(`sfm_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultVal;
  }
};

const setLocal = <T>(key: string, val: T): void => {
  try {
    localStorage.setItem(`sfm_${key}`, JSON.stringify(val));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
};

// ==========================================
// UNIFIED DATA SERVICE (SUPABASE + LOCAL SYNC)
// ==========================================
export const FarmDB = {
  // Farm Constants
  TOTAL_FARM_ACRES: 20.0,

  // 1. Profile & Language Preference
  async getProfile(): Promise<UserProfile> {
    const defaultProfile: UserProfile = {
      id: 'farmer-family',
      email: 'farmer@smartfarm.in',
      full_name: 'शेतकरी मालक (Father)',
      farm_name: 'आपली शेती (२० एकर)',
      total_acres: 20.0,
      language_preference: (localStorage.getItem('smart_farm_lang') as any) || 'mr',
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (data && !error) return data as UserProfile;
        }
      } catch (e) {
        console.warn('Supabase profile fetch failed, using local profile', e);
      }
    }
    return getLocal<UserProfile>('profile', defaultProfile);
  },

  async updateLanguagePreference(lang: 'mr' | 'hi' | 'en'): Promise<void> {
    const profile = await this.getProfile();
    profile.language_preference = lang;
    setLocal('profile', profile);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').update({ language_preference: lang }).eq('id', user.id);
        }
      } catch (e) {
        console.warn('Could not sync language to Supabase profile', e);
      }
    }
  },

  // 2. Plots Management (Strict 20-acre limit enforced!)
  async getPlots(): Promise<Plot[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('plots').select('*').order('created_at', { ascending: true });
        if (data && !error && data.length > 0) return data as Plot[];
      } catch (e) {
        console.warn('Supabase getPlots failed, fallback to local', e);
      }
    }
    return getLocal<Plot[]>('plots', INITIAL_PLOTS);
  },

  async addPlot(plot: Omit<Plot, 'id'>): Promise<{ success: boolean; error?: string; plot?: Plot }> {
    const currentPlots = await this.getPlots();
    const currentTotal = currentPlots.reduce((acc, p) => acc + Number(p.area_acres || 0), 0);
    const newTotal = currentTotal + Number(plot.area_acres || 0);

    // Enforce 20-acre farm limit
    if (newTotal > this.TOTAL_FARM_ACRES) {
      const remaining = Math.max(0, this.TOTAL_FARM_ACRES - currentTotal);
      return {
        success: false,
        error: `Total active plot area cannot exceed ${this.TOTAL_FARM_ACRES} acres! Only ${remaining.toFixed(2)} acres remaining.`,
      };
    }

    const newPlot: Plot = {
      ...plot,
      id: `plot-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('plots').insert([{
          ...plot,
          user_id: user?.id,
        }]).select().single();
        if (data && !error) {
          setLocal('plots', [...currentPlots, data as Plot]);
          return { success: true, plot: data as Plot };
        }
      } catch (e) {
        console.warn('Supabase addPlot fallback to local', e);
      }
    }

    const updated = [...currentPlots, newPlot];
    setLocal('plots', updated);
    return { success: true, plot: newPlot };
  },

  async updatePlot(id: string, updates: Partial<Plot>): Promise<{ success: boolean; error?: string }> {
    const currentPlots = await this.getPlots();
    const current = currentPlots.find(p => p.id === id);
    if (!current) return { success: false, error: 'Plot not found' };

    if (updates.area_acres !== undefined) {
      const otherTotal = currentPlots
        .filter(p => p.id !== id)
        .reduce((acc, p) => acc + Number(p.area_acres || 0), 0);
      const newTotal = otherTotal + Number(updates.area_acres || 0);
      if (newTotal > this.TOTAL_FARM_ACRES) {
        const remaining = Math.max(0, this.TOTAL_FARM_ACRES - otherTotal);
        return {
          success: false,
          error: `Total plot area cannot exceed ${this.TOTAL_FARM_ACRES} acres! Only ${remaining.toFixed(2)} acres available.`,
        };
      }
    }

    const updated = currentPlots.map(p => (p.id === id ? { ...p, ...updates } : p));
    setLocal('plots', updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('plots').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updatePlot failed', e);
      }
    }

    return { success: true };
  },

  async deletePlot(id: string): Promise<void> {
    const currentPlots = await this.getPlots();
    const updated = currentPlots.filter(p => p.id !== id);
    setLocal('plots', updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('plots').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deletePlot failed', e);
      }
    }
  },

  // 3. Crops Management
  async getCrops(): Promise<Crop[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crops').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data as Crop[];
      } catch (e) {
        console.warn('Supabase getCrops fallback', e);
      }
    }
    return getLocal<Crop[]>('crops', INITIAL_CROPS);
  },

  async addCrop(crop: Omit<Crop, 'id'>): Promise<Crop> {
    const crops = await this.getCrops();
    const newCrop: Crop = {
      ...crop,
      id: `crop-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const { data, error } = await supabase.from('crops').insert([{ ...crop, user_id: user?.id }]).select().single();
        if (data && !error) {
          setLocal('crops', [data as Crop, ...crops]);
          return data as Crop;
        }
      } catch (e) {
        console.warn('Supabase addCrop fallback', e);
      }
    }

    setLocal('crops', [newCrop, ...crops]);
    return newCrop;
  },

  async updateCrop(id: string, updates: Partial<Crop>): Promise<void> {
    const crops = await this.getCrops();
    const updated = crops.map(c => (c.id === id ? { ...c, ...updates } : c));
    setLocal('crops', updated);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('crops').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateCrop failed', e);
      }
    }
  },

  async deleteCrop(id: string): Promise<void> {
    const crops = await this.getCrops();
    setLocal('crops', crops.filter(c => c.id !== id));

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        await supabase.from('crops').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCrop failed', e);
      }
    }
  },

  // 4. Workers, Attendance & Wages
  async getWorkers(): Promise<Worker[]> {
    const workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);
    const attendance = await this.getAttendance();
    const advances = await this.getAdvances();
    const payouts = await this.getPayouts();

    // Compute wage balances dynamically
    return workers.map(w => {
      const workerAtt = attendance.filter(a => a.worker_id === w.id);
      let daysWorked = 0;
      workerAtt.forEach(a => {
        if (a.status === 'present') daysWorked += 1;
        else if (a.status === 'half_day') daysWorked += 0.5;
      });

      // Default to 15 days if new or not fully marked
      if (daysWorked === 0 && w.is_active) daysWorked = 12;

      const totalEarned = daysWorked * (Number(w.daily_wage) || 400);
      const totalAdv = advances.filter(a => a.worker_id === w.id).reduce((sum, a) => sum + Number(a.amount || 0), 0);
      const totalPay = payouts.filter(p => p.worker_id === w.id).reduce((sum, p) => sum + Number(p.amount || 0), 0);
      const netPayable = Math.max(0, totalEarned - totalAdv - totalPay);

      return {
        ...w,
        total_days_worked: daysWorked,
        total_earned: totalEarned,
        total_advances: totalAdv,
        total_payouts: totalPay,
        net_payable: netPayable,
      };
    });
  },

  async addWorker(worker: Omit<Worker, 'id'>): Promise<Worker> {
    const current = await this.getWorkers();
    const newWorker: Worker = {
      ...worker,
      id: `w-${Date.now()}`,
    };
    setLocal('workers', [...current, newWorker]);
    return newWorker;
  },

  async updateWorker(id: string, updates: Partial<Worker>): Promise<void> {
    const workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);
    const updated = workers.map(w => (w.id === id ? { ...w, ...updates } : w));
    setLocal('workers', updated);
  },

  async deleteWorker(id: string): Promise<void> {
    const workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);
    setLocal('workers', workers.filter(w => w.id !== id));
    // Also clean up attendance and advances
    const attendance = getLocal<WorkerAttendance[]>('attendance', INITIAL_ATTENDANCE);
    setLocal('attendance', attendance.filter(a => a.worker_id !== id));
    const advances = getLocal<WorkerAdvance[]>('advances', INITIAL_ADVANCES);
    setLocal('advances', advances.filter(a => a.worker_id !== id));
  },

  async getAttendance(date?: string): Promise<WorkerAttendance[]> {
    const all = getLocal<WorkerAttendance[]>('attendance', INITIAL_ATTENDANCE);
    if (date) {
      return all.filter(a => a.date === date);
    }
    return all;
  },

  async markAttendance(workerId: string, date: string, status: 'present' | 'absent' | 'half_day', notes = ''): Promise<void> {
    const all = getLocal<WorkerAttendance[]>('attendance', INITIAL_ATTENDANCE);
    const existingIndex = all.findIndex(a => a.worker_id === workerId && a.date === date);

    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], status, notes };
    } else {
      all.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        worker_id: workerId,
        date,
        status,
        notes,
      });
    }
    setLocal('attendance', all);
  },

  async getAdvances(): Promise<WorkerAdvance[]> {
    return getLocal<WorkerAdvance[]>('advances', INITIAL_ADVANCES);
  },

  async addAdvance(advance: Omit<WorkerAdvance, 'id'>): Promise<WorkerAdvance> {
    const all = await this.getAdvances();
    const newAdv: WorkerAdvance = {
      ...advance,
      id: `adv-${Date.now()}`,
    };
    setLocal('advances', [newAdv, ...all]);
    return newAdv;
  },

  async deleteAdvance(id: string): Promise<void> {
    const all = await this.getAdvances();
    setLocal('advances', all.filter(a => a.id !== id));
  },

  async getPayouts(): Promise<WorkerPayout[]> {
    return getLocal<WorkerPayout[]>('payouts', []);
  },

  async recordPayout(payout: Omit<WorkerPayout, 'id'>): Promise<WorkerPayout> {
    const all = await this.getPayouts();
    const newPayout: WorkerPayout = {
      ...payout,
      id: `pay-${Date.now()}`,
    };
    setLocal('payouts', [newPayout, ...all]);

    // Also automatically log to farm finances as Labour Expense!
    const worker = (await this.getWorkers()).find(w => w.id === payout.worker_id);
    await this.addFinanceItem({
      type: 'expense',
      category: 'cat_labour',
      amount: payout.amount,
      date: payout.date,
      payment_mode: payout.payment_method === 'cash' ? 'cash' : 'bank_upi',
      notes: `मजुरी वाटप: ${worker?.name || 'मजूर'} (${payout.notes || ''})`,
    });

    return newPayout;
  },

  // 5. Daily Tasks
  async getTasks(): Promise<DailyTask[]> {
    return getLocal<DailyTask[]>('tasks', INITIAL_TASKS);
  },

  async addTask(task: Omit<DailyTask, 'id'>): Promise<DailyTask> {
    const all = await this.getTasks();
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    setLocal('tasks', [newTask, ...all]);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<DailyTask>): Promise<void> {
    const all = await this.getTasks();
    const updated = all.map(t => (t.id === id ? { ...t, ...updates } : t));
    setLocal('tasks', updated);
  },

  async deleteTask(id: string): Promise<void> {
    const all = await this.getTasks();
    setLocal('tasks', all.filter(t => t.id !== id));
  },

  // 6. Irrigation & Canal
  async getCanalSchedules(): Promise<CanalSchedule[]> {
    return getLocal<CanalSchedule[]>('canal_schedules', INITIAL_CANAL_SCHEDULES);
  },

  async addCanalSchedule(schedule: Omit<CanalSchedule, 'id'>): Promise<CanalSchedule> {
    const all = await this.getCanalSchedules();
    const newSchedule: CanalSchedule = {
      ...schedule,
      id: `canal-${Date.now()}`,
    };
    setLocal('canal_schedules', [newSchedule, ...all]);
    return newSchedule;
  },

  async deleteCanalSchedule(id: string): Promise<void> {
    const all = await this.getCanalSchedules();
    setLocal('canal_schedules', all.filter(c => c.id !== id));
  },

  async getIrrigationLogs(): Promise<IrrigationLog[]> {
    return getLocal<IrrigationLog[]>('irrigation_logs', INITIAL_IRRIGATION_LOGS);
  },

  async addIrrigationLog(log: Omit<IrrigationLog, 'id'>): Promise<IrrigationLog> {
    const all = await this.getIrrigationLogs();
    const newLog: IrrigationLog = {
      ...log,
      id: `irr-${Date.now()}`,
    };
    setLocal('irrigation_logs', [newLog, ...all]);

    // If diesel cost incurred, add to finances automatically!
    if (log.fuel_cost && log.fuel_cost > 0) {
      await this.addFinanceItem({
        type: 'expense',
        category: 'cat_machinery',
        amount: log.fuel_cost,
        date: log.date,
        plot_id: log.plot_id,
        payment_mode: 'cash',
        notes: `पंप डिझेल खर्च (${log.duration_hours} तास सिंचन)`,
      });
    }

    return newLog;
  },

  async deleteIrrigationLog(id: string): Promise<void> {
    const all = await this.getIrrigationLogs();
    setLocal('irrigation_logs', all.filter(l => l.id !== id));
  },

  // 7. Finance Management
  async getFinances(): Promise<FinanceItem[]> {
    return getLocal<FinanceItem[]>('finances', INITIAL_FINANCES);
  },

  async addFinanceItem(item: Omit<FinanceItem, 'id'>): Promise<FinanceItem> {
    const all = await this.getFinances();
    const newItem: FinanceItem = {
      ...item,
      id: `fin-${Date.now()}`,
    };
    setLocal('finances', [newItem, ...all]);
    return newItem;
  },

  async updateFinanceItem(id: string, updates: Partial<FinanceItem>): Promise<void> {
    const all = await this.getFinances();
    setLocal('finances', all.map(f => (f.id === id ? { ...f, ...updates } : f)));
  },

  async deleteFinanceItem(id: string): Promise<void> {
    const all = await this.getFinances();
    setLocal('finances', all.filter(f => f.id !== id));
  },

  // 8. Machinery
  async getMachinery(): Promise<MachineryItem[]> {
    return getLocal<MachineryItem[]>('machinery', INITIAL_MACHINERY);
  },

  async addMachinery(item: Omit<MachineryItem, 'id'>): Promise<MachineryItem> {
    const all = await this.getMachinery();
    const newItem: MachineryItem = {
      ...item,
      id: `mac-${Date.now()}`,
    };
    setLocal('machinery', [...all, newItem]);
    return newItem;
  },

  async updateMachinery(id: string, updates: Partial<MachineryItem>): Promise<void> {
    const all = await this.getMachinery();
    setLocal('machinery', all.map(m => (m.id === id ? { ...m, ...updates } : m)));
  },

  async deleteMachinery(id: string): Promise<void> {
    const all = await this.getMachinery();
    setLocal('machinery', all.filter(m => m.id !== id));
  },

  // 9. Crop Health
  async getCropHealthRecords(): Promise<CropHealthRecord[]> {
    return getLocal<CropHealthRecord[]>('crop_health', INITIAL_CROP_HEALTH);
  },

  async addCropHealthRecord(record: Omit<CropHealthRecord, 'id'>): Promise<CropHealthRecord> {
    const all = await this.getCropHealthRecords();
    const newRecord: CropHealthRecord = {
      ...record,
      id: `health-${Date.now()}`,
    };
    setLocal('crop_health', [newRecord, ...all]);
    return newRecord;
  },

  async updateCropHealthRecord(id: string, updates: Partial<CropHealthRecord>): Promise<void> {
    const all = await this.getCropHealthRecords();
    setLocal('crop_health', all.map(r => (r.id === id ? { ...r, ...updates } : r)));
  },

  async deleteCropHealthRecord(id: string): Promise<void> {
    const all = await this.getCropHealthRecords();
    setLocal('crop_health', all.filter(r => r.id !== id));
  },

  // 10. Harvest & Sales
  async getHarvestSales(): Promise<HarvestSale[]> {
    return getLocal<HarvestSale[]>('harvest_sales', INITIAL_HARVEST_SALES);
  },

  async addHarvestSale(sale: Omit<HarvestSale, 'id'>): Promise<HarvestSale> {
    const all = await this.getHarvestSales();
    const newSale: HarvestSale = {
      ...sale,
      id: `sale-${Date.now()}`,
    };
    setLocal('harvest_sales', [newSale, ...all]);

    // If money received, log as income to finances automatically!
    if (sale.received_amount > 0) {
      await this.addFinanceItem({
        type: 'income',
        category: sale.crop_name?.includes('ऊस') || sale.crop_name?.toLowerCase().includes('sugarcane')
          ? 'cat_sale_sugarcane'
          : sale.crop_name?.includes('गहू') || sale.crop_name?.toLowerCase().includes('wheat')
          ? 'cat_sale_wheat'
          : 'cat_sale_onion',
        amount: sale.received_amount,
        date: sale.harvest_date,
        crop_id: sale.crop_id,
        crop_name: sale.crop_name,
        payment_mode: 'bank_upi',
        notes: `पीक विक्री जमा: ${sale.buyer_name} (${sale.quantity} ${sale.unit})`,
      });
    }

    return newSale;
  },

  async updateHarvestSale(id: string, updates: Partial<HarvestSale>): Promise<void> {
    const all = await this.getHarvestSales();
    setLocal('harvest_sales', all.map(s => (s.id === id ? { ...s, ...updates } : s)));
  },

  async deleteHarvestSale(id: string): Promise<void> {
    const all = await this.getHarvestSales();
    setLocal('harvest_sales', all.filter(s => s.id !== id));
  },

  // 11. Global Reset & Clear Data
  clearAllFarmData(): void {
    const collections = [
      'plots', 'crops', 'workers', 'attendance', 'advances', 'payouts',
      'tasks', 'canal_schedules', 'irrigation_logs', 'finances', 'machinery',
      'crop_health', 'harvest_sales'
    ];
    collections.forEach(key => {
      setLocal(key, []);
    });
  },

  resetAllDataToDefaults(): void {
    setLocal('plots', INITIAL_PLOTS);
    setLocal('crops', INITIAL_CROPS);
    setLocal('workers', INITIAL_WORKERS);
    setLocal('attendance', INITIAL_ATTENDANCE);
    setLocal('advances', INITIAL_ADVANCES);
    setLocal('payouts', []);
    setLocal('tasks', INITIAL_TASKS);
    setLocal('canal_schedules', INITIAL_CANAL_SCHEDULES);
    setLocal('irrigation_logs', INITIAL_IRRIGATION_LOGS);
    setLocal('finances', INITIAL_FINANCES);
    setLocal('machinery', INITIAL_MACHINERY);
    setLocal('crop_health', INITIAL_CROP_HEALTH);
    setLocal('harvest_sales', INITIAL_HARVEST_SALES);
  },
};
