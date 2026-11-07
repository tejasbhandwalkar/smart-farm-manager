import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  DollarSign,
  FileSpreadsheet,
  Calendar,
  Phone,
  Search,
  Wallet,
  X,
  CreditCard,
  AlertCircle,
  ArrowRight,
  Edit2,
  Trash2,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { exportWorkersToExcel } from '../services/export';
import { Worker, WorkerAttendance, WorkerAdvance, AttendanceStatus } from '../types';

export const WorkersPage: React.FC = () => {
  const { t } = useTranslation();

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<WorkerAttendance[]>([]);
  const [advances, setAdvances] = useState<WorkerAdvance[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'attendance' | 'workers' | 'advances' | 'payouts'>('attendance');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [addWorkerModal, setAddWorkerModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [advanceModal, setAdvanceModal] = useState(false);
  const [payoutModal, setPayoutModal] = useState(false);
  const [selectedWorkerForPay, setSelectedWorkerForPay] = useState<Worker | null>(null);

  // Add / Edit Worker Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dailyWage, setDailyWage] = useState(400);
  const [workerNotes, setWorkerNotes] = useState('');

  // Advance Form
  const [advWorkerId, setAdvWorkerId] = useState('');
  const [advAmount, setAdvAmount] = useState(1000);
  const [advReason, setAdvReason] = useState('घरगुती खर्च');

  // Payout Form
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'cash' | 'upi'>('cash');
  const [payNotes, setPayNotes] = useState('साप्ताहिक मजुरी वाटप');

  const loadWorkersData = async () => {
    setLoading(true);
    const [workersData, attData, advData] = await Promise.all([
      FarmDB.getWorkers(),
      FarmDB.getAttendance(selectedDate),
      FarmDB.getAdvances(),
    ]);
    setWorkers(workersData);
    setAttendance(attData);
    setAdvances(advData);
    if (workersData.length > 0 && !advWorkerId) {
      setAdvWorkerId(workersData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadWorkersData();
  }, [selectedDate]);

  // Attendance quick action
  const handleSetAttendance = async (workerId: string, status: AttendanceStatus) => {
    await FarmDB.markAttendance(workerId, selectedDate, status);
    const updatedAtt = await FarmDB.getAttendance(selectedDate);
    setAttendance(updatedAtt);
    const updatedWorkers = await FarmDB.getWorkers();
    setWorkers(updatedWorkers);
  };

  const handleOpenAddWorker = () => {
    setEditingWorker(null);
    setName('');
    setPhone('');
    setDailyWage(400);
    setWorkerNotes('');
    setAddWorkerModal(true);
  };

  const handleOpenEditWorker = (worker: Worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setPhone(worker.phone || '');
    setDailyWage(worker.daily_wage || 400);
    setWorkerNotes(worker.notes || '');
    setAddWorkerModal(true);
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (window.confirm(t('common.confirm_delete') || 'तुम्हाला खात्री आहे का या मजुराची सर्व माहिती व हजेरी हटवायची?')) {
      await FarmDB.deleteWorker(workerId);
      await loadWorkersData();
    }
  };

  const handleDeleteAdvance = async (advanceId: string) => {
    if (window.confirm('ही उचल नोंद हटवायची आहे का?')) {
      await FarmDB.deleteAdvance(advanceId);
      await loadWorkersData();
    }
  };

  const handleSaveWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWorker) {
      await FarmDB.updateWorker(editingWorker.id, {
        name,
        phone,
        daily_wage: Number(dailyWage),
        notes: workerNotes,
      });
    } else {
      await FarmDB.addWorker({
        name,
        phone,
        daily_wage: Number(dailyWage),
        join_date: new Date().toISOString().split('T')[0],
        is_active: true,
        notes: workerNotes,
      });
    }
    setAddWorkerModal(false);
    setEditingWorker(null);
    setName('');
    setPhone('');
    setWorkerNotes('');
    await loadWorkersData();
  };

  const handleAddAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    await FarmDB.addAdvance({
      worker_id: advWorkerId,
      date: selectedDate,
      amount: Number(advAmount),
      reason: advReason,
    });
    setAdvanceModal(false);
    await loadWorkersData();
  };

  const handleOpenPayout = (w: Worker) => {
    setSelectedWorkerForPay(w);
    setPayAmount(w.net_payable || 0);
    setPayoutModal(true);
  };

  const handleExecutePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkerForPay) return;

    await FarmDB.recordPayout({
      worker_id: selectedWorkerForPay.id,
      date: new Date().toISOString().split('T')[0],
      amount: Number(payAmount),
      payment_method: payMethod,
      notes: payNotes,
    });

    setPayoutModal(false);
    alert('मजुरी वाटप यशस्वीरित्या नोंदवले व शेती खर्चात समाविष्ट केले!');
    await loadWorkersData();
  };

  const filteredWorkers = workers.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.phone.includes(searchQuery)
  );

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const halfDayCount = attendance.filter(a => a.status === 'half_day').length;
  const totalPendingWages = workers.reduce((sum, w) => sum + (w.net_payable || 0), 0);
  const totalAdvancesSum = advances.reduce((sum, a) => sum + Number(a.amount || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Users className="w-6 h-6 text-emerald-700" />
            <span>{t('workers.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('workers.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportWorkersToExcel(workers)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
            title="Excel मध्ये डाऊनलोड करा"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span className="hidden sm:inline">Excel हजेरी पत्रक</span>
          </button>

          <button
            onClick={() => setAdvanceModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Wallet className="w-4 h-4" />
            <span>+ उचल (Advance)</span>
          </button>

          <button
            onClick={handleOpenAddWorker}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ मजूर जोडा</span>
          </button>
        </div>
      </div>

      {/* 4 Quick Stat Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.total_workers')}</span>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {workers.length} <span className="text-xs font-semibold text-slate-500">मजूर</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">सर्व नियमित मजूर</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.today_attendance')}</span>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {presentCount} <span className="text-xs font-semibold text-slate-500">हजर</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {absentCount} गैरहजर • {halfDayCount} अर्धा दिवस
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">एकूण उचल रक्कम</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            ₹{totalAdvancesSum.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-500">{advances.length} नोंदी</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('dashboard.pending_wages')}</span>
          <div className="text-2xl font-black text-rose-700 mt-1">
            ₹{totalPendingWages.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-700 font-medium">वाटप बाकी रक्कम</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-sm text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'attendance'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          आजची हजेरी (Daily Attendance)
        </button>
        <button
          onClick={() => setActiveTab('workers')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'workers'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          मजूर यादी व मजुरी हिशोब ({workers.length})
        </button>
        <button
          onClick={() => setActiveTab('advances')}
          className={`flex-1 py-2.5 rounded-xl transition-all ${
            activeTab === 'advances'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          उचल (Advances)
        </button>
      </div>

      {/* TAB 1: ATTENDANCE (LARGE MOBILE TOUCH TARGETS) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          
          {/* Date Selector bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
              <label className="text-xs sm:text-sm font-bold text-slate-800">
                तारीख निवडा:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>हजर ({presentCount})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>अर्धा ({halfDayCount})</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>गैरहजर ({absentCount})</span>
              </span>
            </div>
          </div>

          {/* Attendance Cards Grid with One-Tap Buttons */}
          <div className="space-y-2.5">
            {workers.map(worker => {
              const attRecord = attendance.find(a => a.worker_id === worker.id);
              const currentStatus = attRecord?.status || 'unmarked';

              return (
                <div
                  key={worker.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                      {worker.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 leading-tight">
                        {worker.name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                        <span>रोज: <strong>₹{worker.daily_wage}</strong></span>
                        {worker.phone && <span>• 📞 {worker.phone}</span>}
                      </p>
                    </div>
                  </div>

                  {/* 3 Touch-Friendly Status Buttons */}
                  <div className="grid grid-cols-3 gap-2 w-full sm:w-auto">
                    {/* Present */}
                    <button
                      type="button"
                      onClick={() => handleSetAttendance(worker.id, 'present')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-600'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>हजर (P)</span>
                    </button>

                    {/* Half Day */}
                    <button
                      type="button"
                      onClick={() => handleSetAttendance(worker.id, 'half_day')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                        currentStatus === 'half_day'
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 ring-2 ring-amber-500'
                          : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>अर्धा (HD)</span>
                    </button>

                    {/* Absent */}
                    <button
                      type="button"
                      onClick={() => handleSetAttendance(worker.id, 'absent')}
                      className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-600'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>गैरहजर (A)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: WORKERS DIRECTORY & WAGE CALCULATOR */}
      {activeTab === 'workers' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="मजुराचे नाव किंवा फोन नंबर शोधा..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="space-y-3">
            {filteredWorkers.map(w => (
              <div
                key={w.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-slate-900">{w.name}</h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      रोज: ₹{w.daily_wage}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 flex items-center space-x-2">
                    {w.phone && <span>📞 {w.phone}</span>}
                    {w.notes && <span>• {w.notes}</span>}
                  </p>
                </div>

                {/* Calculation breakdown: (Days * Wage) - Advances = Net Payable */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">कामाचे दिवस</span>
                    <span className="font-bold text-slate-800 mt-0.5 block">{w.total_days_worked || 0} दिवस</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">घेतलेली उचल</span>
                    <span className="font-bold text-amber-600 mt-0.5 block">₹{w.total_advances || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">बाकी मजुरी</span>
                    <span className="font-black text-rose-700 mt-0.5 block">₹{w.net_payable || 0}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenPayout(w)}
                    disabled={(w.net_payable || 0) <= 0}
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-1 shadow-sm shrink-0"
                  >
                    <span>मजुरी वाटप करा</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditWorker(w)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200"
                    title={t('common.edit') || 'संपादित करा'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteWorker(w.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title={t('common.delete') || 'हटवा'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADVANCES LOG */}
      {activeTab === 'advances' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              मजुरांनी घेतलेली उचल (Advances)
            </h3>
            <button
              onClick={() => setAdvanceModal(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
            >
              + नवीन उचल नोंदवा
            </button>
          </div>

          <div className="space-y-2">
            {advances.map(adv => {
              const w = workers.find(item => item.id === adv.worker_id);
              return (
                <div
                  key={adv.id}
                  className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">{w?.name || 'मजूर'}</span>
                    <span className="text-slate-500">
                      {new Date(adv.date).toLocaleDateString('mr-IN')} • {adv.reason || 'उचल'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-extrabold text-amber-700">
                      ₹{adv.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteAdvance(adv.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title={t('common.delete') || 'हटवा'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Worker */}
      {addWorkerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingWorker ? 'मजूर माहिती संपादित करा (Edit Worker)' : t('workers.add_worker')}
              </h3>
              <button onClick={() => setAddWorkerModal(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWorker} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('workers.worker_name')}:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="उदा. रंगराव पाटील"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('workers.phone')}:</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="९८२२०..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">{t('workers.daily_wage')}:</label>
                <input
                  type="number"
                  required
                  value={dailyWage}
                  onChange={e => setDailyWage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">कामाचे स्वरूप / टीप:</label>
                <input
                  type="text"
                  value={workerNotes}
                  onChange={e => setWorkerNotes(e.target.value)}
                  placeholder="उदा. ट्रॅक्टर चालक / पाणी भरणे / खुरपणी"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddWorkerModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  {editingWorker ? 'बदल जतन करा (Save Changes)' : 'मजूर जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Advance */}
      {advanceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-amber-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t('workers.add_advance')}</h3>
              <button onClick={() => setAdvanceModal(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAdvance} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">मजूर निवडा:</label>
                <select
                  value={advWorkerId}
                  onChange={e => setAdvWorkerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  {workers.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} (रोज: ₹{w.daily_wage})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">उचल रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={advAmount}
                  onChange={e => setAdvAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">कारण / टीप:</label>
                <input
                  type="text"
                  value={advReason}
                  onChange={e => setAdvReason(e.target.value)}
                  placeholder="उदा. सणासाठी, दवाखाना..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdvanceModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-700 text-white rounded-xl font-bold shadow-md hover:bg-amber-800"
                >
                  उचल जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payout Wages */}
      {payoutModal && selectedWorkerForPay && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">मजुरी देयक वाटप (Settlement)</h3>
                <p className="text-xs text-emerald-200">{selectedWorkerForPay.name}</p>
              </div>
              <button onClick={() => setPayoutModal(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecutePayout} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                <p>कामाचे दिवस: <strong>{selectedWorkerForPay.total_days_worked || 0} दिवस</strong></p>
                <p>एकूण मजुरी: <strong>₹{selectedWorkerForPay.total_earned || 0}</strong></p>
                <p>मागील उचल: <strong>₹{selectedWorkerForPay.total_advances || 0}</strong></p>
                <p className="text-emerald-900 font-extrabold text-sm pt-1 border-t border-emerald-200">
                  बाकी देय रक्कम: ₹{selectedWorkerForPay.net_payable || 0}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">देण्यात येणारी रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={payAmount}
                  onChange={e => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-base"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">पेमेंट माध्यम:</label>
                <select
                  value={payMethod}
                  onChange={e => setPayMethod(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="cash">रोख (Cash)</option>
                  <option value="upi">बँक खाते / UPI</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">शेरा / टीप:</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={e => setPayNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayoutModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  मजुरी वाटप नोंदवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
