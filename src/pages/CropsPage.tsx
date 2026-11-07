import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Wheat,
  Plus,
  Calendar,
  Layers,
  Droplets,
  DollarSign,
  TrendingUp,
  Clock,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { Crop, Plot, CropType, GrowthStage } from '../types';

export const CropsPage: React.FC = () => {
  const { t } = useTranslation();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [selectedCropFilter, setSelectedCropFilter] = useState<'all' | CropType>('all');
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [fertilizerModalOpen, setFertilizerModalOpen] = useState(false);
  const [activeCropForFertilizer, setActiveCropForFertilizer] = useState<Crop | null>(null);

  // New crop form
  const [plotId, setPlotId] = useState('');
  const [cropType, setCropType] = useState<CropType>('sugarcane');
  const [cropName, setCropName] = useState('ऊस');
  const [variety, setVariety] = useState('को-८६०३२');
  const [sowingDate, setSowingDate] = useState('2026-06-15');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('2027-08-15');
  const [growthStage, setGrowthStage] = useState<GrowthStage>('vegetative');
  const [targetYield, setTargetYield] = useState(650);
  const [unit, setUnit] = useState('Tons');
  const [notes, setNotes] = useState('');

  // Fertilizer form
  const [fertName, setFertName] = useState('१९:१९:१९ विद्राव्य खत');
  const [fertQty, setFertQty] = useState(50);
  const [fertUnit, setFertUnit] = useState('किलो');
  const [fertCost, setFertCost] = useState(4500);

  const loadData = async () => {
    setLoading(true);
    const [cropsData, plotsData] = await Promise.all([
      FarmDB.getCrops(),
      FarmDB.getPlots(),
    ]);
    setCrops(cropsData);
    setPlots(plotsData);
    if (plotsData.length > 0 && !plotId) {
      setPlotId(plotsData[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCrops = selectedCropFilter === 'all'
    ? crops
    : crops.filter(c => c.crop_type === selectedCropFilter);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlot = plots.find(p => p.id === plotId);

    await FarmDB.addCrop({
      plot_id: plotId,
      plot_name: targetPlot?.name || 'प्लॉट',
      crop_type: cropType,
      crop_name: cropName,
      variety,
      sowing_date: sowingDate,
      expected_harvest_date: expectedHarvestDate,
      growth_stage: growthStage,
      target_yield: Number(targetYield),
      unit,
      notes,
    });

    setAddModalOpen(false);
    await loadData();
  };

  const handleAddFertilizer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCropForFertilizer) return;

    // Automatically record fertilizer expense in finances!
    await FarmDB.addFinanceItem({
      type: 'expense',
      category: 'cat_fertilizer',
      amount: Number(fertCost),
      date: new Date().toISOString().split('T')[0],
      crop_id: activeCropForFertilizer.id,
      crop_name: activeCropForFertilizer.crop_name,
      payment_mode: 'cash',
      notes: `${fertName} (${fertQty} ${fertUnit}) खत दिले`,
    });

    alert('खत नोंद व हिशोब यशस्वीरित्या जोडला!');
    setFertilizerModalOpen(false);
  };

  const calculateDays = (sowStr: string, harvestStr: string) => {
    const start = new Date(sowStr).getTime();
    const end = new Date(harvestStr).getTime();
    const today = new Date().getTime();

    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.round((today - start) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.round((end - today) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return { totalDays, elapsedDays, remainingDays, progress };
  };

  const stageLabels: Record<GrowthStage, { label: string; badge: string }> = {
    germination: { label: 'उगवण अवस्था', badge: 'bg-yellow-100 text-yellow-800' },
    vegetative: { label: 'जोमदार वाढ', badge: 'bg-emerald-100 text-emerald-800' },
    flowering: { label: 'फुलोरा / कंद पोसणे', badge: 'bg-purple-100 text-purple-800' },
    maturity: { label: 'पक्वता टप्पा', badge: 'bg-amber-100 text-amber-800' },
    harvesting: { label: 'काढणीस तयार', badge: 'bg-rose-100 text-rose-800' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Wheat className="w-6 h-6 text-emerald-700" />
            <span>{t('crops.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('crops.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('crops.add_crop')}</span>
        </button>
      </div>

      {/* Filter Tabs for the 3 Major Crops */}
      <div className="flex space-x-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setSelectedCropFilter('all')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 ${
            selectedCropFilter === 'all'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          सर्व पिके ({crops.length})
        </button>
        <button
          onClick={() => setSelectedCropFilter('sugarcane')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            selectedCropFilter === 'sugarcane'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <span>🎋</span>
          <span>{t('crops.crop_sugarcane')}</span>
        </button>
        <button
          onClick={() => setSelectedCropFilter('wheat')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            selectedCropFilter === 'wheat'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <span>🌾</span>
          <span>{t('crops.crop_wheat')}</span>
        </button>
        <button
          onClick={() => setSelectedCropFilter('onion')}
          className={`px-4 py-2 rounded-xl transition-all shrink-0 flex items-center space-x-1.5 ${
            selectedCropFilter === 'onion'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50'
          }`}
        >
          <span>🧅</span>
          <span>{t('crops.crop_onion')}</span>
        </button>
      </div>

      {/* Crops Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredCrops.map(crop => {
          const { totalDays, elapsedDays, remainingDays, progress } = calculateDays(
            crop.sowing_date,
            crop.expected_harvest_date
          );

          return (
            <div
              key={crop.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Title & Stage badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">
                        {crop.crop_type === 'sugarcane' ? '🎋' : crop.crop_type === 'wheat' ? '🌾' : '🧅'}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">
                        {crop.crop_name}
                      </h3>
                      <span className="text-xs text-slate-500 font-medium">
                        ({crop.variety})
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-emerald-800 mt-1">
                      {crop.plot_name}
                    </p>
                  </div>

                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${stageLabels[crop.growth_stage].badge}`}>
                    {stageLabels[crop.growth_stage].label}
                  </span>
                </div>

                {/* Sowing & Harvesting Dates Timeline */}
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      {t('crops.sowing_date')}
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(crop.sowing_date).toLocaleDateString('mr-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-bold block">
                      {t('crops.expected_harvest_date')}
                    </span>
                    <span className="font-bold text-slate-800">
                      {new Date(crop.expected_harvest_date).toLocaleDateString('mr-IN')}
                    </span>
                  </div>
                </div>

                {/* Growth Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                    <span>वाढ प्रगती ({progress}%)</span>
                    <span>काढणीस बाकी: <strong>{remainingDays} दिवस</strong></span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Performance & Target Yield */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
                  <div className="p-2 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <span className="text-emerald-700 text-[10px] font-bold block">अपेक्षित उत्पादन</span>
                    <span className="text-sm font-extrabold text-emerald-950 mt-0.5 block">
                      {crop.target_yield} {crop.unit}
                    </span>
                  </div>
                  <div className="p-2 bg-blue-50/70 border border-blue-100 rounded-xl">
                    <span className="text-blue-700 text-[10px] font-bold block">लागवडीचे दिवस</span>
                    <span className="text-sm font-extrabold text-blue-950 mt-0.5 block">
                      {elapsedDays} दिवस
                    </span>
                  </div>
                  <div className="p-2 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <span className="text-purple-700 text-[10px] font-bold block">आरोग्य स्थिती</span>
                    <span className="text-sm font-extrabold text-purple-950 mt-0.5 block">
                      उत्तम (९५%)
                    </span>
                  </div>
                </div>

                {crop.notes && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                    {crop.notes}
                  </p>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    setActiveCropForFertilizer(crop);
                    setFertilizerModalOpen(true);
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 border border-emerald-200"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>खत / औषध नोंदवा</span>
                </button>
                <button
                  onClick={() => alert(`या पिकाचा एकूण सिंचन व रासायनिक खर्च हिशोब विभागात नोंदवला आहे.`)}
                  className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  खर्च विवरण
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Crop Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base sm:text-lg">{t('crops.add_crop')}</h3>
              <button onClick={() => setAddModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCrop} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('crops.crop_name')}:
                  </label>
                  <select
                    value={cropType}
                    onChange={e => {
                      const val = e.target.value as CropType;
                      setCropType(val);
                      if (val === 'sugarcane') {
                        setCropName('ऊस');
                        setVariety('को-८६०३२');
                        setUnit('Tons');
                      } else if (val === 'wheat') {
                        setCropName('गहू');
                        setVariety('लोकवन');
                        setUnit('Quintals');
                      } else {
                        setCropName('कांदा');
                        setVariety('गावरान फुर्सुंगी');
                        setUnit('Quintals');
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="sugarcane">ऊस (Sugarcane)</option>
                    <option value="wheat">गहू (Wheat)</option>
                    <option value="onion">कांदा (Onion)</option>
                    <option value="other">इतर पीक</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('crops.plot')}:
                  </label>
                  <select
                    value={plotId}
                    onChange={e => setPlotId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {plots.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.area_acres} एकर)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {t('crops.variety')}:
                </label>
                <input
                  type="text"
                  required
                  value={variety}
                  onChange={e => setVariety(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('crops.sowing_date')}:
                  </label>
                  <input
                    type="date"
                    required
                    value={sowingDate}
                    onChange={e => setSowingDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {t('crops.expected_harvest_date')}:
                  </label>
                  <input
                    type="date"
                    required
                    value={expectedHarvestDate}
                    onChange={e => setExpectedHarvestDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    अपेक्षित उत्पादन:
                  </label>
                  <input
                    type="number"
                    required
                    value={targetYield}
                    onChange={e => setTargetYield(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    एकक (Unit):
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Tons">टन (Tons)</option>
                    <option value="Quintals">क्विंटल (Quintals)</option>
                    <option value="Bags">पोती (Bags)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">विशेष टीप:</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. ठिबक मधून विद्राव्य खत शेड्यूल चालू..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  पीक जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Fertilizer Modal */}
      {fertilizerModalOpen && activeCropForFertilizer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">खते व औषधे नोंदणी</h3>
                <p className="text-xs text-emerald-200">{activeCropForFertilizer.crop_name}</p>
              </div>
              <button onClick={() => setFertilizerModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFertilizer} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  खताचे किंवा औषधाचे नाव:
                </label>
                <input
                  type="text"
                  required
                  value={fertName}
                  onChange={e => setFertName(e.target.value)}
                  placeholder="उदा. १०:२६:२६ किंवा युरिया किंवा मॅन्कोझेब"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">वापरलेले प्रमाण:</label>
                  <input
                    type="number"
                    required
                    value={fertQty}
                    onChange={e => setFertQty(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">एकक:</label>
                  <input
                    type="text"
                    value={fertUnit}
                    onChange={e => setFertUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">खर्च रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={fertCost}
                  onChange={e => setFertCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-emerald-700 mt-1 block">
                  ही रक्कम थेट शेतीच्या मासिक खर्चात जमा केली जाईल.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFertilizerModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  नोंद जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
