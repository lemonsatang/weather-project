import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCurrentWeatherByCity } from "../services/weatherService";
import "./Header.css";

const cityList = [
  { kr: "서울", en: "Seoul" },
  { kr: "부산", en: "Busan" },
  { kr: "대구", en: "Daegu" },
  { kr: "인천", en: "Incheon" },
  { kr: "광주", en: "Gwangju" },
];

export default function Header() {
  const [index, setIndex] = useState(0);
  const [weather, setWeather] = useState(null);

  const currentCity = cityList[index];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cityList.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadWeather() {
      try {
        const data = await fetchCurrentWeatherByCity(currentCity.en); // ★ 영문 사용
        setWeather(data);
      } catch (err) {
        console.error("Weather load error", err);
      }
    }
    loadWeather();
  }, [currentCity]);

  return (
    <header className="hdr">
      <div className="hdr-inner">
        {/* 로고 */}
        <Link to="/" className="logo">
          K-Weather
        </Link>

        {/* 오른쪽 자동 슬라이드 도시 날씨 */}
        <div
          className="rotating-city"
          onClick={() => navigate(`/detail/${currentCity}`)}
        >
          {weather ? (
            <>
              <img
                src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
                alt="icon"
              />
              <span className="city-name">{currentCity.kr}</span>
              <span className="temp">{Math.round(weather.main.temp)}°</span>
            </>
          ) : (
            <span className="loading-text">Loading...</span>
          )}
        </div>
      </div>
    </header>
  );
}
