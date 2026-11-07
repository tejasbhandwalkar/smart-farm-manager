import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tractor,
  Plus,
  Wrench,
  Fuel,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { MachineryItem, MachineryCondition } from '../types';

export const MachineryPage: React.FC = () => {
  const { t } = useTranslation();

  const [machinery, setMachinery] = useState<MachineryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineryItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [purchaseYear, setPurchaseYear] = useState(2022);
  const [condition, setCondition] = useState<MachineryCondition>('good');
  const [nextServiceDue, setNextServiceDue] = useState('2026-12-15');
  const [notes, setNotes] = useState('');

  // Maintenance form
  const [maintType, setMaintType] = useState<'maintenance' | 'fuel' | 'repair'>('maintenance');
  const [cost, setCost] = useState(2500);
  const [maintNotes, setMaintNotes] = useState('ऑइल व फिल्टर बदलले');

  const loadMachinery = async () => {
    setLoading(true);
    const data = await FarmDB.getMachinery();
    setMachinery(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMachinery();
  }, []);

  const handleAddMachinery = async (e: React.FormEvent) => {
    e.preventDefault();
    await FarmDB.addMachinery({
      name,
      model,
      purchase_year: Number(purchaseYear),
      condition,
      next_service_due: nextServiceDue,
      notes,
    });
    setModalOpen(false);
    setName('');
    setModel('');
    await loadMachinery();
  };

  const handleRecordMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMachine) return;

    // Log to finance automatically!
    await FarmDB.addFinanceItem({
      type: 'expense',
      category: 'cat_machinery',
      amount: Number(cost),
      date: new Date().toISOString().split('T')[0],
      payment_mode: 'cash',
      notes: `${selectedMachine.name}: ${maintNotes}`,
    });

    setMaintenanceModalOpen(false);
    alert('देखभाल खर्च यशस्वीरित्या नोंदवला व हिशोबात समाविष्ट केला!');
  };

  const conditionBadges: Record<MachineryCondition, { label: string; badge: string }> = {
    good: { label: 'उत्तम चालू स्थिती', badge: 'bg-emerald-100 text-emerald-800' },
    needs_service: { label: 'सर्व्हिसिंग आवश्यक', badge: 'bg-amber-100 text-amber-800' },
    breakdown: { label: 'नादुरुस्त', badge: 'bg-rose-100 text-rose-800' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Tractor className="w-6 h-6 text-emerald-700" />
            <span>{t('machinery.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('machinery.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('machinery.add_machinery')}</span>
        </button>
      </div>

      {/* Machinery Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machinery.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {item.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.model} • खरेदी: {item.purchase_year}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${conditionBadges[item.condition].badge}`}>
                  {conditionBadges[item.condition].label}
                </span>
              </div>

              {item.notes && (
                <p className="text-xs text-slate-600 mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  {item.notes}
                </p>
              )}

              {/* Service reminder badge */}
              <div className="mt-3 flex items-center space-x-2 text-xs text-slate-600">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>
                  पुढील सर्व्हिसिंग तारीख: <strong>{item.next_service_due ? new Date(item.next_service_due).toLocaleDateString('mr-IN') : 'नियोजित नाही'}</strong>
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  setSelectedMachine(item);
                  setMaintenanceModalOpen(true);
                }}
                className="flex-1 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center space-x-1 border border-emerald-200"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>दुरुस्ती / ऑइल खर्च नोंदवा</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Add Machinery */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">{t('machinery.add_machinery')}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMachinery} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">यंत्राचे नाव:</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="उदा. महिंद्रा ट्रॅक्टर ५७५ DI"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">कंपनी व मॉडेल:</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="उदा. Mahindra 45 HP"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">खरेदी वर्ष:</label>
                  <input
                    type="number"
                    value={purchaseYear}
                    onChange={e => setPurchaseYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">स्थिती:</label>
                  <select
                    value={condition}
                    onChange={e => setCondition(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="good">उत्तम चालू स्थिती</option>
                    <option value="needs_service">सर्व्हिसिंग आवश्यक</option>
                    <option value="breakdown">नादुरुस्त</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">पुढील सर्व्हिसिंग तारीख:</label>
                <input
                  type="date"
                  value={nextServiceDue}
                  onChange={e => setNextServiceDue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">टीप:</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="उदा. इंजिन ऑइल आणि फिल्टर बदलले..."
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
                  यंत्र जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Maintenance */}
      {maintenanceModalOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">देखभाल व दुरुस्ती खर्च</h3>
                <p className="text-xs text-emerald-200">{selectedMachine.name}</p>
              </div>
              <button onClick={() => setMaintenanceModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordMaintenance} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-800 mb-1">खर्च प्रकार:</label>
                <select
                  value={maintType}
                  onChange={e => setMaintType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="maintenance">नियमित सर्व्हिसिंग (Maintenance)</option>
                  <option value="repair">नादुरुस्ती व पार्ट बदलणे (Repair)</option>
                  <option value="fuel">डिझेल भरणा (Fuel)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">खर्च रक्कम (₹):</label>
                <input
                  type="number"
                  required
                  value={cost}
                  onChange={e => setCost(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">तपशील:</label>
                <input
                  type="text"
                  value={maintNotes}
                  onChange={e => setMaintNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setMaintenanceModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-semibold text-slate-700"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-bold shadow-md hover:bg-emerald-800"
                >
                  खर्च जतन करा
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
