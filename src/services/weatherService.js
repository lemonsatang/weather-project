// src/services/weatherService.js
import { geocode } from "../utils/geocode"; // Nominatim 유틸 (이미 만든 파일 경로 기준)

const OPEN_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenWeather error ${res.status} ${text}`);
  }
  return res.json();
}

/** 좌표로 현재/5day 가져오기 */
export async function fetchCurrentWeatherByCoords(lat, lon) {
  if (!OPEN_KEY) throw new Error("OpenWeather API key is not set.");
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&appid=${OPEN_KEY}&units=metric&lang=kr`;
  return fetchJSON(url);
}

export async function fetch5DayForecastByCoords(lat, lon) {
  if (!OPEN_KEY) throw new Error("OpenWeather API key is not set.");
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(
    lat
  )}&lon=${encodeURIComponent(lon)}&appid=${OPEN_KEY}&units=metric&lang=kr`;
  return fetchJSON(url);
}

/** 도시 이름(q)으로 현재날씨 (직접 호출용, 실패 시 예외 던짐) */
export async function fetchCurrentWeatherByCityName(cityName) {
  if (!OPEN_KEY) throw new Error("OpenWeather API key is not set.");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    cityName
  )}&appid=${OPEN_KEY}&units=metric&lang=kr`;
  return fetchJSON(url);
}

/**
 * 안전한 호출: 1) 원문 q 시도 2) q + ",KR" 시도 3) geocode -> 좌표 호출
 * 반환: OpenWeather 현재 날씨 JSON (성공하면 바로 return)
 */
export async function fetchCurrentWeatherByCityNameWithFallback(cityName) {
  if (!cityName) throw new Error("cityName required");

  // helper: try by q string
  const tryByQ = async (q) => {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
      q
    )}&appid=${OPEN_KEY}&units=metric&lang=kr`;
    const res = await fetch(url);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`status:${res.status} body:${txt}`);
    }
    return res.json();
  };

  // geocode -> coords -> coords 호출
  try {
    const g = await geocode(cityName, { acceptLanguage: "en" });
    return await fetchCurrentWeatherByCoords(g.lat, g.lon);
  } catch (err3) {
    const msg = `All attempts failed. by q: ${err1.message}; q+KR: ${err2.message}; geocode: ${err3.message}`;
    throw new Error(msg);
  }
}

export async function fetchCurrentWeatherByCity(cityName) {
  if (!OPEN_KEY) throw new Error("OpenWeather API key is not set.");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    cityName
  )}&appid=${OPEN_KEY}&units=metric&lang=kr`;
  return fetchJSON(url);
}
