import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./DetailPage.css";
import { geocode } from "../utils/geocode";
import {
  fetchCurrentWeatherByCoords,
  fetch5DayForecastByCoords,
} from "../services/weatherService";
import { summarizeForecast } from "../utils/summarizeForecast";

export default function DetailPage() {
  const { city } = useParams();
  const decodedCity = decodeURIComponent(city || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [place, setPlace] = useState(null);
  const [current, setCurrent] = useState(null);
  const [daily, setDaily] = useState([]);
  const [theme, setTheme] = useState("default"); // 날씨 테마

  useEffect(() => {
    if (!decodedCity) {
      setError("도시명이 없습니다.");
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError("");
    setPlace(null);
    setCurrent(null);
    setDaily([]);
    setTheme("default");

    (async () => {
      try {
        const g = await geocode(decodedCity, { acceptLanguage: "en" });
        if (!mounted) return;
        setPlace(g);

        const cur = await fetchCurrentWeatherByCoords(g.lat, g.lon);
        if (!mounted) return;
        setCurrent(cur);

        const mainRaw = (cur?.weather?.[0]?.main || "").toLowerCase();
        let th = "default";
        if (mainRaw.includes("clear")) th = "clear";
        else if (mainRaw.includes("cloud")) th = "clouds";
        else if (mainRaw.includes("rain") || mainRaw.includes("drizzle"))
          th = "rain";
        else if (mainRaw.includes("thunder")) th = "thunderstorm";
        else if (mainRaw.includes("snow")) th = "snow";
        else if (
          mainRaw.includes("mist") ||
          mainRaw.includes("fog") ||
          mainRaw.includes("haze")
        )
          th = "mist";
        setTheme(th);

        const fcast = await fetch5DayForecastByCoords(g.lat, g.lon);
        if (!mounted) return;
        const summarized = summarizeForecast(fcast, 5);
        setDaily(summarized);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setError(err.message || "데이터를 불러오지 못했습니다.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [decodedCity]);

  return (
    <div className={`detail-page weather-${theme}`}>
      <div className="detail-inner">
        <div className="detail-top">
          <Link to="/" className="back">
            ← 뒤로
          </Link>
          <h2>{decodedCity} 상세</h2>
        </div>

        {loading && <div className="dp-center">로딩중...</div>}
        {error && <div className="dp-error">{error}</div>}

        {!loading && !error && place && current && (
          <div className="detail-content">
            <div className="today-col">
              <div className="today-card">
                <div className="today-head">
                  <h3>{decodedCity}</h3>
                  <div className="small">습도: {current.main.humidity}%</div>
                </div>

                <div className="today-main">
                  <img
                    src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@2x.png`}
                    alt={current.weather[0].description}
                  />
                  <div className="today-stats">
                    <div className="today-temp">
                      {Math.round(current.main.temp)}°C
                    </div>
                    <div className="today-desc">
                      {current.weather[0].description}
                    </div>
                    <div className="today-feel">
                      체감: {Math.round(current.main.feels_like)}°C
                    </div>
                  </div>
                </div>

                <div className="place-info">
                  <div>
                    좌표: {place.lat}, {place.lon}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <strong>표기:</strong> {place.display_name}
                  </div>
                </div>
              </div>
            </div>

            <div className="five-col">
              <div className="five-list">
                {daily.map((d, i) => (
                  <div className="five-item" key={i}>
                    <div className="f-left">
                      <div className="f-date">
                        {i === 0
                          ? "오늘"
                          : d.date.split("-").slice(1).join("-")}
                      </div>
                      <img
                        src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                        alt={d.description}
                      />
                    </div>
                    <div className="f-right">
                      <div className="f-max">
                        <span className="label">최고</span> {d.temp_max}°
                      </div>
                      <div className="f-min">
                        <span className="label">최저</span> {d.temp_min}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
