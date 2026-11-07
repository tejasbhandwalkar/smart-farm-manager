import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  Plus,
  Calendar,
  Phone,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Edit2,
  Trash2,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { HarvestSale, Crop, Plot } from '../types';

export const HarvestSalesPage: React.FC = () => {
  const { t } = useTranslation();

  const [sales, setSales] = useState<HarvestSale[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<HarvestSale | null>(null);
  const [settleModalOpen, setSettleModalOpen] = useState(false);
  const [selectedSaleForSettle, setSelectedSaleForSettle] = useState<HarvestSale | null>(null);
  const [settleAmount, setSettleAmount] = useState(0);

  // Form states
  const [cropId, setCropId] = useState('');
  const [plotId, setPlotId] = useState('');
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState<number>(50);
  const [unit, setUnit] = useState('Tons');
  const [ratePerUnit, setRatePerUnit] = useState<number>(3100);
  const [buyerName, setBuyerName] = useState('श्री छत्रपती सहकारी साखर कारखाना');
  const [buyerPhone, setBuyerPhone] = useState('02118-242201');
  const [receivedAmount, setReceivedAmount] = useState<number>(100000);

  const loadData = async () => {
    setLoading(true);
    const [salesData, cropsData, plotsData] = await Promise.all([
      FarmDB.getHarvestSales(),
      FarmDB.getCrops(),
      FarmDB.getPlots(),
    ]);
    setSales(salesData);
    setCrops(cropsData);
    setPlots(plotsData);
    if (cropsData.length > 0 && !cropId) setCropId(cropsData[0].id);
    if (plotsData.length > 0 && !plotId) setPlotId(plotsData[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalSaleValue = sales.reduce((sum, s) => sum + Number(s.total_amount || 0), 0);
  const totalReceived = sales.reduce((sum, s) => sum + Number(s.received_amount || 0), 0);
  const totalPending = sales.reduce((sum, s) => sum + Number(s.pending_amount || 0), 0);

  const calculatedTotal = Number(quantity) * Number(ratePerUnit);
  const calculatedPending = Math.max(0, calculatedTotal - Number(receivedAmount));

  const handleOpenAdd = () => {
    setEditingSale(null);
    if (crops.length > 0) setCropId(crops[0].id);
    if (plots.length > 0) setPlotId(plots[0].id);
    setHarvestDate(new Date().toISOString().split('T')[0]);
    setQuantity(50);
    setUnit('Tons');
    setRatePerUnit(3100);
    setBuyerName('श्री छत्रपती सहकारी साखर कारखाना');
    setBuyerPhone('02118-242201');
    setReceivedAmount(100000);
    setModalOpen(true);
  };

  const handleOpenEdit = (sale: HarvestSale) => {
    setEditingSale(sale);
    setCropId(sale.crop_id || '');
    setPlotId(sale.plot_id || '');
    setHarvestDate(sale.harvest_date);
    setQuantity(sale.quantity);
    setUnit(sale.unit);
    setRatePerUnit(sale.rate_per_unit);
    setBuyerName(sale.buyer_name);
    setBuyerPhone(sale.buyer_phone || '');
    setReceivedAmount(sale.received_amount);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete') || 'तुम्हाला खात्री आहे का ही विक्री नोंद हटवायची?')) {
      await FarmDB.deleteHarvestSale(id);
      await loadData();
    }
  };

  const handleSaveSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCrop = crops.find(c => c.id === cropId);
    const targetPlot = plots.find(p => p.id === plotId);

    const total = Number(quantity) * Number(ratePerUnit);
    const pending = Math.max(0, total - Number(receivedAmount));
    const status = pending === 0 ? 'paid' : Number(receivedAmount) > 0 ? 'partial' : 'unpaid';

    const payload = {
      crop_id: cropId,
      crop_name: targetCrop?.crop_name || 'पीक',
      plot_id: plotId,
      plot_name: targetPlot?.name || 'प्लॉट',
      harvest_date: harvestDate,
      quantity: Number(quantity),
      unit,
      rate_per_unit: Number(ratePerUnit),
      total_amount: total,
      buyer_name: buyerName,
      buyer_phone: buyerPhone,
      received_amount: Number(receivedAmount),
      pending_amount: pending,
      payment_status: status as any,
    };

    if (editingSale) {
      await FarmDB.updateHarvestSale(editingSale.id, payload);
    } else {
      await FarmDB.addHarvestSale(payload);
    }

    setModalOpen(false);
    setEditingSale(null);
    await loadData();
  };

  const handleOpenSettle = (sale: HarvestSale) => {
    setSelectedSaleForSettle(sale);
    setSettleAmount(sale.pending_amount);
    setSettleModalOpen(true);
  };

  const handleExecuteSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSaleForSettle) return;

    const newReceived = Number(selectedSaleForSettle.received_amount) + Number(settleAmount);
    const newPending = Math.max(0, Number(selectedSaleForSettle.total_amount) - newReceived);
    const newStatus = newPending === 0 ? 'paid' : 'partial';

    await FarmDB.updateHarvestSale(selectedSaleForSettle.id, {
      received_amount: newReceived,
      pending_amount: newPending,
      payment_status: newStatus,
    });

    // Also record income in finances!
    await FarmDB.addFinanceItem({
      type: 'income',
      category: 'cat_sale_sugarcane',
      amount: Number(settleAmount),
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'bank_upi',
      notes: `बाकी विक्री बिल जमा: ${selectedSaleForSettle.buyer_name} (${selectedSaleForSettle.crop_name})`,
    });

    setSettleModalOpen(false);
    alert('बाकी रक्कम खात्यावर जमा झाली व हिशोबात नोंदवली!');
    await loadData();
  };

  const statusBadges: Record<string, { label: string; badge: string }> = {
    paid: { label: 'पूर्ण मिळाले', badge: 'bg-emerald-100 text-emerald-800' },
    partial: { label: 'काही मिळाले / बाकी', badge: 'bg-amber-100 text-amber-800' },
    unpaid: { label: 'अद्याप बाकी', badge: 'bg-rose-100 text-rose-800' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-emerald-700" />
            <span>{t('harvest_sales.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('harvest_sales.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ नवीन विक्री नोंदवा</span>
        </button>
      </div>

      {/* 3 Summary Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">एकूण विक्री मूल्य</span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            ₹{totalSaleValue.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">ऊस, गहू व कांदा एकूण उत्पादन</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">प्रत्यक्ष जमा रक्कम</span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            ₹{totalReceived.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-emerald-700 mt-1 block">खात्यावर जमा झालेली रक्कम</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">व्यापारी / कारखाना बाकी</span>
          <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
            ₹{totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-xs text-amber-800 mt-1 block">येणे बाकी देयके</span>
        </div>
      </div>

      {/* Sales List */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          काढणी व विक्री नोंदी ({sales.length})
        </h3>

        <div className="space-y-3">
          {sales.map(sale => (
            <div
              key={sale.id}
              className="p-4 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-bold text-base text-slate-900">
                    {sale.crop_name} ({sale.quantity} {sale.unit})
                  </h4>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${statusBadges[sale.payment_status]?.badge}`}>
                    {statusBadges[sale.payment_status]?.label}
                  </span>
                </div>

                <p className="text-xs text-slate-600">
                  दर: <strong>₹{sale.rate_per_unit} प्रति {sale.unit}</strong> • तारीख: <strong>{new Date(sale.harvest_date).toLocaleDateString('mr-IN')}</strong>
                </p>

                <p className="text-xs text-slate-700 font-semibold">
                  खरेदीदार: {sale.buyer_name} {sale.buyer_phone ? `(📞 ${sale.buyer_phone})` : ''}
                </p>
              </div>

              {/* Financial values & settle button */}
              <div className="flex items-center justify-between md:justify-end space-x-4 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                <div className="text-right text-xs">
                  <span className="text-slate-500 block">एकूण: ₹{sale.total_amount.toLocaleString('en-IN')}</span>
                  <span className="font-bold text-emerald-700 block">जमा: ₹{sale.received_amount.toLocaleString('en-IN')}</span>
                  {sale.pending_amount > 0 && (
                    <span className="font-black text-rose-700 block">बाकी: ₹{sale.pending_amount.toLocaleString('en-IN')}</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {sale.pending_amount > 0 && (
                    <button
                      onClick={() => handleOpenSettle(sale)}
                      className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      बाकी जमा करा
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(sale)}
                    className="p-2 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors border border-slate-200"
                    title={t('common.edit') || 'संपादित करा'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(sale.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200"
                    title={t('common.delete') || 'हटवा'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Add Harvest Sale */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">
                {editingSale ? 'विक्री नोंद संपादित करा (Edit Harvest Sale)' : t('harvest_sales.add_harvest')}
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSale} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">पीक निवडा:</label>
                  <select
                    value={cropId}
                    onChange={e => {
                      setCropId(e.target.value);
                      const c = crops.find(item => item.id === e.target.value);
                      if (c) {
                        setUnit(c.unit);
                        if (c.crop_type === 'sugarcane') {
                          setBuyerName('श्री छत्रपती सहकारी साखर कारखाना, भवानीनगर');
                          setRatePerUnit(3100);
                        } else if (c.crop_type === 'wheat') {
                          setBuyerName('गहू व्यापारी / आडत');
                          setRatePerUnit(2800);
                        } else {
                          setBuyerName('कांदा मार्केट व्यापारी (APMC)');
                          setRatePerUnit(2200);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.id}>{c.crop_name} ({c.plot_name})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्लॉट:</label>
                  <select
                    value={plotId}
                    onChange={e => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">उत्पादन वजन:</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">एकक:</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Tons">टन (Tons)</option>
                    <option value="Quintals">क्विंटल (Quintals)</option>
                    <option value="Bags">पोती (Bags)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">दर (₹/एकक):</label>
                  <input
                    type="number"
                    required
                    value={ratePerUnit}
                    onChange={e => setRatePerUnit(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Automatic Calculated Total */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-950">
                <span>एकूण विक्री रक्कम:</span>
                <span className="text-base text-emerald-800">
                  ₹{calculatedTotal.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">खरेदीदार नाव:</label>
                  <input
                    type="text"
                    required
                    value={buyerName}
                    onChange={e => setBuyerName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">फोन नंबर:</label>
                  <input
                    type="tel"
                    value={buyerPhone}
                    onChange={e => setBuyerPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्राप्त रक्कम (₹):</label>
                  <input
                    type="number"
                    value={receivedAmount}
                    onChange={e => setReceivedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">येणे बाकी (₹):</label>
                  <div className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-black text-rose-700">
                    ₹{calculatedPending.toLocaleString('en-IN')}
                  </div>
                </div>
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
                  {editingSale ? 'बदल जतन करा (Save Changes)' : 'विक्री जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settle Pending Payment */}
      {settleModalOpen && selectedSaleForSettle && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">बाकी रक्कम जमा नोंदवा</h3>
                <p className="text-xs text-emerald-200">{selectedSaleForSettle.buyer_name}</p>
              </div>
              <button onClick={() => setSettleModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteSettle} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs">
                <p>एकूण बिल: <strong>₹{selectedSaleForSettle.total_amount}</strong></p>
                <p>मागील जमा: <strong>₹{selectedSaleForSettle.received_amount}</strong></p>
                <p className="text-amber-900 font-bold text-sm pt-1 border-t border-amber-200">
                  बाकी रक्कम: ₹{selectedSaleForSettle.pending_amount}
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">आता मिळालेली रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={settleAmount}
                  onChange={e => setSettleAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-base"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSettleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  रक्कम जमा नोंदवा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
