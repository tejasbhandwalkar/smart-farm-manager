import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Droplets,
  Power,
  Calendar,
  Clock,
  Zap,
  Fuel,
  Plus,
  AlertCircle,
  CheckCircle2,
  Bell,
  Waves,
  X,
  Trash2,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { IrrigationLog, CanalSchedule, Plot } from '../types';

export const IrrigationPage: React.FC = () => {
  const { t } = useTranslation();

  const [logs, setLogs] = useState<IrrigationLog[]>([]);
  const [canalSchedules, setCanalSchedules] = useState<CanalSchedule[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);

  // Pump state
  const [isPumpRunning, setIsPumpRunning] = useState(false);
  const [pumpStartTime, setPumpStartTime] = useState<string | null>(null);

  // Modals
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [canalModalOpen, setCanalModalOpen] = useState(false);

  // Form states: Log
  const [plotId, setPlotId] = useState('');
  const [source, setSource] = useState<'canal' | 'pump'>('pump');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationHours, setDurationHours] = useState(4.0);
  const [energyType, setEnergyType] = useState<'electric' | 'diesel'>('electric');
  const [fuelLiters, setFuelLiters] = useState(0);
  const [elecUnits, setElecUnits] = useState(25);
  const [fuelCost, setFuelCost] = useState(0);
  const [notes, setNotes] = useState('');

  // Form states: Canal
  const [expectedDate, setExpectedDate] = useState('2026-11-15');
  const [actualDate, setActualDate] = useState('');
  const [canalStatus, setCanalStatus] = useState<'scheduled' | 'running' | 'stopped'>('scheduled');
  const [discharge, setDischarge] = useState(450);
  const [canalNotes, setCanalNotes] = useState('नीरा डावा कालवा आवर्तन क्र. २');

  const loadData = async () => {
    setLoading(true);
    const [irrLogs, schedules, plotsData] = await Promise.all([
      FarmDB.getIrrigationLogs(),
      FarmDB.getCanalSchedules(),
      FarmDB.getPlots(),
    ]);
    setLogs(irrLogs);
    setCanalSchedules(schedules);
    setPlots(plotsData);
    if (plotsData.length > 0 && !plotId) {
      setPlotId(plotsData[0].id);
    }

    const storedPump = localStorage.getItem('sfm_pump_running');
    if (storedPump === 'true') {
      setIsPumpRunning(true);
      setPumpStartTime(localStorage.getItem('sfm_pump_start') || 'चालू');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteLog = async (id: string) => {
    if (window.confirm('ही पाणी पाळी नोंद हटवायची आहे का?')) {
      await FarmDB.deleteIrrigationLog(id);
      await loadData();
    }
  };

  const handleDeleteCanalSchedule = async (id: string) => {
    if (window.confirm('हे कालवा आवर्तन वेळापत्रक हटवायचे आहे का?')) {
      await FarmDB.deleteCanalSchedule(id);
      await loadData();
    }
  };

  const handleTogglePump = () => {
    const next = !isPumpRunning;
    setIsPumpRunning(next);
    if (next) {
      const timeStr = new Date().toLocaleTimeString('mr-IN', { hour: '2-digit', minute: '2-digit' });
      setPumpStartTime(timeStr);
      localStorage.setItem('sfm_pump_running', 'true');
      localStorage.setItem('sfm_pump_start', timeStr);
    } else {
      localStorage.removeItem('sfm_pump_running');
      localStorage.removeItem('sfm_pump_start');
      setPumpStartTime(null);
      // Open log modal to save the completed run!
      setDurationHours(4.0);
      setSource('pump');
      setEnergyType('electric');
      setElecUnits(24);
      setLogModalOpen(true);
    }
  };

  const handleSaveLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlot = plots.find(p => p.id === plotId);

    await FarmDB.addIrrigationLog({
      plot_id: plotId,
      plot_name: targetPlot?.name || 'प्लॉट',
      source,
      date: logDate,
      duration_hours: Number(durationHours),
      energy_type: source === 'pump' ? energyType : undefined,
      fuel_liters: Number(fuelLiters),
      electricity_units: Number(elecUnits),
      fuel_cost: Number(fuelCost),
      notes,
    });

    setLogModalOpen(false);
    await loadData();
  };

  const handleSaveCanal = async (e: React.FormEvent) => {
    e.preventDefault();
    await FarmDB.addCanalSchedule({
      expected_date: expectedDate,
      actual_date: actualDate || undefined,
      status: canalStatus,
      discharge_cusec: Number(discharge),
      notes: canalNotes,
    });

    setCanalModalOpen(false);
    await loadData();
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Droplets className="w-6 h-6 text-blue-600" />
            <span>{t('irrigation.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('irrigation.subtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCanalModalOpen(true)}
            className="px-3.5 py-2 bg-blue-50 text-blue-800 border border-blue-300 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors"
          >
            + कालवा वेळापत्रक नोंदवा
          </button>
          <button
            onClick={() => setLogModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-colors"
          >
            + सिंचन नोंद जोडा
          </button>
        </div>
      </div>

      {/* Two Big Hero Cards: 1. Canal Water Status & 2. Well Water Pump Live Switch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card A: Well / Borewell Pump Controller */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    किर्लोस्कर ७.५ HP विहीर पंप
                  </h3>
                  <span className="text-xs text-slate-500">
                    मुख्य विहीर • ठिबक सिंचन नियंत्रण
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isPumpRunning
                    ? 'bg-emerald-600 text-white animate-pulse'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {isPumpRunning ? 'पंप चालू आहे ⚡' : 'पंप बंद आहे'}
              </span>
            </div>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-500 text-[10px] font-bold block">सुरु वेळ</span>
                <span className="font-bold text-slate-800 mt-0.5 block">
                  {pumpStartTime || 'बंद'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold block">ऊर्जा स्त्रोत</span>
                <span className="font-bold text-blue-700 mt-0.5 block">महावितरण थ्री-फेज</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] font-bold block">वापरलेले युनिट</span>
                <span className="font-bold text-slate-800 mt-0.5 block">२४ युनिट (काल)</span>
              </div>
            </div>
          </div>

          {/* Master Toggle Pump Button */}
          <button
            onClick={handleTogglePump}
            className={`w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
              isPumpRunning
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
            }`}
          >
            <Power className="w-5 h-5" />
            <span>{isPumpRunning ? 'पाण्याचा पंप बंद करा' : 'पाण्याचा पंप सुरू करा'}</span>
          </button>
        </div>

        {/* Card B: Canal Water Arrival Tracker */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 leading-tight">
                    कालवा (कॅनॉल) पाणी नियोजन
                  </h3>
                  <span className="text-xs text-slate-500">
                    नीरा डावा कालवा • रब्बी हंगाम
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-100 text-cyan-800">
                आगामी आवर्तन
              </span>
            </div>

            {/* Next Schedule Details */}
            {canalSchedules.length > 0 && (
              <div className="mt-4 p-3.5 bg-cyan-50/60 rounded-2xl border border-cyan-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-cyan-950 font-bold">संभाव्य पाणी सुटण्याची तारीख:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-cyan-800 text-sm">
                      {canalSchedules[0].expected_date}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCanalSchedule(canalSchedules[0].id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                      title={t('common.delete') || 'हटवा'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <span>अपेक्षित प्रवाह (Discharge):</span>
                  <span>{canalSchedules[0].discharge_cusec} क्युसेक्स</span>
                </div>
                <p className="text-slate-600 pt-1 border-t border-cyan-100/70">
                  {canalSchedules[0].notes || 'सर्व मुख्य चारी साफ करून ठेवणे.'}
                </p>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-center space-x-2">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <span>सूचना: कालव्याचे पाणी आल्यावर प्रथम ६ एकर गहू व ४ एकर कांद्याला पाणी द्यावे.</span>
          </div>
        </div>

      </div>

      {/* Irrigation History Table */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          प्लॉटनिहाय पाणी पाळी नोंदवही (Irrigation History)
        </h3>

        <div className="space-y-2.5">
          {logs.map(log => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-50 hover:bg-slate-100/70 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900">{log.plot_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    log.source === 'canal' ? 'bg-cyan-100 text-cyan-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.source === 'canal' ? 'कालवा पाणी' : 'विहीर पंप'}
                  </span>
                </div>
                <p className="text-slate-500">
                  तारीख: <strong>{new Date(log.date).toLocaleDateString('mr-IN')}</strong> • चाललेले तास: <strong>{log.duration_hours} तास</strong>
                  {log.electricity_units ? ` • ${log.electricity_units} युनिट्स` : ''}
                  {log.fuel_liters ? ` • ${log.fuel_liters} लिटर डिझेल (₹${log.fuel_cost})` : ''}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {log.notes && (
                  <span className="text-slate-600 italic bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-[11px]">
                    {log.notes}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteLog(log.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title={t('common.delete') || 'हटवा'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Log Irrigation */}
      {logModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-blue-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">सिंचन व पाणी पाळी नोंदवा</h3>
              <button onClick={() => setLogModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLog} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">प्लॉट निवडा:</label>
                <select
                  value={plotId}
                  onChange={e => setPlotId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                >
                  {plots.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.area_acres} एकर)</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">पाण्याचा स्त्रोत:</label>
                  <select
                    value={source}
                    onChange={e => setSource(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pump">विहीर पंप (Pump)</option>
                    <option value="canal">कालवा पाणी (Canal)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">चाललेले तास:</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {source === 'pump' && (
                <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
                  <div>
                    <label className="block font-bold text-blue-950 mb-1">ऊर्जा प्रकार:</label>
                    <select
                      value={energyType}
                      onChange={e => setEnergyType(e.target.value as any)}
                      className="w-full px-3 py-2 border border-blue-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="electric">महावितरण वीज (Electric)</option>
                      <option value="diesel">डिझेल इंजिन (Diesel)</option>
                    </select>
                  </div>

                  {energyType === 'electric' ? (
                    <div>
                      <label className="block font-bold text-blue-950 mb-1">वापरलेले वीज युनिट्स:</label>
                      <input
                        type="number"
                        value={elecUnits}
                        onChange={e => setElecUnits(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-blue-200 rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-blue-950 mb-1">डिझेल लिटर:</label>
                        <input
                          type="number"
                          step="0.5"
                          value={fuelLiters}
                          onChange={e => setFuelLiters(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-200 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-blue-950 mb-1">डिझेल खर्च (₹):</label>
                        <input
                          type="number"
                          value={fuelCost}
                          onChange={e => setFuelCost(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-blue-200 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-800 mb-1">विशेष शेरा:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. ठिबक सिंचनाने पाणी पूर्ण भरले..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-700 text-white rounded-xl font-bold shadow-md hover:bg-blue-800"
                >
                  नोंद जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Canal Schedule */}
      {canalModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-cyan-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">कालवा पाणी आवर्तन नोंदवा</h3>
              <button onClick={() => setCanalModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCanal} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">अपेक्षित पाणी सुटण्याची तारीख:</label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={e => setExpectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">प्रवाह (क्युसेक्स):</label>
                <input
                  type="number"
                  value={discharge}
                  onChange={e => setDischarge(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">माहिती / टीप:</label>
                <input
                  type="text"
                  value={canalNotes}
                  onChange={e => setCanalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCanalModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-700 text-white rounded-xl font-bold shadow-md hover:bg-cyan-800"
                >
                  वेळापत्रक जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
