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
  Farm,
  Expense,
  Income,
  InventoryItem,
  FarmingActivity,
} from '../types';

// Helper to check valid UUID format for PostgreSQL UUID primary keys
const isUUID = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const getAuthUser = async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user || null;
  } catch {
    return null;
  }
};

// =========================================================================
// DEFAULT INITIAL SEED DATA FOR 20-ACRE FAMILY FARM
// =========================================================================
const INITIAL_FARMS: Farm[] = [
  {
    id: 'farm-1',
    name: 'स्मार्ट कृषी फार्म',
    total_acres: 20.0,
    location: 'बारामती / पुणे परिसर, महाराष्ट्र',
    soil_types: ['black', 'alluvial', 'loamy', 'red'],
    irrigation_sources: ['canal', 'pump'],
    main_crops: ['sugarcane', 'wheat', 'onion'],
    notes: '२० एकर सुपीक बागायती शेती (८ एकर ऊस, ६ एकर गहू, ४ एकर कांदा, २ एकर मशागत)',
  },
];

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

const INITIAL_FARMING_ACTIVITIES: FarmingActivity[] = INITIAL_TASKS.map(t => ({
  id: t.id,
  title: t.title,
  description: t.description,
  activity_type: 'field_work',
  plot_id: t.plot_id,
  plot_name: t.plot_name,
  assigned_worker_ids: t.assigned_worker_ids,
  priority: t.priority,
  status: t.status,
  due_date: t.due_date,
}));

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

const INITIAL_EXPENSES: Expense[] = INITIAL_FINANCES.filter(f => f.type === 'expense').map(f => ({
  id: f.id,
  category: f.category,
  amount: f.amount,
  date: f.date,
  crop_id: f.crop_id,
  crop_name: f.crop_name,
  plot_id: f.plot_id,
  payment_mode: f.payment_mode,
  notes: f.notes,
}));

const INITIAL_INCOME: Income[] = INITIAL_FINANCES.filter(f => f.type === 'income').map(f => ({
  id: f.id,
  category: f.category,
  amount: f.amount,
  date: f.date,
  crop_id: f.crop_id,
  crop_name: f.crop_name,
  plot_id: f.plot_id,
  payment_mode: f.payment_mode,
  notes: f.notes,
}));

