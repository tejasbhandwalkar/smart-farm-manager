import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Database, 
  X, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Key, 
  Server, 
  LogIn, 
  UserPlus, 
  LogOut,
  AlertTriangle,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FarmDB } from '../services/db';
import { saveSupabaseCredentials, clearSupabaseCredentials, getActiveSupabaseConfig } from '../lib/supabase';

interface DatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseModal: React.FC<DatabaseModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, signIn, signUp, signOut, isCloudConnected } = useAuth();

  const [activeTab, setActiveTab] = useState<'status' | 'config' | 'auth' | 'sql'>('status');
  const [supabaseUrl, setSupabaseUrl] = useState(getActiveSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(getActiveSupabaseConfig().key);
  const [saveMessage, setSaveMessage] = useState('');

  // Auth form states
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  if (!isOpen) return null;

  const handleSaveCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseKey) {
      setSaveMessage('कृपया दोन्ही URL आणि Key टाका');
      return;
    }
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
    setSaveMessage('यशस्वीरित्या जतन झाले! पृष्ठ रीलोड होत आहे...');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    clearSupabaseCredentials();
    setSupabaseUrl('');
    setSupabaseKey('');
    setSaveMessage('की हटवली. ॲप आता स्थानिक मोडमध्ये चालू आहे.');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleClearAllData = () => {
    if (window.confirm('सावधान: मागील सर्व डेटा (प्लॉट, पिके, मजूर, हिशोब, सिंचन) पूर्णपणे हटवला जाईल. तुम्हाला खात्री आहे का?')) {
      FarmDB.clearAllFarmData();
      alert('मागील सर्व डेटा यशस्वीरित्या हटवला गेला! नवीन डेटा भरण्यासाठी पृष्ठ रीफ्रेश होत आहे.');
      window.location.reload();
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('मूळ २० एकर ऊस, गहू, कांदा नमुना शेती डेटावर रीसेट करायचे का?')) {
      FarmDB.resetAllDataToDefaults();
      alert('डीफॉल्ट डेटा यशस्वीरित्या रिस्टोअर झाला! पृष्ठ रीफ्रेश होत आहे.');
      window.location.reload();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    if (authMode === 'signin') {
      const res = await signIn(email, password);
      if (!res.success) {
        setAuthError(res.error || 'लॉगिन अयशस्वी झाले');
      } else {
        onClose();
      }
    } else {
      const res = await signUp(email, password, fullName);
      if (!res.success) {
        setAuthError(res.error || 'नोंदणी अयशस्वी झाली');
      } else {
        setSaveMessage('नोंदणी झाली! ईमेल पडताळणी तपासा किंवा लॉगिन करा.');
      }
    }
    setAuthLoading(false);
  };

  const sqlCode = `-- Run this in your Supabase SQL Editor:
-- Complete 20-acre farm schema with RLS and Storage:
-- Check supabase/schema.sql and supabase/seed.sql in your workspace!`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-green-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {t('database.title')}
              </h2>
              <p className="text-xs text-emerald-200">
                PostgreSQL + Row Level Security (RLS) + Storage
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
              activeTab === 'status'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            स्थिती (Status)
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            कनेक्शन की (Keys)
          </button>
          <button
            onClick={() => setActiveTab('auth')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
              activeTab === 'auth'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            लॉगिन (Auth)
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`flex-1 py-3 px-2 text-center border-b-2 transition-all ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            SQL स्कीमा
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-slate-700 text-sm">
          
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-2xl border flex items-start space-x-3 ${
                  isCloudConnected
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                {isCloudConnected ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    {isCloudConnected
                      ? t('database.status_connected')
                      : t('database.status_local_sync')}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed">
                    {isCloudConnected
                      ? 'सर्व शेती डेटा (प्लॉट, पिके, मजूर, पाणी, हिशोब) थेट सुपाबेस पोस्टग्रेस डेटाबेसवर सुरक्षित साठवला जात आहे.'
                      : 'ॲप सध्या हाय-स्पीड स्थानिक ऑफलाइन स्टोरेज मोडमध्ये सुरळीत चालू आहे. शेतात नेटवर्क कमी असले तरी वडील सहज वापरू शकतात. सुपाबेस क्लाउड सिंकसाठी "कनेक्शन की" टॅबमध्ये प्रोजेक्ट URL व Key टाका.'}
                  </p>
                </div>
              </div>

              {/* Farm specifications summary */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
                <h4 className="font-bold text-slate-900 text-sm">
                  शेती डेटाबेस संरचना (20-Acre Architecture):
                </h4>
                <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                  <div>✅ एकर मर्यादा: <strong>२०.०० एकर</strong></div>
                  <div>✅ पोस्टग्रेस तक्ते: <strong>१६ तक्ते (Tables)</strong></div>
                  <div>✅ मुख्य पिके: <strong>ऊस, गहू, कांदा</strong></div>
                  <div>✅ सिंचन: <strong>कालवा व विहीर पंप</strong></div>
                  <div>✅ सुरक्षा: <strong>Row Level Security (RLS)</strong></div>
                  <div>✅ स्टोरेज: <strong>farm-media Bucket</strong></div>
                </div>
              </div>

              {/* Previous Data Management Box */}
              <div className="bg-rose-50/70 rounded-2xl p-4 border border-rose-200 space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-rose-900 text-sm flex items-center space-x-1.5">
                    <Trash2 className="w-4 h-4 text-rose-700" />
                    <span>मागील डेटा व्यवस्थापन (Previous Data Management)</span>
                  </h4>
                  <p className="text-slate-600 mt-1">
                    जर तुम्हाला जुना / नमुना डेटा काढून तुमच्या स्वतःच्या शेतीचा नवीन डेटा भरायचा असेल तर खालील पर्याय वापरा:
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClearAllData}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>मागील सर्व डेटा हटवा (Clear All Data)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetToDefaults}
                    className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                    <span>नमुना डेटावर रीसेट करा</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('config')}
                  className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-colors shadow-sm text-xs sm:text-sm"
                >
                  सुपाबेस की जोडा / बदला →
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CONFIG / KEYS */}
          {activeTab === 'config' && (
            <form onSubmit={handleSaveCredentials} className="space-y-4">
              <p className="text-xs text-slate-600">
                आपल्या <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 underline font-semibold inline-flex items-center">Supabase Dashboard <ExternalLink className="w-3 h-3 ml-1" /></a> मधील <strong>Project Settings → API</strong> मधून URL आणि anon public key येथे पेस्ट करा:
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Project URL:
                </label>
                <div className="relative">
                  <Server className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={supabaseUrl}
                    onChange={e => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Project Anon Public Key:
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={e => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {saveMessage && (
                <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold">
                  {saveMessage}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl transition-colors font-medium"
                >
                  की हटवा (स्थानिक मोड)
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 font-semibold transition-colors shadow-md text-xs sm:text-sm"
                >
                  जतन करा व कनेक्ट व्हा
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: AUTH */}
          {activeTab === 'auth' && (
            <div className="space-y-4">
              {user ? (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>लॉगिन झालेले खाते (Logged In):</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>User ID:</strong> {user.id}</p>
                  </div>
                  <button
                    onClick={signOut}
                    className="flex items-center space-x-1.5 px-3 py-2 bg-rose-600 text-white text-xs font-semibold rounded-xl hover:bg-rose-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट करा</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setAuthMode('signin')}
                      className={`flex-1 py-1.5 rounded-lg ${
                        authMode === 'signin' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      लॉगिन (Sign In)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className={`flex-1 py-1.5 rounded-lg ${
                        authMode === 'signup' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                      }`}
                    >
                      नवीन नोंदणी (Sign Up)
                    </button>
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        शेतकऱ्याचे पूर्ण नाव:
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="उदा. रंगराव पाटील"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ईमेल पत्ता:
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      पासवर्ड:
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  {authError && (
                    <div className="p-2.5 bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs">
                      {authError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 font-bold transition-colors shadow-md text-xs sm:text-sm flex items-center justify-center space-x-1"
                  >
                    {authMode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    <span>{authLoading ? 'कृपया थांबा...' : authMode === 'signin' ? 'लॉगिन करा' : 'नोंदणी करा'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 4: SQL SCHEMA */}
          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">
                  फाइल: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800">supabase/schema.sql</code>
                </span>
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold hover:bg-emerald-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'कॉपी झाले!' : 'SQL कॉपी करा'}</span>
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                <pre>{`-- 1. PROFILES
CREATE TABLE public.profiles (...);

-- 2. DIGITAL PLOTS (Total active plot <= 20 acres)
CREATE TABLE public.plots (...);

-- 3. CROPS (Sugarcane, Wheat, Onion)
CREATE TABLE public.crops (...);

-- 4. FERTILIZERS
CREATE TABLE public.crop_fertilizers (...);

-- 5. WORKERS (10+ workers, daily wages)
CREATE TABLE public.workers (...);

-- 6. ATTENDANCE & ADVANCES & PAYOUTS
CREATE TABLE public.worker_attendance (...);
CREATE TABLE public.worker_advances (...);
CREATE TABLE public.worker_payouts (...);

-- 7. DAILY TASKS & IRRIGATION & MACHINERY
CREATE TABLE public.daily_tasks (...);
CREATE TABLE public.irrigation_logs (...);
CREATE TABLE public.finances (...);
CREATE TABLE public.crop_health_records (...);
CREATE TABLE public.harvest_sales (...);

-- ROW LEVEL SECURITY (RLS) ENABLED ON ALL TABLES!`}</pre>
              </div>

              <p className="text-xs text-slate-500">
                टीप: संपूर्ण SQL फाइल <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/schema.sql</code> आणि <code className="bg-slate-100 px-1 py-0.5 rounded">supabase/seed.sql</code> थेट प्रोजेक्टमध्ये उपलब्ध आहेत.
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>

      </div>
    </div>
  );
};
