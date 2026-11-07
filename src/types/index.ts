export type Language = 'mr' | 'hi' | 'en';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  farm_name: string;
  total_acres: number;
  language_preference: Language;
  phone_number?: string;
  created_at?: string;
}

export type SoilType = 'black' | 'red' | 'alluvial' | 'loamy';
export type PlotStatus = 'cultivated' | 'fallow' | 'preparing';

export interface Plot {
  id: string;
  name: string;
  area_acres: number;
  soil_type: SoilType;
  status: PlotStatus;
  current_crop?: string;
  notes?: string;
  created_at?: string;
}

export type CropType = 'sugarcane' | 'wheat' | 'onion' | 'other';
export type GrowthStage = 'germination' | 'vegetative' | 'flowering' | 'maturity' | 'harvesting';

export interface Crop {
  id: string;
  plot_id: string;
  plot_name?: string;
  crop_type: CropType;
  crop_name: string;
  variety: string;
  sowing_date: string;
  expected_harvest_date: string;
  actual_harvest_date?: string;
  growth_stage: GrowthStage;
  target_yield: number;
  actual_yield?: number;
  unit: string;
  notes?: string;
  created_at?: string;
}

export interface FertilizerRecord {
  id: string;
  crop_id: string;
  crop_name?: string;
  fertilizer_name: string;
  quantity_used: number;
  unit: string;
  application_date: string;
  cost: number;
}

export interface Worker {
  id: string;
  name: string;
  phone: string;
  daily_wage: number;
  join_date: string;
  is_active: boolean;
  notes?: string;
  // Computed helpers:
  total_days_worked?: number;
  total_earned?: number;
  total_advances?: number;
  total_payouts?: number;
  net_payable?: number;
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day';

export interface WorkerAttendance {
  id: string;
  worker_id: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface WorkerAdvance {
  id: string;
  worker_id: string;
  date: string;
  amount: number;
  reason?: string;
}

export interface WorkerPayout {
  id: string;
  worker_id: string;
  date: string;
  amount: number;
  payment_method: 'cash' | 'upi' | 'bank_transfer';
  notes?: string;
}

export type Priority = 'urgent' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  plot_id?: string;
  plot_name?: string;
  assigned_worker_ids: string[];
  priority: Priority;
  status: TaskStatus;
  due_date: string;
  created_at?: string;
}

export interface CanalSchedule {
  id: string;
  expected_date: string;
  actual_date?: string;
  status: 'scheduled' | 'running' | 'stopped';
  discharge_cusec?: number;
  notes?: string;
}

export interface IrrigationLog {
  id: string;
  plot_id: string;
  plot_name?: string;
  source: 'canal' | 'pump';
  date: string;
  start_time?: string;
  end_time?: string;
  duration_hours: number;
  energy_type?: 'electric' | 'diesel';
  fuel_liters?: number;
  electricity_units?: number;
  fuel_cost?: number;
  notes?: string;
}

export type FinanceType = 'income' | 'expense';

export interface FinanceItem {
  id: string;
  type: FinanceType;
  category: string;
  amount: number;
  date: string;
  crop_id?: string;
  crop_name?: string;
  plot_id?: string;
  plot_name?: string;
  payment_mode: 'cash' | 'bank_upi' | 'cheque';
  receipt_url?: string;
  notes?: string;
}

export type MachineryCondition = 'good' | 'needs_service' | 'breakdown';

export interface MachineryItem {
  id: string;
  name: string;
  model: string;
  purchase_year: number;
  condition: MachineryCondition;
  next_service_due?: string;
  notes?: string;
}

export interface MachineryLog {
  id: string;
  machinery_id: string;
  machinery_name?: string;
  log_type: 'maintenance' | 'fuel' | 'repair';
  cost: number;
  fuel_liters?: number;
  date: string;
  notes?: string;
}

export interface CropHealthRecord {
  id: string;
  plot_id: string;
  plot_name?: string;
  crop_id: string;
  crop_name?: string;
  symptoms: string;
  diagnosis_guidance?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  image_url?: string;
  observation_date: string;
  status: 'under_observation' | 'treated' | 'resolved';
}

export interface HarvestSale {
  id: string;
  crop_id: string;
  crop_name?: string;
  plot_id?: string;
  plot_name?: string;
  harvest_date: string;
  quantity: number;
  unit: string;
  rate_per_unit: number;
  total_amount: number;
  buyer_name: string;
  buyer_phone?: string;
  received_amount: number;
  pending_amount: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  rainfallProbability: number;
  weatherCode: number;
  conditionText: string;
  locationName: string;
  forecast: {
    date: string;
    dayName: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    icon: string;
  }[];
}