const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-1',
    item_name: '१९:१९:१९ विद्राव्य खत',
    category: 'fertilizer',
    quantity: 15,
    unit: 'Bags',
    cost_per_unit: 1250,
    total_value: 18750,
    min_stock_alert: 5,
    supplier: 'राजाराम कृषी केंद्र',
    storage_location: 'गोडाऊन रॅक १',
    notes: 'ठिबक सिंचनातून देण्यासाठी विद्राव्य ग्रेड',
  },
  {
    id: 'inv-2',
    item_name: '१०:२६:२६ सुफला',
    category: 'fertilizer',
    quantity: 20,
    unit: 'Bags',
    cost_per_unit: 1470,
    total_value: 29400,
    min_stock_alert: 8,
    supplier: 'इफ्को शेतकरी सेवा केंद्र',
    storage_location: 'गोडाऊन तळमजला',
    notes: 'कांदा आणि ऊस बेसल डोस',
  },
  {
    id: 'inv-3',
    item_name: 'लोकवन गहू बियाणे',
    category: 'seed',
    quantity: 6,
    unit: 'Bags',
    cost_per_unit: 2100,
    total_value: 12600,
    min_stock_alert: 2,
    supplier: 'महाबीज अधिकृत विक्रेता',
    storage_location: 'बियाणे पेटी',
    notes: 'उपचारित प्रमाणित बियाणे',
  },
  {
    id: 'inv-4',
    item_name: 'मॅन्कोझेब ७५% WP बुरशीनाशक',
    category: 'pesticide',
    quantity: 10,
    unit: 'Kg',
    cost_per_unit: 420,
    total_value: 4200,
    min_stock_alert: 3,
    supplier: 'किसान ॲग्रो',
    storage_location: 'औषध कपाट',
    notes: 'कांदा करपा प्रतिबंधक फवारणी',
  },
  {
    id: 'inv-5',
    item_name: 'ट्रॅक्टर व पंप डिझेल साठा',
    category: 'fuel',
    quantity: 120,
    unit: 'Liters',
    cost_per_unit: 92.5,
    total_value: 11100,
    min_stock_alert: 30,
    supplier: 'इंडियन ऑइल पंप',
    storage_location: 'इंधन बॅरेल शेड',
    notes: 'विहीर पंप व ट्रॅक्टर राखीव साठा',
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
    localStorage.setItem('smart_farm_lang', lang);
    const profile = await this.getProfile();
    setLocal('profile', { ...profile, language_preference: lang });

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

  // 2. Farms Management
  async getFarms(): Promise<Farm[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('farms').select('*').order('created_at', { ascending: true });
        if (data && !error && data.length > 0) return data as Farm[];
      } catch (e) {
        console.warn('Supabase getFarms failed, fallback to local', e);
      }
    }
    return getLocal<Farm[]>('farms', INITIAL_FARMS);
  },

  async addFarm(farm: Omit<Farm, 'id'>): Promise<Farm> {
    const currentFarms = await this.getFarms();
    const newFarm: Farm = {
      ...farm,
      id: `farm-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...farm, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('farms').insert([payload]).select().single();
        if (data && !error) {
          setLocal('farms', [...currentFarms, data as Farm]);
          return data as Farm;
        }
      } catch (e) {
        console.warn('Supabase addFarm fallback to local', e);
      }
    }

    setLocal('farms', [...currentFarms, newFarm]);
    return newFarm;
  },

  async updateFarm(id: string, updates: Partial<Farm>): Promise<void> {
    const farms = await this.getFarms();
    const updated = farms.map(f => (f.id === id ? { ...f, ...updates } : f));
    setLocal('farms', updated);

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('farms').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateFarm failed', e);
      }
    }
  },

  async deleteFarm(id: string): Promise<void> {
    const farms = await this.getFarms();
    setLocal('farms', farms.filter(f => f.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('farms').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteFarm failed', e);
      }
    }
  },

  // 3. Digital Plots Management (20-Acre validation)
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

    if (newTotal > this.TOTAL_FARM_ACRES) {
      const remaining = Math.max(0, this.TOTAL_FARM_ACRES - currentTotal);
      return {
        success: false,
        error: `एकूण शेती मर्यादा २० एकर आहे! सध्या फक्त ${remaining.toFixed(2)} एकर जागा शिल्लक आहे. (Total limit 20 acres, only ${remaining.toFixed(2)} acres available)`,
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
        const user = await getAuthUser();
        const payload: any = { ...plot, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('plots').insert([payload]).select().single();
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
    if (supabase && isUUID(id)) {
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
    setLocal('plots', currentPlots.filter(p => p.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('plots').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deletePlot failed', e);
      }
    }
  },

  // 4. Crops Management (Sugarcane, Wheat, Onion)
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
        const user = await getAuthUser();
        const payload: any = { ...crop, user_id: user?.id || undefined };
        if (!isUUID(payload.plot_id)) delete payload.plot_id; // prevent invalid uuid syntax
        const { data, error } = await supabase.from('crops').insert([payload]).select().single();
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
    if (supabase && isUUID(id)) {
      try {
        const payload: any = { ...updates };
        if (payload.plot_id && !isUUID(payload.plot_id)) delete payload.plot_id;
        await supabase.from('crops').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateCrop failed', e);
      }
    }
  },

  async deleteCrop(id: string): Promise<void> {
    const crops = await this.getCrops();
    setLocal('crops', crops.filter(c => c.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('crops').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCrop failed', e);
      }
    }
  },

  // 5. Workers, Attendance & Wages
  async getWorkers(): Promise<Worker[]> {
    let workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('workers').select('*').order('created_at', { ascending: true });
        if (data && !error && data.length > 0) {
          workers = data as Worker[];
        }
      } catch (e) {
        console.warn('Supabase getWorkers fallback', e);
      }
    }

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

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...worker, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('workers').insert([payload]).select().single();
        if (data && !error) {
          setLocal('workers', [...current, data as Worker]);
          return data as Worker;
        }
      } catch (e) {
        console.warn('Supabase addWorker fallback', e);
      }
    }

    setLocal('workers', [...current, newWorker]);
    return newWorker;
  },

  async updateWorker(id: string, updates: Partial<Worker>): Promise<void> {
    const workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);
    const updated = workers.map(w => (w.id === id ? { ...w, ...updates } : w));
    setLocal('workers', updated);

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('workers').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateWorker failed', e);
      }
    }
  },

  async deleteWorker(id: string): Promise<void> {
    const workers = getLocal<Worker[]>('workers', INITIAL_WORKERS);
    setLocal('workers', workers.filter(w => w.id !== id));

    const attendance = getLocal<WorkerAttendance[]>('attendance', INITIAL_ATTENDANCE);
    setLocal('attendance', attendance.filter(a => a.worker_id !== id));
    const advances = getLocal<WorkerAdvance[]>('advances', INITIAL_ADVANCES);
    setLocal('advances', advances.filter(a => a.worker_id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('workers').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteWorker failed', e);
      }
    }
  },

  async getAttendance(date?: string): Promise<WorkerAttendance[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        let query = supabase.from('worker_attendance').select('*');
        if (date) query = query.eq('date', date);
        const { data, error } = await query;
        if (data && !error && data.length > 0) return data as WorkerAttendance[];
      } catch (e) {
        console.warn('Supabase getAttendance fallback', e);
      }
    }

    const all = getLocal<WorkerAttendance[]>('attendance', INITIAL_ATTENDANCE);
    return date ? all.filter(a => a.date === date) : all;
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

    const supabase = getSupabaseClient();
    if (supabase && isUUID(workerId)) {
      try {
        const user = await getAuthUser();
        await supabase.from('worker_attendance').upsert({
          worker_id: workerId,
          date,
          status,
          notes,
          user_id: user?.id || undefined,
        }, { onConflict: 'worker_id,date' });
      } catch (e) {
        console.warn('Supabase markAttendance failed', e);
      }
    }
  },

  async getAdvances(): Promise<WorkerAdvance[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('worker_advances').select('*').order('date', { ascending: false });
        if (data && !error && data.length > 0) return data as WorkerAdvance[];
      } catch (e) {
        console.warn('Supabase getAdvances fallback', e);
      }
    }
    return getLocal<WorkerAdvance[]>('advances', INITIAL_ADVANCES);
  },

  async addAdvance(advance: Omit<WorkerAdvance, 'id'>): Promise<WorkerAdvance> {
    const all = await this.getAdvances();
    const newAdv: WorkerAdvance = {
      ...advance,
      id: `adv-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...advance, user_id: user?.id || undefined };
        if (!isUUID(payload.worker_id)) delete payload.worker_id;
        const { data, error } = await supabase.from('worker_advances').insert([payload]).select().single();
        if (data && !error) {
          setLocal('advances', [data as WorkerAdvance, ...all]);
          return data as WorkerAdvance;
        }
      } catch (e) {
        console.warn('Supabase addAdvance fallback', e);
      }
    }

    setLocal('advances', [newAdv, ...all]);
    return newAdv;
  },

  async deleteAdvance(id: string): Promise<void> {
    const all = await this.getAdvances();
    setLocal('advances', all.filter(a => a.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('worker_advances').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteAdvance failed', e);
      }
    }
  },

  async getPayouts(): Promise<WorkerPayout[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('worker_payouts').select('*').order('date', { ascending: false });
        if (data && !error && data.length > 0) return data as WorkerPayout[];
      } catch (e) {
        console.warn('Supabase getPayouts fallback', e);
      }
    }
    return getLocal<WorkerPayout[]>('payouts', []);
  },

  async recordPayout(payout: Omit<WorkerPayout, 'id'>): Promise<WorkerPayout> {
    const all = await this.getPayouts();
    const newPayout: WorkerPayout = {
      ...payout,
      id: `pay-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...payout, user_id: user?.id || undefined };
        if (!isUUID(payload.worker_id)) delete payload.worker_id;
        const { data, error } = await supabase.from('worker_payouts').insert([payload]).select().single();
        if (data && !error) {
          setLocal('payouts', [data as WorkerPayout, ...all]);
        }
      } catch (e) {
        console.warn('Supabase recordPayout fallback', e);
      }
    }

    setLocal('payouts', [newPayout, ...all]);

    // Automatically log to farm finances as Labour Expense
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

  // 6. Daily Tasks & Farming Activities
  async getTasks(): Promise<DailyTask[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('daily_tasks').select('*').order('due_date', { ascending: true });
        if (data && !error && data.length > 0) return data as DailyTask[];
      } catch (e) {
        console.warn('Supabase getTasks fallback', e);
      }
    }
    return getLocal<DailyTask[]>('tasks', INITIAL_TASKS);
  },

  async addTask(task: Omit<DailyTask, 'id'>): Promise<DailyTask> {
    const all = await this.getTasks();
    const newTask: DailyTask = {
      ...task,
      id: `task-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...task, user_id: user?.id || undefined };
        if (!isUUID(payload.plot_id)) delete payload.plot_id;
        const { data, error } = await supabase.from('daily_tasks').insert([payload]).select().single();
        if (data && !error) {
          setLocal('tasks', [data as DailyTask, ...all]);
          return data as DailyTask;
        }
      } catch (e) {
        console.warn('Supabase addTask fallback', e);
      }
    }

    setLocal('tasks', [newTask, ...all]);
    return newTask;
  },

  async updateTask(id: string, updates: Partial<DailyTask>): Promise<void> {
    const all = await this.getTasks();
    const updated = all.map(t => (t.id === id ? { ...t, ...updates } : t));
    setLocal('tasks', updated);

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        const payload: any = { ...updates };
        if (payload.plot_id && !isUUID(payload.plot_id)) delete payload.plot_id;
        await supabase.from('daily_tasks').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateTask failed', e);
      }
    }
  },

  async deleteTask(id: string): Promise<void> {
    const all = await this.getTasks();
    setLocal('tasks', all.filter(t => t.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('daily_tasks').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTask failed', e);
      }
    }
  },

  async getFarmingActivities(): Promise<FarmingActivity[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('farming_activities').select('*').order('due_date', { ascending: true });
        if (data && !error && data.length > 0) return data as FarmingActivity[];
      } catch (e) {
        console.warn('Supabase getFarmingActivities fallback', e);
      }
    }
    return getLocal<FarmingActivity[]>('farming_activities', INITIAL_FARMING_ACTIVITIES);
  },

  async addFarmingActivity(act: Omit<FarmingActivity, 'id'>): Promise<FarmingActivity> {
    const all = await this.getFarmingActivities();
    const newAct: FarmingActivity = {
      ...act,
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...act, user_id: user?.id || undefined };
        if (!isUUID(payload.plot_id)) delete payload.plot_id;
        if (!isUUID(payload.crop_id)) delete payload.crop_id;
        const { data, error } = await supabase.from('farming_activities').insert([payload]).select().single();
        if (data && !error) {
          setLocal('farming_activities', [data as FarmingActivity, ...all]);
          return data as FarmingActivity;
        }
      } catch (e) {
        console.warn('Supabase addFarmingActivity fallback', e);
      }
    }

    setLocal('farming_activities', [newAct, ...all]);
    return newAct;
  },

  // 7. Inventory Management (Fertilizer, Seed, Fuel, Pesticides, Tools)
  async getInventory(): Promise<InventoryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
        if (data && !error && data.length > 0) return data as InventoryItem[];
      } catch (e) {
        console.warn('Supabase getInventory fallback', e);
      }
    }
    return getLocal<InventoryItem[]>('inventory', INITIAL_INVENTORY);
  },

  async addInventoryItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const all = await this.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      total_value: Number(item.quantity || 0) * Number(item.cost_per_unit || 0),
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...item, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('inventory').insert([payload]).select().single();
        if (data && !error) {
          setLocal('inventory', [data as InventoryItem, ...all]);
          return data as InventoryItem;
        }
      } catch (e) {
        console.warn('Supabase addInventoryItem fallback', e);
      }
    }

    setLocal('inventory', [newItem, ...all]);
    return newItem;
  },

  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<void> {
    const all = await this.getInventory();
    const updated = all.map(i => {
      if (i.id !== id) return i;
      const merged = { ...i, ...updates };
      merged.total_value = Number(merged.quantity || 0) * Number(merged.cost_per_unit || 0);
      return merged;
    });
    setLocal('inventory', updated);

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('inventory').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateInventoryItem failed', e);
      }
    }
  },

  async deleteInventoryItem(id: string): Promise<void> {
    const all = await this.getInventory();
    setLocal('inventory', all.filter(i => i.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('inventory').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteInventoryItem failed', e);
      }
    }
  },

  // 8. Irrigation & Canal
  async getCanalSchedules(): Promise<CanalSchedule[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('canal_schedules').select('*').order('expected_date', { ascending: true });
        if (data && !error && data.length > 0) return data as CanalSchedule[];
      } catch (e) {
        console.warn('Supabase getCanalSchedules fallback', e);
      }
    }
    return getLocal<CanalSchedule[]>('canal_schedules', INITIAL_CANAL_SCHEDULES);
  },

  async addCanalSchedule(schedule: Omit<CanalSchedule, 'id'>): Promise<CanalSchedule> {
    const all = await this.getCanalSchedules();
    const newSchedule: CanalSchedule = {
      ...schedule,
      id: `canal-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...schedule, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('canal_schedules').insert([payload]).select().single();
        if (data && !error) {
          setLocal('canal_schedules', [data as CanalSchedule, ...all]);
          return data as CanalSchedule;
        }
      } catch (e) {
        console.warn('Supabase addCanalSchedule fallback', e);
      }
    }

    setLocal('canal_schedules', [newSchedule, ...all]);
    return newSchedule;
  },

  async deleteCanalSchedule(id: string): Promise<void> {
    const all = await this.getCanalSchedules();
    setLocal('canal_schedules', all.filter(c => c.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('canal_schedules').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCanalSchedule failed', e);
      }
    }
  },

  async getIrrigationLogs(): Promise<IrrigationLog[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('irrigation_logs').select('*').order('date', { ascending: false });
        if (data && !error && data.length > 0) return data as IrrigationLog[];
      } catch (e) {
        console.warn('Supabase getIrrigationLogs fallback', e);
      }
    }
    return getLocal<IrrigationLog[]>('irrigation_logs', INITIAL_IRRIGATION_LOGS);
  },

  async addIrrigationLog(log: Omit<IrrigationLog, 'id'>): Promise<IrrigationLog> {
    const all = await this.getIrrigationLogs();
    const newLog: IrrigationLog = {
      ...log,
      id: `irr-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...log, user_id: user?.id || undefined };
        if (!isUUID(payload.plot_id)) delete payload.plot_id;
        const { data, error } = await supabase.from('irrigation_logs').insert([payload]).select().single();
        if (data && !error) {
          setLocal('irrigation_logs', [data as IrrigationLog, ...all]);
        }
      } catch (e) {
        console.warn('Supabase addIrrigationLog fallback', e);
      }
    }

    setLocal('irrigation_logs', [newLog, ...all]);

    // If diesel cost incurred, add to finances automatically
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

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('irrigation_logs').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteIrrigationLog failed', e);
      }
    }
  },

  // 9. Finance Management (Income & Expenses)
  async getFinances(): Promise<FinanceItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('finances').select('*').order('date', { ascending: false });
        if (data && !error && data.length > 0) return data as FinanceItem[];
      } catch (e) {
        console.warn('Supabase getFinances fallback', e);
      }
    }
    return getLocal<FinanceItem[]>('finances', INITIAL_FINANCES);
  },

  async addFinanceItem(item: Omit<FinanceItem, 'id'>): Promise<FinanceItem> {
    const all = await this.getFinances();
    const newItem: FinanceItem = {
      ...item,
      id: `fin-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...item, user_id: user?.id || undefined };
        if (!isUUID(payload.crop_id)) delete payload.crop_id;
        if (!isUUID(payload.plot_id)) delete payload.plot_id;

        const { data, error } = await supabase.from('finances').insert([payload]).select().single();
        if (data && !error) {
          // Also sync to specialized expenses / income tables
          if (item.type === 'expense') {
            await supabase.from('expenses').insert([{ ...payload }]);
          } else {
            await supabase.from('income').insert([{ ...payload }]);
          }
          setLocal('finances', [data as FinanceItem, ...all]);
          return data as FinanceItem;
        }
      } catch (e) {
        console.warn('Supabase addFinanceItem fallback', e);
      }
    }

    setLocal('finances', [newItem, ...all]);
    return newItem;
  },

  async updateFinanceItem(id: string, updates: Partial<FinanceItem>): Promise<void> {
    const all = await this.getFinances();
    setLocal('finances', all.map(f => (f.id === id ? { ...f, ...updates } : f)));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        const payload: any = { ...updates };
        if (payload.crop_id && !isUUID(payload.crop_id)) delete payload.crop_id;
        if (payload.plot_id && !isUUID(payload.plot_id)) delete payload.plot_id;
        await supabase.from('finances').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateFinanceItem failed', e);
      }
    }
  },

  async deleteFinanceItem(id: string): Promise<void> {
    const all = await this.getFinances();
    setLocal('finances', all.filter(f => f.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('finances').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteFinanceItem failed', e);
      }
    }
  },

  // Specialized Expenses & Income CRUD
  async getExpenses(): Promise<Expense[]> {
    const all = await this.getFinances();
    return all.filter(f => f.type === 'expense').map(f => ({
      id: f.id,
      category: f.category,
      amount: f.amount,
      date: f.date,
      crop_id: f.crop_id,
      crop_name: f.crop_name,
      plot_id: f.plot_id,
      payment_mode: f.payment_mode,
      receipt_url: f.receipt_url,
      notes: f.notes,
    }));
  },

  async addExpense(expense: Omit<Expense, 'id'>): Promise<FinanceItem> {
    return this.addFinanceItem({
      ...expense,
      type: 'expense',
    });
  },

  async getIncome(): Promise<Income[]> {
    const all = await this.getFinances();
    return all.filter(f => f.type === 'income').map(f => ({
      id: f.id,
      category: f.category,
      amount: f.amount,
      date: f.date,
      crop_id: f.crop_id,
      crop_name: f.crop_name,
      plot_id: f.plot_id,
      payment_mode: f.payment_mode,
      notes: f.notes,
    }));
  },

  async addIncome(income: Omit<Income, 'id'>): Promise<FinanceItem> {
    return this.addFinanceItem({
      ...income,
      type: 'income',
    });
  },

  // 10. Machinery
  async getMachinery(): Promise<MachineryItem[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('machinery').select('*').order('created_at', { ascending: true });
        if (data && !error && data.length > 0) return data as MachineryItem[];
      } catch (e) {
        console.warn('Supabase getMachinery fallback', e);
      }
    }
    return getLocal<MachineryItem[]>('machinery', INITIAL_MACHINERY);
  },

  async addMachinery(item: Omit<MachineryItem, 'id'>): Promise<MachineryItem> {
    const all = await this.getMachinery();
    const newItem: MachineryItem = {
      ...item,
      id: `mac-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...item, user_id: user?.id || undefined };
        const { data, error } = await supabase.from('machinery').insert([payload]).select().single();
        if (data && !error) {
          setLocal('machinery', [...all, data as MachineryItem]);
          return data as MachineryItem;
        }
      } catch (e) {
        console.warn('Supabase addMachinery fallback', e);
      }
    }

    setLocal('machinery', [...all, newItem]);
    return newItem;
  },

  async updateMachinery(id: string, updates: Partial<MachineryItem>): Promise<void> {
    const all = await this.getMachinery();
    setLocal('machinery', all.map(m => (m.id === id ? { ...m, ...updates } : m)));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('machinery').update(updates).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateMachinery failed', e);
      }
    }
  },

  async deleteMachinery(id: string): Promise<void> {
    const all = await this.getMachinery();
    setLocal('machinery', all.filter(m => m.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('machinery').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteMachinery failed', e);
      }
    }
  },

  // 11. Crop Health Records
  async getCropHealthRecords(): Promise<CropHealthRecord[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('crop_health_records').select('*').order('observation_date', { ascending: false });
        if (data && !error && data.length > 0) return data as CropHealthRecord[];
      } catch (e) {
        console.warn('Supabase getCropHealthRecords fallback', e);
      }
    }
    return getLocal<CropHealthRecord[]>('crop_health', INITIAL_CROP_HEALTH);
  },

  async addCropHealthRecord(record: Omit<CropHealthRecord, 'id'>): Promise<CropHealthRecord> {
    const all = await this.getCropHealthRecords();
    const newRecord: CropHealthRecord = {
      ...record,
      id: `health-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...record, user_id: user?.id || undefined };
        if (!isUUID(payload.plot_id)) delete payload.plot_id;
        if (!isUUID(payload.crop_id)) delete payload.crop_id;
        const { data, error } = await supabase.from('crop_health_records').insert([payload]).select().single();
        if (data && !error) {
          setLocal('crop_health', [data as CropHealthRecord, ...all]);
          return data as CropHealthRecord;
        }
      } catch (e) {
        console.warn('Supabase addCropHealthRecord fallback', e);
      }
    }

    setLocal('crop_health', [newRecord, ...all]);
    return newRecord;
  },

  async updateCropHealthRecord(id: string, updates: Partial<CropHealthRecord>): Promise<void> {
    const all = await this.getCropHealthRecords();
    setLocal('crop_health', all.map(r => (r.id === id ? { ...r, ...updates } : r)));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        const payload: any = { ...updates };
        if (payload.plot_id && !isUUID(payload.plot_id)) delete payload.plot_id;
        if (payload.crop_id && !isUUID(payload.crop_id)) delete payload.crop_id;
        await supabase.from('crop_health_records').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateCropHealthRecord failed', e);
      }
    }
  },

  async deleteCropHealthRecord(id: string): Promise<void> {
    const all = await this.getCropHealthRecords();
    setLocal('crop_health', all.filter(r => r.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('crop_health_records').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteCropHealthRecord failed', e);
      }
    }
  },

  // 12. Harvest & Sales
  async getHarvestSales(): Promise<HarvestSale[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.from('harvest_sales').select('*').order('harvest_date', { ascending: false });
        if (data && !error && data.length > 0) return data as HarvestSale[];
      } catch (e) {
        console.warn('Supabase getHarvestSales fallback', e);
      }
    }
    return getLocal<HarvestSale[]>('harvest_sales', INITIAL_HARVEST_SALES);
  },

  async addHarvestSale(sale: Omit<HarvestSale, 'id'>): Promise<HarvestSale> {
    const all = await this.getHarvestSales();
    const newSale: HarvestSale = {
      ...sale,
      id: `sale-${Date.now()}`,
    };

    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const payload: any = { ...sale, user_id: user?.id || undefined };
        if (!isUUID(payload.crop_id)) delete payload.crop_id;
        if (!isUUID(payload.plot_id)) delete payload.plot_id;
        const { data, error } = await supabase.from('harvest_sales').insert([payload]).select().single();
        if (data && !error) {
          setLocal('harvest_sales', [data as HarvestSale, ...all]);
        }
      } catch (e) {
        console.warn('Supabase addHarvestSale fallback', e);
      }
    }

    setLocal('harvest_sales', [newSale, ...all]);

    // If money received, log as income to finances automatically
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

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        const payload: any = { ...updates };
        if (payload.crop_id && !isUUID(payload.crop_id)) delete payload.crop_id;
        if (payload.plot_id && !isUUID(payload.plot_id)) delete payload.plot_id;
        await supabase.from('harvest_sales').update(payload).eq('id', id);
      } catch (e) {
        console.warn('Supabase updateHarvestSale failed', e);
      }
    }
  },

  async deleteHarvestSale(id: string): Promise<void> {
    const all = await this.getHarvestSales();
    setLocal('harvest_sales', all.filter(s => s.id !== id));

    const supabase = getSupabaseClient();
    if (supabase && isUUID(id)) {
      try {
        await supabase.from('harvest_sales').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteHarvestSale failed', e);
      }
    }
  },

  // 13. Global Reset & Clear All Data (with confirmation safety)
  async clearAllFarmData(): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const user = await getAuthUser();
        const tables = [
          'harvest_sales', 'crop_health_records', 'machinery_logs', 'machinery',
          'expenses', 'income', 'finances', 'irrigation_logs', 'canal_schedules',
          'inventory', 'farming_activities', 'daily_tasks', 'worker_payouts',
          'worker_advances', 'worker_attendance', 'workers', 'crop_fertilizers',
          'crops', 'plots', 'farms'
        ];
        for (const tbl of tables) {
          if (user) {
            await supabase.from(tbl).delete().eq('user_id', user.id);
          } else {
            await supabase.from(tbl).delete().neq('id', '00000000-0000-0000-0000-000000000000');
          }
        }
      } catch (e) {
        console.warn('Supabase clear failed', e);
      }
    }

    const collections = [
      'farms', 'plots', 'crops', 'workers', 'attendance', 'advances', 'payouts',
      'tasks', 'farming_activities', 'canal_schedules', 'irrigation_logs',
      'finances', 'expenses', 'income', 'inventory', 'machinery',
      'crop_health', 'harvest_sales'
    ];
    collections.forEach(key => {
      setLocal(key, []);
    });
  },

  async resetAllDataToDefaults(): Promise<void> {
    setLocal('farms', INITIAL_FARMS);
    setLocal('plots', INITIAL_PLOTS);
    setLocal('crops', INITIAL_CROPS);
    setLocal('workers', INITIAL_WORKERS);
    setLocal('attendance', INITIAL_ATTENDANCE);
    setLocal('advances', INITIAL_ADVANCES);
    setLocal('payouts', []);
    setLocal('tasks', INITIAL_TASKS);
    setLocal('farming_activities', INITIAL_FARMING_ACTIVITIES);
    setLocal('canal_schedules', INITIAL_CANAL_SCHEDULES);
    setLocal('irrigation_logs', INITIAL_IRRIGATION_LOGS);
    setLocal('finances', INITIAL_FINANCES);
    setLocal('expenses', INITIAL_EXPENSES);
    setLocal('income', INITIAL_INCOME);
    setLocal('inventory', INITIAL_INVENTORY);
    setLocal('machinery', INITIAL_MACHINERY);
    setLocal('crop_health', INITIAL_CROP_HEALTH);
    setLocal('harvest_sales', INITIAL_HARVEST_SALES);
  },
};
