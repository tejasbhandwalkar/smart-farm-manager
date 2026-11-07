import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Map,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Layers,
  Calendar,
  Wheat,
  X,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { Plot, SoilType, PlotStatus } from '../types';

export const PlotsPage: React.FC = () => {
  const { t } = useTranslation();

  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlot, setEditingPlot] = useState<Plot | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [areaAcres, setAreaAcres] = useState<number>(2.0);
  const [soilType, setSoilType] = useState<SoilType>('black');
  const [status, setStatus] = useState<PlotStatus>('cultivated');
  const [currentCrop, setCurrentCrop] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadPlots = async () => {
    setLoading(true);
    const data = await FarmDB.getPlots();
    setPlots(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlots();
  }, []);

  const totalFarmAcres = FarmDB.TOTAL_FARM_ACRES;
  const totalAllocatedAcres = plots.reduce((sum, p) => sum + Number(p.area_acres || 0), 0);
  const remainingAcres = Math.max(0, totalFarmAcres - totalAllocatedAcres);
  const percentageUsed = Math.min(100, Math.round((totalAllocatedAcres / totalFarmAcres) * 100));

  const handleOpenAdd = () => {
    setEditingPlot(null);
    setName(`प्लॉट ${plots.length + 1}`);
    setAreaAcres(remainingAcres > 0 ? Math.min(2.0, remainingAcres) : 1.0);
    setSoilType('black');
    setStatus('cultivated');
    setCurrentCrop('कांदा (Onion)');
    setNotes('');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleOpenEdit = (plot: Plot) => {
    setEditingPlot(plot);
    setName(plot.name);
    setAreaAcres(plot.area_acres);
    setSoilType(plot.soil_type);
    setStatus(plot.status);
    setCurrentCrop(plot.current_crop || '');
    setNotes(plot.notes || '');
    setErrorMessage('');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const parsedArea = Number(areaAcres);
    if (!name.trim()) {
      setErrorMessage('कृपया प्लॉटचे नाव टाका');
      return;
    }
    if (parsedArea <= 0) {
      setErrorMessage('क्षेत्रफळ ० पेक्षा जास्त असावे');
      return;
    }

    if (editingPlot) {
      const res = await FarmDB.updatePlot(editingPlot.id, {
        name,
        area_acres: parsedArea,
        soil_type: soilType,
        status,
        current_crop: currentCrop,
        notes,
      });
      if (!res.success) {
        setErrorMessage(res.error || 'त्रुटी: क्षेत्रफळ मर्यादा ओलांडली');
        return;
      }
    } else {
      const res = await FarmDB.addPlot({
        name,
        area_acres: parsedArea,
        soil_type: soilType,
        status,
        current_crop: currentCrop,
        notes,
      });
      if (!res.success) {
        setErrorMessage(res.error || t('plots.validation_exceeded'));
        return;
      }
    }

    setModalOpen(false);
    await loadPlots();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirm_delete'))) {
      await FarmDB.deletePlot(id);
      await loadPlots();
    }
  };

  const soilTypeLabels: Record<SoilType, { label: string; bg: string; text: string }> = {
    black: { label: 'काळी कसदार माती', bg: 'bg-stone-100', text: 'text-stone-800' },
    red: { label: 'लाल माती', bg: 'bg-red-50', text: 'text-red-800' },
    alluvial: { label: 'गाळाची माती', bg: 'bg-amber-50', text: 'text-amber-800' },
    loamy: { label: 'मुरुमाड/दोमट माती', bg: 'bg-orange-50', text: 'text-orange-800' },
  };

  const statusLabels: Record<PlotStatus, { label: string; badge: string }> = {
    cultivated: { label: 'लागवड चालू', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    fallow: { label: 'पडीक / मोकळे', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
    preparing: { label: 'मशागत चालू', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Map className="w-6 h-6 text-emerald-700" />
            <span>{t('plots.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('plots.subtitle')}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('plots.add_plot')}</span>
        </button>
      </div>

      {/* 20-Acre Capacity Gauge & Progress */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              एकूण शेती क्षेत्र (Total Capacity)
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalAllocatedAcres.toFixed(2)} / {totalFarmAcres.toFixed(2)} एकर वाटप
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">शिल्लक उपलब्ध जमीन:</span>
            <span className={`text-lg font-extrabold ${remainingAcres > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
              {remainingAcres.toFixed(2)} एकर
            </span>
          </div>
        </div>

        {/* Multi-colored Visual Land Allocation Bar */}
        <div className="w-full bg-slate-100 rounded-2xl h-5 p-1 flex overflow-hidden border border-slate-200">
          {plots.map((plot, i) => {
            const widthPct = (Number(plot.area_acres) / totalFarmAcres) * 100;
            const colors = ['bg-emerald-600', 'bg-amber-500', 'bg-purple-600', 'bg-blue-500', 'bg-teal-500'];
            return (
              <div
                key={plot.id}
                style={{ width: `${widthPct}%` }}
                className={`${colors[i % colors.length]} h-full first:rounded-l-xl last:rounded-r-xl transition-all duration-500 relative group cursor-pointer`}
                title={`${plot.name}: ${plot.area_acres} एकर`}
              />
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>२० एकर शेती मर्यादा काटेकोरपणे लागू आहे.</span>
          </div>
          <span className="font-semibold text-slate-700">
            {plots.length} डिजिटल प्लॉट तयार आहेत
          </span>
        </div>
      </div>

      {/* Digital Plots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plots.map(plot => (
          <div
            key={plot.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {plot.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 mt-1">
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      {plot.area_acres} एकर
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${statusLabels[plot.status].badge}`}>
                      {statusLabels[plot.status].label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenEdit(plot)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                    title={t('common.edit')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(plot.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title={t('common.delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Crop & Soil tags */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    {t('plots.assigned_crop')}
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {plot.current_crop || 'कोणतेही नाही'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">
                    {t('plots.soil_type')}
                  </span>
                  <span className="font-bold text-slate-800 truncate block mt-0.5">
                    {soilTypeLabels[plot.soil_type]?.label || plot.soil_type}
                  </span>
                </div>
              </div>

              {plot.notes && (
                <p className="text-xs text-slate-600 mt-3 p-2 bg-slate-50/70 rounded-xl border border-slate-100">
                  {plot.notes}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>डिजिटल मोजणी पूर्ण</span>
              </span>
              <span className="font-semibold text-emerald-800">
                {((plot.area_acres / totalFarmAcres) * 100).toFixed(0)}% शेतजमीन
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Plot Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">
                {editingPlot ? t('plots.edit_plot') : t('plots.add_plot')}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs sm:text-sm">
              {errorMessage && (
                <div className="p-3 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('plots.plot_name')}:
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="उदा. प्लॉट ५ (विहीर बाजू)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('plots.area')}:
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={totalFarmAcres}
                    required
                    value={areaAcres}
                    onChange={e => setAreaAcres(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    उपलब्ध: {remainingAcres.toFixed(1)} एकर
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('plots.soil_type')}:
                  </label>
                  <select
                    value={soilType}
                    onChange={e => setSoilType(e.target.value as SoilType)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="black">काळी कसदार माती</option>
                    <option value="red">लाल माती</option>
                    <option value="alluvial">गाळाची माती</option>
                    <option value="loamy">मुरुमाड / दोमट माती</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('plots.assigned_crop')}:
                  </label>
                  <select
                    value={currentCrop}
                    onChange={e => setCurrentCrop(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="ऊस (Sugarcane)">ऊस (Sugarcane)</option>
                    <option value="गहू (Wheat)">गहू (Wheat)</option>
                    <option value="कांदा (Onion)">कांदा (Onion)</option>
                    <option value="पडीक / मशागत">पडीक / मशागत</option>
                    <option value="इतर पीक">इतर पीक</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('plots.status')}:
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as PlotStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    <option value="cultivated">लागवड चालू</option>
                    <option value="fallow">पडीक / मोकळे</option>
                    <option value="preparing">मशागत चालू</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('plots.notes')}:
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. ठिबक सिंचन पाईपलाईन, मातीचा पोत..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors font-semibold"
                >
                  {t('plots.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md transition-colors"
                >
                  {t('plots.save_plot')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
