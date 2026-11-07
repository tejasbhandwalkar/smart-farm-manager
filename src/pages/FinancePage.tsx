import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  FileSpreadsheet,
  FileText,
  Filter,
  DollarSign,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Edit2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { FarmDB } from '../services/db';
import { exportFinanceToPDF, exportFinanceToExcel } from '../services/export';
import { FinanceItem, FinanceType, Crop, Plot } from '../types';

export const FinancePage: React.FC = () => {
  const { t } = useTranslation();

  const [finances, setFinances] = useState<FinanceItem[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFinance, setEditingFinance] = useState<FinanceItem | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states
  const [type, setType] = useState<FinanceType>('expense');
  const [category, setCategory] = useState('cat_fertilizer');
  const [amount, setAmount] = useState<number>(2500);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cropId, setCropId] = useState('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank_upi'>('cash');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [finData, cropsData, plotsData] = await Promise.all([
      FarmDB.getFinances(),
      FarmDB.getCrops(),
      FarmDB.getPlots(),
    ]);
    setFinances(finData);
    setCrops(cropsData);
    setPlots(plotsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const totalExpense = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const handleOpenAdd = () => {
    setEditingFinance(null);
    setType('expense');
    setCategory('cat_fertilizer');
    setAmount(2500);
    setDate(new Date().toISOString().split('T')[0]);
    setCropId('');
    setPaymentMode('cash');
    setNotes('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: FinanceItem) => {
    setEditingFinance(item);
    setType(item.type);
    setCategory(item.category);
    setAmount(Number(item.amount) || 0);
    setDate(item.date);
    setCropId(item.crop_id || '');
    setPaymentMode(item.payment_mode === 'bank_upi' ? 'bank_upi' : 'cash');
    setNotes(item.notes || '');
    setModalOpen(true);
  };

  const handleSaveTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const linkedCrop = crops.find(c => c.id === cropId);

    const payload = {
      type,
      category,
      amount: Number(amount),
      date,
      crop_id: cropId || undefined,
      crop_name: linkedCrop?.crop_name,
      payment_mode: paymentMode,
      notes,
    };

    if (editingFinance) {
      await FarmDB.updateFinanceItem(editingFinance.id, payload);
    } else {
      await FarmDB.addFinanceItem(payload);
    }

    setModalOpen(false);
    setEditingFinance(null);
    setAmount(0);
    setNotes('');
    await loadData();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('हा हिशोब हटवायचा आहे का?')) {
      await FarmDB.deleteFinanceItem(id);
      await loadData();
    }
  };

  const filteredFinances = finances.filter(f => {
    if (filterType !== 'all' && f.type !== filterType) return false;
    if (filterCategory !== 'all' && f.category !== filterCategory) return false;
    return true;
  });

  const categoryLabels: Record<string, string> = {
    cat_labour: 'मजुरी खर्च (Labour)',
    cat_fertilizer: 'खते व औषधे (Fertilizer)',
    cat_seeds: 'बियाणे व रोपे (Seeds)',
    cat_machinery: 'ट्रॅक्टर व डिझेल (Machinery/Fuel)',
    cat_electricity: 'लाईट बिल व सिंचन (Electricity)',
    cat_transport: 'वाहतूक खर्च (Transport)',
    cat_sale_sugarcane: 'ऊस विक्री जमा (Sugarcane)',
    cat_sale_wheat: 'गहू विक्री जमा (Wheat)',
    cat_sale_onion: 'कांदा विक्री जमा (Onion)',
    cat_other: 'इतर खर्च / जमा',
  };

  // Pie chart data: Expenses breakdown
  const expenseCategories = finances.filter(f => f.type === 'expense');
  const catSums: Record<string, number> = {};
  expenseCategories.forEach(f => {
    catSums[f.category] = (catSums[f.category] || 0) + Number(f.amount);
  });

  const pieData = Object.entries(catSums).map(([cat, sum]) => ({
    name: categoryLabels[cat] || cat,
    value: sum,
  }));
  const COLORS = ['#e11d48', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#64748b'];

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header with PDF & Excel Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Wallet className="w-6 h-6 text-emerald-700" />
            <span>{t('finance.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('finance.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportFinanceToPDF(finances)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition-colors"
          >
            <FileText className="w-4 h-4 text-rose-600" />
            <span>PDF अहवाल</span>
          </button>

          <button
            onClick={() => exportFinanceToExcel(finances)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Excel शीट</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ खर्च / जमा जोडा</span>
          </button>
        </div>
      </div>

      {/* 3 Large P&L Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Income */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              {t('finance.total_revenue')} (जमा)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
              ₹{totalIncome.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 mr-1" />
              <span>साखर कारखाना बिल, कांदा व गहू विक्री</span>
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              {t('finance.total_expense')} (खर्च)
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-700">
              ₹{totalExpense.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100 flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 mr-1" />
              <span>मजुरी, रासायनिक खते, डिझेल व बियाणे</span>
            </p>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-gradient-to-br from-emerald-800 to-green-950 text-white p-5 rounded-3xl shadow-lg shadow-emerald-950/15 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
              {t('finance.net_profit')} (निव्वळ नफा)
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-700 text-emerald-100">
              नफा मार्जिन {profitMargin}%
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-300">
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-emerald-200/90 mt-2 pt-2 border-t border-emerald-700/60">
              २० एकर शेतीचा निव्वळ आर्थिक नफा
            </p>
          </div>
        </div>

      </div>

      {/* Visual Chart: Expense Breakdown */}
      {pieData.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-3">
            खर्चनिहाय विभाजन (Expense Breakdown)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, percent }) => `${(name || '').split(' ')[0]} (${((percent || 0) * 100).toFixed(0)}%)`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'रक्कम']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-700">प्रकार:</span>
          
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value as any)}
            className="px-2.5 py-1.5 border border-slate-300 rounded-xl bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="all">सर्व व्यवहार ({finances.length})</option>
            <option value="income">फक्त जमा (Income)</option>
            <option value="expense">फक्त खर्च (Expense)</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          एकूण <strong>{filteredFinances.length}</strong> नोंदी
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          हिशोब नोंदवही (Transactions Register)
        </h3>

        <div className="space-y-2.5">
          {filteredFinances.map(item => {
            const isIncome = item.type === 'income';
            return (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {isIncome ? 'जमा (Income)' : 'खर्च (Expense)'}
                    </span>
                    <span className="font-bold text-sm text-slate-900">
                      {categoryLabels[item.category] || item.category}
                    </span>
                  </div>

                  <p className="text-slate-500">
                    तारीख: <strong>{new Date(item.date).toLocaleDateString('mr-IN')}</strong> • पेमेंट: <strong>{item.payment_mode === 'cash' ? 'रोख (Cash)' : 'UPI / बँक'}</strong>
                    {item.crop_name ? ` • पीक: ${item.crop_name}` : ''}
                  </p>

                  {item.notes && (
                    <p className="text-slate-700 italic mt-0.5">
                      {item.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                  <span
                    className={`text-base font-black mr-1 ${
                      isIncome ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {isIncome ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title={t('common.edit') || 'संपादित करा'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Modal: Add Transaction */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingFinance ? 'हिशोब नोंद संपादित करा (Edit Transaction)' : t('finance.add_transaction')}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setType('expense');
                    setCategory('cat_fertilizer');
                  }}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    type === 'expense' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-700'
                  }`}
                >
                  खर्च (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('income');
                    setCategory('cat_sale_sugarcane');
                  }}
                  className={`flex-1 py-2 rounded-lg transition-colors ${
                    type === 'income' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-700'
                  }`}
                >
                  जमा (Income)
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">खर्च / जमा प्रकार:</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  {type === 'expense' ? (
                    <>
                      <option value="cat_labour">मजुरी खर्च (Labour)</option>
                      <option value="cat_fertilizer">खते व औषधे (Fertilizer/Pesticide)</option>
                      <option value="cat_seeds">बियाणे व रोपे (Seeds)</option>
                      <option value="cat_machinery">ट्रॅक्टर व डिझेल (Machinery/Fuel)</option>
                      <option value="cat_electricity">लाईट बिल व पाणी (Electricity/Water)</option>
                      <option value="cat_transport">वाहतूक खर्च (Transport)</option>
                      <option value="cat_other">इतर खर्च</option>
                    </>
                  ) : (
                    <>
                      <option value="cat_sale_sugarcane">ऊस विक्री जमा (Sugarcane)</option>
                      <option value="cat_sale_wheat">गहू विक्री जमा (Wheat)</option>
                      <option value="cat_sale_onion">कांदा विक्री जमा (Onion)</option>
                      <option value="cat_other">इतर उत्पन्न</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">तारीख:</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">पेमेंट माध्यम:</label>
                  <select
                    value={paymentMode}
                    onChange={e => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cash">रोख (Cash)</option>
                    <option value="bank_upi">बँक / UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">संबंधित पीक (ऐच्छिक):</label>
                <select
                  value={cropId}
                  onChange={e => setCropId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">कोणतेही नाही</option>
                  {crops.map(c => (
                    <option key={c.id} value={c.id}>{c.crop_name} ({c.plot_name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">तपशील / टीप:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. कृषी सेवा केंद्र पावती..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  {editingFinance ? 'बदल जतन करा (Save Changes)' : 'जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
