// src/utils/summarizeForecast.js
/**
 * forecastJson: OpenWeather forecast response (list: [{ dt_txt, main: {temp}, weather: [...] }, ...])
 * maxDays: 최대 몇일치로 요약할지 (기본 5)
 */
export function summarizeForecast(forecastJson, maxDays = 5) {
  if (!forecastJson || !forecastJson.list) return [];

  const map = {};
  forecastJson.list.forEach((item) => {
    const day = item.dt_txt.split(" ")[0]; // YYYY-MM-DD
    if (!map[day]) map[day] = [];
    map[day].push(item);
  });

  const days = Object.keys(map).slice(0, maxDays);
  return days.map((day) => {
    const items = map[day];
    const temps = items.map((i) => i.main.temp);
    const temp_max = Math.round(Math.max(...temps));
    const temp_min = Math.round(Math.min(...temps));

    // 가장 많이 나온 weather[0].main 을 대표로 선택
    const freq = {};
    items.forEach((i) => {
      const key = i.weather[0].main;
      freq[key] = (freq[key] || 0) + 1;
    });
    const main = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];

    // main과 일치하는 첫 항목의 아이콘/description 사용
    const iconItem = items.find((i) => i.weather[0].main === main) || items[0];

    return {
      date: day,
      temp_max,
      temp_min,
      main,
      icon: iconItem.weather[0].icon,
      description: iconItem.weather[0].description,
    };
  });
}
