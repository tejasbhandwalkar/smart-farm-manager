import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ShieldAlert,
  Plus,
  Upload,
  Camera,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  PhoneCall,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';
import { FarmDB } from '../services/db';
import { CropHealthRecord, Crop, Plot } from '../types';

export const CropHealthPage: React.FC = () => {
  const { t } = useTranslation();

  const [records, setRecords] = useState<CropHealthRecord[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [plots, setPlots] = useState<Plot[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Form states
  const [plotId, setPlotId] = useState('');
  const [cropId, setCropId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [diagnosisGuidance, setDiagnosisGuidance] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [healthRecords, cropsData, plotsData] = await Promise.all([
      FarmDB.getCropHealthRecords(),
      FarmDB.getCrops(),
      FarmDB.getPlots(),
    ]);
    setRecords(healthRecords);
    setCrops(cropsData);
    setPlots(plotsData);
    if (plotsData.length > 0 && !plotId) setPlotId(plotsData[0].id);
    if (cropsData.length > 0 && !cropId) setCropId(cropsData[0].id);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetPlot = plots.find(p => p.id === plotId);
    const targetCrop = crops.find(c => c.id === cropId);

    // Auto-guidance generator if empty based on symptoms
    let guidance = diagnosisGuidance;
    if (!guidance) {
      if (symptoms.includes('करपा') || symptoms.includes('डाग')) {
        guidance = 'संभाव्य कारण: बुरशीजन्य करपा रोग. प्राथमिक सल्ला: मॅन्कोझेब २.५ ग्रॅम प्रति लिटर किंवा प्रोपिकोनेझोल १ मिली प्रति लिटर फवारणी.';
      } else if (symptoms.includes('खोड') || symptoms.includes('किड')) {
        guidance = 'संभाव्य कारण: खोडकिड किंवा अळी प्रादुर्भाव. प्राथमिक सल्ला: निंबोळी अर्क ५% किंवा क्लोरँट्रानिलीप्रोल फवारणी.';
      } else {
        guidance = 'प्राथमिक सल्ला: स्थानिक कृषी तज्ज्ञांना झाडाचा प्रत्यक्ष नमुना दाखवून रासायनिक उपाययोजना ठरवावी.';
      }
    }

    await FarmDB.addCropHealthRecord({
      plot_id: plotId,
      plot_name: targetPlot?.name || 'प्लॉट',
      crop_id: cropId,
      crop_name: targetCrop?.crop_name || 'पीक',
      symptoms,
      diagnosis_guidance: guidance,
      severity,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1592417817098-8f3d69106093?auto=format&fit=crop&w=400&q=80',
      observation_date: new Date().toISOString().split('T')[0],
      status: 'under_observation',
    });

    setModalOpen(false);
    setSymptoms('');
    setDiagnosisGuidance('');
    await loadData();
  };

  const severityBadges: Record<string, { label: string; badge: string }> = {
    low: { label: 'सौम्य (Low)', badge: 'bg-emerald-100 text-emerald-800' },
    medium: { label: 'मध्यम (Medium)', badge: 'bg-amber-100 text-amber-800' },
    high: { label: 'तीव्र (High)', badge: 'bg-rose-100 text-rose-800' },
    critical: { label: 'अतिगंभीर (Critical)', badge: 'bg-red-200 text-red-900 animate-pulse' },
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-emerald-700" />
            <span>{t('crop_health.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('crop_health.subtitle')}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold shadow-md shadow-emerald-700/20 transition-all text-xs sm:text-sm"
        >
          <Camera className="w-4 h-4" />
          <span>+ रोगलक्षणे व फोटो नोंदवा</span>
        </button>
      </div>

      {/* Mandatory Agricultural Expert Disclaimer Alert */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-4 sm:p-5 text-amber-950 shadow-sm flex items-start space-x-3.5">
        <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs sm:text-sm">
          <h4 className="font-black text-amber-900">
            महत्त्वाची कृषी सूचना (Expert Advisory Recommendation):
          </h4>
          <p className="text-amber-900/90 leading-relaxed">
            {t('crop_health.expert_disclaimer')}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-bold text-emerald-800">
            <a
              href="tel:18001801551"
              className="inline-flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm hover:bg-emerald-50 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
              <span>किसान कॉल सेंटर: १८००-१८०-१५५१ (टोल-फ्री)</span>
            </a>
          </div>
        </div>
      </div>

      {/* Observations History Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          रोगनिरीक्षण व उपाययोजना नोंदवही ({records.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {records.map(rec => (
            <div
              key={rec.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      {rec.crop_name} • {rec.plot_name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      निरीक्षण तारीख: {new Date(rec.observation_date).toLocaleDateString('mr-IN')}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${severityBadges[rec.severity]?.badge}`}>
                    {severityBadges[rec.severity]?.label || rec.severity}
                  </span>
                </div>

                {/* Symptoms text */}
                <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100 text-xs">
                  <span className="text-rose-900 font-bold block mb-0.5">दिसलेली लक्षणे:</span>
                  <p className="text-rose-950">{rec.symptoms}</p>
                </div>

                {/* Diagnosis guidance */}
                {rec.diagnosis_guidance && (
                  <div className="mt-2.5 p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-xs">
                    <span className="text-emerald-900 font-bold block mb-0.5">
                      संभाव्य कारण व प्राथमिक मार्गदर्शन:
                    </span>
                    <p className="text-emerald-950 leading-relaxed">
                      {rec.diagnosis_guidance}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>निगराणी चालू आहे</span>
                </span>
                <span className="font-semibold text-emerald-800">
                  कृषी सेवा केंद्र सल्ला घ्यावा
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Record Crop Health */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-emerald-800 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">पीक लक्षणे व फोटो नोंदणी</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-full hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="p-5 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">प्लॉट निवडा:</label>
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

                <div>
                  <label className="block font-bold text-slate-800 mb-1">पीक निवडा:</label>
                  <select
                    value={cropId}
                    onChange={e => setCropId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    {crops.map(c => (
                      <option key={c.id} value={c.id}>{c.crop_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  दिसणारी लक्षणे (Symptoms):
                </label>
                <textarea
                  rows={3}
                  required
                  value={symptoms}
                  onChange={e => setSymptoms(e.target.value)}
                  placeholder="उदा. कांद्याच्या पानाच्या शेंड्यावर करपा, उसाच्या पानावर पिवळे चट्टे, खोडकिड..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">तीव्रता (Severity):</label>
                <select
                  value={severity}
                  onChange={e => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="low">सौम्य (Low - सुरुवातीची अवस्था)</option>
                  <option value="medium">मध्यम (Medium - काही झाडांवर प्रादुर्भाव)</option>
                  <option value="high">तीव्र (High - शेतात वेगाने पसरत आहे)</option>
                  <option value="critical">अतिगंभीर (Critical - तातडीने फवारणी आवश्यक)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  फोटो लिंक किंवा कृषी टीप:
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="कॅमेरा फोटो साठवणूक किंवा टीप"
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
