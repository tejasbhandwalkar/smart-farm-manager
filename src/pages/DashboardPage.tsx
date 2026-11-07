import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Map,
  Wheat,
  Users,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Droplets,
  Power,
  Plus,
  CloudSun,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Bot,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { FarmDB } from '../services/db';
import { fetchFarmWeather } from '../services/weather';
import {
  Plot,
  Crop,
  Worker,
  WorkerAttendance,
  DailyTask,
  CanalSchedule,
  IrrigationLog,
  FinanceItem,
  WeatherData,
} from '../types';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<WorkerAttendance[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [canalSchedules, setCanalSchedules] = useState<CanalSchedule[]>([]);
  const [irrigationLogs, setIrrigationLogs] = useState<IrrigationLog[]>([]);
  const [finances, setFinances] = useState<FinanceItem[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);

  // Pump state for quick action toggle
  const [isPumpRunning, setIsPumpRunning] = useState(false);
  const [pumpStartTime, setPumpStartTime] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [
          plotsData,
          cropsData,
          workersData,
          attData,
          tasksData,
          canalData,
          irrData,
          finData,
          weatherData,
        ] = await Promise.all([
          FarmDB.getPlots(),
          FarmDB.getCrops(),
          FarmDB.getWorkers(),
          FarmDB.getAttendance(new Date().toISOString().split('T')[0]),
          FarmDB.getTasks(),
          FarmDB.getCanalSchedules(),
          FarmDB.getIrrigationLogs(),
          FarmDB.getFinances(),
          fetchFarmWeather(),
        ]);

        setPlots(plotsData);
        setCrops(cropsData);
        setWorkers(workersData);
        setAttendance(attData);
        setTasks(tasksData);
        setCanalSchedules(canalData);
        setIrrigationLogs(irrData);
        setFinances(finData);
        setWeather(weatherData);

        // Check if pump was marked running in localStorage
        const storedPump = localStorage.getItem('sfm_pump_running');
        if (storedPump === 'true') {
          setIsPumpRunning(true);
          setPumpStartTime(localStorage.getItem('sfm_pump_start') || 'सकाळी ०८:००');
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Land calculations
  const totalFarmAcres = FarmDB.TOTAL_FARM_ACRES;
  const cultivatedAcres = plots
    .filter(p => p.status === 'cultivated')
    .reduce((sum, p) => sum + Number(p.area_acres || 0), 0);
  const availableAcres = Math.max(0, totalFarmAcres - cultivatedAcres);

  // Workers calculations
  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const halfDayCount = attendance.filter(a => a.status === 'half_day').length;
  const pendingWagesTotal = workers.reduce((sum, w) => sum + (w.net_payable || 0), 0);

  // Tasks calculations
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Finances calculations (Current month)
  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalExpenses = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const netProfit = totalIncome - totalExpenses;

  // Canal status
  const nextCanal = canalSchedules.find(c => c.status === 'scheduled');

  // Chart data: Crop-wise Area Distribution
  const cropColors = ['#15803d', '#f59e0b', '#8b5cf6', '#94a3b8'];
  const cropChartData = [
    { name: 'ऊस (Sugarcane)', value: 8.0, color: '#15803d' },
    { name: 'गहू (Wheat)', value: 6.0, color: '#f59e0b' },
    { name: 'कांदा (Onion)', value: 4.0, color: '#8b5cf6' },
    { name: 'पडीक / मशागत', value: 2.0, color: '#cbd5e1' },
  ];

  // Chart data: Monthly Income & Expense
  const financeChartData = [
    { month: 'ऑगस्ट', Income: 85000, Expense: 42000 },
    { month: 'सप्टेंबर', Income: 110000, Expense: 55000 },
    { month: 'ऑक्टोबर', Income: 213000, Expense: 60100 },
    { month: 'नोव्हेंबर', Income: totalIncome, Expense: totalExpenses },
  ];

  // Quick Action: Toggle Pump
  const handleTogglePump = async () => {
    const nextState = !isPumpRunning;
    setIsPumpRunning(nextState);
    if (nextState) {
      const nowStr = new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
      setPumpStartTime(nowStr);
      localStorage.setItem('sfm_pump_running', 'true');
      localStorage.setItem('sfm_pump_start', nowStr);
    } else {
      localStorage.removeItem('sfm_pump_running');
      localStorage.removeItem('sfm_pump_start');
      setPumpStartTime(null);
      // Auto-log a completed 4-hour cycle
      await FarmDB.addIrrigationLog({
        plot_id: plots[0]?.id || 'plot-1',
        plot_name: plots[0]?.name || 'प्लॉट १ (विहीर शेजारी मळा)',
        source: 'pump',
        date: new Date().toISOString().split('T')[0],
        duration_hours: 4.0,
        energy_type: 'electric',
        electricity_units: 24,
        notes: 'पंपाने ठिबक सिंचन पाणी पूर्ण दिले',
      });
      const updatedLogs = await FarmDB.getIrrigationLogs();
      setIrrigationLogs(updatedLogs);
    }
  };

  // Quick Action: Mark task complete
  const handleCompleteTask = async (taskId: string) => {
    await FarmDB.updateTask(taskId, { status: 'completed' });
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, status: 'completed' } : t)));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-800 font-semibold text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. TOP GREETING & WEATHER BANNER */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>२० एकर शेती • ऊस, गहू व कांदा</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('dashboard.greeting')}, शेतकरी दादा!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              आजच्या शेती कामांचा आढावा, पाणी पाळी नियोजन, मजुरांची हजेरी व उत्पन्न-खर्च हिशोब येथे उपलब्ध आहे.
            </p>
          </div>

          {/* Quick Weather Snapshot inside Banner */}
          {weather && (
            <Link
              to="/weather"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 text-white flex items-center space-x-4 transition-all group shrink-0"
            >
              <div className="text-3xl sm:text-4xl">
                {weather.forecast[0]?.icon || '☀️'}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl sm:text-3xl font-black">
                    {weather.temperature}°C
                  </span>
                  <span className="text-xs bg-emerald-900/60 px-2 py-0.5 rounded-full text-emerald-200">
                    पाऊस: {weather.rainfallProbability}%
                  </span>
                </div>
                <p className="text-xs text-emerald-100 font-medium group-hover:text-yellow-200 flex items-center">
                  <span>{weather.conditionText}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* AI KRISHI MITRA ADVISOR STRIP */}
      <Link
        to="/ai-advisor"
        className="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 border-2 border-emerald-300 hover:border-emerald-500 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-all group"
      >
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform shrink-0">
            🤖
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-emerald-800 transition-colors">
                AI कृषी सल्लागार (AI Krishi Mitra)
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white animate-pulse">
                नवीन AI
              </span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
              उसाचे खत नियोजन, कांद्यावरील करपा किंवा गव्हाच्या पाणी पाळीबद्दल थेट AI ला विचारा...
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1 text-xs font-bold text-emerald-800 bg-white px-3 py-2 rounded-xl border border-emerald-200 group-hover:bg-emerald-700 group-hover:text-white transition-all shrink-0">
          <span className="hidden sm:inline">सल्ला विचारा</span>
          <ChevronRight className="w-4 h-4" />
        </div>
      </Link>

      {/* 2. QUICK ACTION BUTTONS (MOBILE-FRIENDLY LARGE TOUCH TARGETS) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Toggle Pump */}
        <button
          onClick={handleTogglePump}
          className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all shadow-sm ${
            isPumpRunning
              ? 'bg-blue-600 text-white border-blue-700 shadow-blue-500/20'
              : 'bg-white hover:bg-emerald-50/50 text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isPumpRunning ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              <Power className="w-5 h-5" />
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isPumpRunning ? 'bg-emerald-400 text-emerald-950 animate-pulse' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isPumpRunning ? 'चालू आहे' : 'बंद आहे'}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block">
              {isPumpRunning ? 'पंप बंद करा' : t('dashboard.start_pump')}
            </span>
            <span className="text-[11px] opacity-80 block truncate">
              {isPumpRunning ? `सुरू: ${pumpStartTime}` : 'किर्लोस्कर ७.५ HP'}
            </span>
          </div>
        </button>

        {/* Mark Attendance */}
        <Link
          to="/workers"
          className="p-4 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 hover:border-emerald-300 text-slate-800 flex flex-col justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {presentCount}/{workers.length} हजर
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block text-slate-900 group-hover:text-emerald-800">
              {t('dashboard.mark_attendance')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              १०+ मजुरांची नोंद
            </span>
          </div>
        </Link>

        {/* Add Expense */}
        <Link
          to="/finance"
          className="p-4 bg-white hover:bg-rose-50/50 rounded-2xl border border-slate-200 hover:border-rose-300 text-slate-800 flex flex-col justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              हिशोब
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block text-slate-900 group-hover:text-rose-800">
              {t('dashboard.add_expense')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              खत, बियाणे, मजुरी
            </span>
          </div>
        </Link>

        {/* Add Task */}
        <Link
          to="/tasks"
          className="p-4 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 hover:border-amber-300 text-slate-800 flex flex-col justify-between transition-all shadow-sm group"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pendingTasks.length} कामे बाकी
            </span>
          </div>
          <div className="mt-3">
            <span className="text-xs font-bold block text-slate-900 group-hover:text-amber-800">
              {t('dashboard.add_task')}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              रोजची शेती कामे
            </span>
          </div>
        </Link>
      </div>

      {/* 3. KEY METRICS STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Land Area */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.total_land')}</span>
            <Map className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {totalFarmAcres.toFixed(1)} <span className="text-sm font-semibold text-slate-600">{t('dashboard.acres')}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
              <span>लागवड: <strong className="text-emerald-700">{cultivatedAcres.toFixed(1)}</strong></span>
              <span>रिकामी: <strong className="text-amber-700">{availableAcres.toFixed(1)}</strong></span>
            </div>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.monthly_income')}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹{totalIncome.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mr-0.5" />
              <span>ऊस व कांदा विक्री</span>
            </p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.monthly_expenses')}</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 mr-0.5" />
              <span>मजुरी, खते व डिझेल</span>
            </p>
          </div>
        </div>

        {/* Pending Wages Total */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">{t('dashboard.pending_wages')}</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-700">
              ₹{pendingWagesTotal.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
              <span>एकूण मजूर: <strong>{workers.length}</strong></span>
              <Link to="/workers" className="text-emerald-700 font-bold hover:underline">हिशोब →</Link>
            </p>
          </div>
        </div>

      </div>

      {/* 4. VISUAL CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Crop Distribution on 20 Acres */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.crop_distribution')} (२० एकर)
              </h3>
              <p className="text-xs text-slate-500">प्रत्येक पिकाखालील प्रत्यक्ष क्षेत्र</p>
            </div>
            <Link to="/plots" className="text-xs font-semibold text-emerald-700 hover:underline">
              प्लॉट बदला →
            </Link>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${value} एकर`}
                >
                  {cropChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} एकर`, 'क्षेत्र']} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Monthly Income vs Expense */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.income_expense_trend')}
              </h3>
              <p className="text-xs text-slate-500">मागील महिन्यांची तुलना (रुपये)</p>
            </div>
            <Link to="/finance" className="text-xs font-semibold text-emerald-700 hover:underline">
              पूर्ण हिशोब →
            </Link>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financeChartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']} />
                <Legend verticalAlign="bottom" height={36} />
                <Bar dataKey="Income" name="जमा (Income)" fill="#16a34a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" name="खर्च (Expense)" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 5. TODAY'S TASKS & IRRIGATION / CANAL STATUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks (2 Columns on large screen) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.today_tasks')} ({pendingTasks.length})
              </h3>
            </div>
            <Link to="/tasks" className="text-xs font-semibold text-emerald-700 hover:underline">
              सर्व कामे पहा →
            </Link>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map(task => (
              <div
                key={task.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  task.status === 'completed'
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : task.priority === 'urgent'
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => handleCompleteTask(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                      task.status === 'completed'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'border-slate-300 hover:border-emerald-600'
                    }`}
                  >
                    {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                  <div>
                    <h4
                      className={`text-sm font-bold text-slate-900 ${
                        task.status === 'completed' ? 'line-through text-slate-500' : ''
                      }`}
                    >
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-2 mt-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        {task.plot_name}
                      </span>
                      <span>मजूर: {task.assigned_worker_ids.length} नेमले</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                    task.priority === 'urgent'
                      ? 'bg-rose-100 text-rose-800'
                      : task.priority === 'medium'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.priority === 'urgent' ? 'तातडीचे' : task.priority === 'medium' ? 'मध्यम' : 'सामान्य'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Irrigation & Canal Summary (1 Column) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                {t('dashboard.irrigation_status')}
              </h3>
            </div>

            {/* Canal Status Card */}
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">कालवा (कॅनॉल) पाणी:</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-200 text-blue-800">
                  {nextCanal?.status === 'running' ? 'पाणी चालू' : 'नियोजित'}
                </span>
              </div>
              <p className="text-xs text-blue-800 mt-1">
                पुढील आवर्तन: <strong>{nextCanal?.expected_date || '१२ नोव्हेंबर'}</strong>
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                {nextCanal?.notes || 'नीरा डावा कालवा रब्बी पाणी पाळी'}
              </p>
            </div>

            {/* Well Pump Card */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950">विहीर पंप (Kirloskar 7.5 HP):</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isPumpRunning ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isPumpRunning ? 'चालू' : 'बंद'}
                </span>
              </div>
              <p className="text-xs text-emerald-900 mt-1">
                शेवटचे सिंचन: काल ५.५ तास (प्लॉट १ ऊस ठिबक)
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                वीज युनिट: ३२ युनिट वापर
              </p>
            </div>
          </div>

          <Link
            to="/irrigation"
            className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded-xl text-center text-xs transition-colors border border-blue-200"
          >
            सिंचन नोंदवही व नियोजन पहा →
          </Link>
        </div>

      </div>

    </div>
  );
};
