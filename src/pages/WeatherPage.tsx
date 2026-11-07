import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { fetchFarmWeather } from '../services/weather';
import { WeatherData } from '../types';

export const WeatherPage: React.FC = () => {
  const { t } = useTranslation();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = async () => {
    setLoading(true);
    const data = await fetchFarmWeather();
    setWeather(data);
    setLoading(false);
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await fetchFarmWeather();
    setWeather(data);
    setRefreshing(false);
  };

  if (loading || !weather) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-800 text-xs font-semibold">हवामान उपग्रह माहिती लोड होत आहे...</p>
      </div>
    );
  }

  // Dynamic Agricultural Advisory based on live data
  const hasRainAlert = weather.rainfallProbability >= 30;
  const hasHeatAlert = weather.temperature >= 33;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <CloudSun className="w-6 h-6 text-emerald-700" />
            <span>{t('weather.title')}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            {t('weather.subtitle')}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>ताजी माहिती मिळवा</span>
        </button>
      </div>

      {/* Main Hero Card: Current Live Weather */}
      <div className="bg-gradient-to-br from-blue-700 via-sky-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-sky-950/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold">
              <MapPin className="w-3.5 h-3.5 text-sky-300" />
              <span>{weather.locationName}</span>
            </div>

            <div className="flex items-center space-x-4 pt-1">
              <span className="text-6xl sm:text-7xl font-black tracking-tight">
                {weather.temperature}°C
              </span>
              <div className="space-y-1">
                <span className="text-lg sm:text-xl font-bold block text-sky-100">
                  {weather.conditionText}
                </span>
                <span className="text-xs text-sky-200 block">
                  पाऊस शक्यता: <strong>{weather.rainfallProbability}%</strong>
                </span>
              </div>
            </div>
          </div>

          {/* 3 Quick Parameters */}
          <div className="grid grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center text-xs">
            <div>
              <Droplets className="w-5 h-5 mx-auto text-sky-300 mb-1" />
              <span className="text-[10px] text-sky-200 block">आर्द्रता</span>
              <span className="font-bold text-sm block mt-0.5">{weather.humidity}%</span>
            </div>
            <div>
              <Wind className="w-5 h-5 mx-auto text-sky-300 mb-1" />
              <span className="text-[10px] text-sky-200 block">वाऱ्याचा वेग</span>
              <span className="font-bold text-sm block mt-0.5">{weather.windSpeed} किमी/तास</span>
            </div>
            <div>
              <CloudRain className="w-5 h-5 mx-auto text-sky-300 mb-1" />
              <span className="text-[10px] text-sky-200 block">पाऊस अंदाज</span>
              <span className="font-bold text-sm block mt-0.5">{weather.rainfallProbability}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Agricultural Weather Alerts */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-1.5">
          <Sparkles className="w-4 h-4 text-emerald-700" />
          <span>शेतकऱ्यांसाठी कृषी हवामान सल्ला (Agro-Advisory):</span>
        </h3>

        {hasRainAlert ? (
          <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 text-xs sm:text-sm flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900">पाऊस शक्यता इशारा ({weather.rainfallProbability}%):</span>
              <p className="mt-0.5 leading-relaxed text-amber-900/90">
                {t('weather.alert_rain')} खते जमिनीतून वाहून जाण्याचा धोका असल्याने युरिया टाकणे थांबवावे.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs sm:text-sm flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-900">हवामान अनुकूल आहे:</span>
              <p className="mt-0.5 leading-relaxed text-emerald-900/90">
                {t('weather.alert_clear')} गहू पेरणी, कांदा गादीवाफे मशागत व उसाला ठिबक सिंचन देण्यासाठी सर्वोत्तम वेळ.
              </p>
            </div>
          </div>
        )}

        {hasHeatAlert && (
          <div className="p-4 bg-orange-50 border border-orange-300 rounded-2xl text-orange-950 text-xs sm:text-sm flex items-start space-x-3">
            <Thermometer className="w-5 h-5 text-orange-700 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-orange-900">कडक ऊन व बाष्पीभवन इशारा:</span>
              <p className="mt-0.5 leading-relaxed text-orange-900/90">
                {t('weather.alert_heat')} दुपारच्या उन्हात पाणी देणे टाळावे, पिकांना सायंकाळी किंवा रात्री विहीर पंपावरून पाणी द्यावे.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 7-Day Weather Forecast Grid */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          <span>{t('weather.forecast_7days')}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {weather.forecast.map((f, i) => (
            <div
              key={f.date}
              className={`p-3 rounded-2xl border text-center transition-all ${
                i === 0
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <span className="text-xs font-bold text-slate-800 block">
                {f.dayName}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {new Date(f.date).toLocaleDateString('mr-IN', { day: 'numeric', month: 'short' })}
              </span>

              <div className="text-3xl my-2">
                {f.icon}
              </div>

              <div className="text-xs font-black text-slate-900">
                {f.maxTemp}° / <span className="text-slate-500 font-semibold">{f.minTemp}°</span>
              </div>

              <div className="mt-1 text-[10px] font-bold text-blue-700 bg-blue-50 py-0.5 rounded-md">
                पाऊस: {f.rainProb}%
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
