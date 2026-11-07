import { WeatherData } from '../types';

export const fetchFarmWeather = async (
  latitude: number = 18.15,
  longitude: number = 74.58,
  locationName: string = 'बारामती / पुणे शेती परिसर'
): Promise<WeatherData> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FKolkata`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Weather API request failed');
    const data = await res.json();

    const current = data.current;
    const daily = data.daily;

    const weatherCodeNames: Record<number, string> = {
      0: 'निरभ्र आकाश (Clear Sky)',
      1: 'मुख्यतः निरभ्र (Mainly Clear)',
      2: 'काहीसे ढगाळ (Partly Cloudy)',
      3: 'पूर्ण ढगाळ (Overcast)',
      45: 'धुक्याची शक्यता (Foggy)',
      51: 'हलकी रिमझिम पाऊस (Light Drizzle)',
      61: 'हलका पाऊस (Slight Rain)',
      63: 'मध्यम पाऊस (Moderate Rain)',
      65: 'मुसळधार पाऊस (Heavy Rain)',
      80: 'पावसाच्या जोरदार सरी (Rain Showers)',
      95: 'वादळी वाऱ्यासह पाऊस (Thunderstorm)',
    };

    const daysOfWeek = ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];

    const forecast = daily.time.map((dateStr: string, idx: number) => {
      const d = new Date(dateStr);
      const dayName = daysOfWeek[d.getDay()];
      const code = daily.weather_code[idx];
      let icon = '☀️';
      if (code >= 51 && code <= 65) icon = '🌧️';
      else if (code >= 80) icon = '⛈️';
      else if (code === 2 || code === 3) icon = '⛅';
      else if (code === 45) icon = '🌫️';

      return {
        date: dateStr,
        dayName,
        maxTemp: Math.round(daily.temperature_2m_max[idx]),
        minTemp: Math.round(daily.temperature_2m_min[idx]),
        rainProb: daily.precipitation_probability_max[idx] || 0,
        icon,
      };
    });

    return {
      temperature: Math.round(current.temperature_2m),
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m),
      rainfallProbability: daily.precipitation_probability_max[0] || 0,
      weatherCode: current.weather_code,
      conditionText: weatherCodeNames[current.weather_code] || 'सामान्य हवामान',
      locationName,
      forecast: forecast.slice(0, 7),
    };
  } catch (err) {
    console.warn('Weather API fetch failed, fallback to standard agro-weather:', err);
    return {
      temperature: 28,
      humidity: 58,
      windSpeed: 14,
      rainfallProbability: 15,
      weatherCode: 1,
      conditionText: 'हवामान अनुकूल व निरभ्र',
      locationName,
      forecast: [
        { date: '2026-11-07', dayName: 'आज', maxTemp: 31, minTemp: 19, rainProb: 10, icon: '☀️' },
        { date: '2026-11-08', dayName: 'उद्या', maxTemp: 32, minTemp: 20, rainProb: 15, icon: '☀️' },
        { date: '2026-11-09', dayName: 'सोमवार', maxTemp: 31, minTemp: 19, rainProb: 20, icon: '⛅' },
        { date: '2026-11-10', dayName: 'मंगळवार', maxTemp: 30, minTemp: 18, rainProb: 25, icon: '⛅' },
        { date: '2026-11-11', dayName: 'बुधवार', maxTemp: 29, minTemp: 18, rainProb: 40, icon: '🌧️' },
        { date: '2026-11-12', dayName: 'गुरुवार', maxTemp: 30, minTemp: 19, rainProb: 20, icon: '☀️' },
        { date: '2026-11-13', dayName: 'शुक्रवार', maxTemp: 31, minTemp: 20, rainProb: 10, icon: '☀️' },
      ],
    };
  }
};
