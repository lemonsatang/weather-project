// src/utils/geocode.js
// Nominatim forward geocoding helper
// 사용: const res = await geocode("서울");

const BASE = "https://nominatim.openstreetmap.org/search.php";

function sessionCacheKey(q) {
  return `geo_cache_${q}`;
}

/**
 * 한글(또는 기타) 지명 -> { lat, lon, display_name } 반환
 * 캐시(sessionStorage) 사용하여 같은 요청 반복 회피
 */
export async function geocode(query, { acceptLanguage = "en" } = {}) {
  if (!query) throw new Error("geocode: query required");

  const key = sessionCacheKey(query);
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    // ignore
  }

  const url = `${BASE}?q=${encodeURIComponent(
    query
  )}&format=jsonv2&limit=1&accept-language=${encodeURIComponent(
    acceptLanguage
  )}`;

  // Nominatim 퍼블릭 인스턴스 사용 시 User-Agent 또는 Referer 표기 권장
  const headers = {
    Accept: "application/json",
    "User-Agent": "K-Weather/1.0 (example@example.com)",
  };

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Geocoding error ${res.status}`);
  }
  const arr = await res.json();
  if (!Array.isArray(arr) || arr.length === 0) {
    throw new Error("위치를 찾을 수 없습니다.");
  }

  const top = arr[0];
  const out = {
    lat: top.lat,
    lon: top.lon,
    display_name: top.display_name || top.name || "",
    type: top.type || "",
    raw: top,
  };

  try {
    sessionStorage.setItem(key, JSON.stringify(out));
  } catch (e) {
    /* ignore storage errors */
  }

  return out;
}
