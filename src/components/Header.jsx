// src/components/Header.jsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchCurrentWeatherByCity } from "../services/weatherService";
import "./Header.css";

const CITY_LIST = [
  { kr: "서울", en: "Seoul" },
  { kr: "부산", en: "Busan" },
  { kr: "대구", en: "Daegu" },
  { kr: "인천", en: "Incheon" },
  { kr: "광주", en: "Gwangju" },
];

export default function Header() {
  const navigate = useNavigate();

  // 저장된 5개 도시 날씨 데이터
  const [items, setItems] = useState([]); // [{kr,en,temp,icon,desc,ok,error}]
  const [loading, setLoading] = useState(false);

  // 화면에 표시할 인덱스 (3초마다 변경)
  const [index, setIndex] = useState(0);

  const mountedRef = useRef(true);

  // 한 도시 날씨 안전 호출 (개별 실패 허용)
  async function fetchOneCity(city) {
    try {
      const res = await fetchCurrentWeatherByCity(city.en);
      return {
        kr: city.kr,
        en: city.en,
        temp:
          typeof res?.main?.temp === "number"
            ? Math.round(res.main.temp)
            : "--",
        icon: res?.weather?.[0]?.icon ?? "",
        desc: res?.weather?.[0]?.description ?? "",
        ok: true,
      };
    } catch (err) {
      console.warn("Header fetch fail for", city.en, err?.message || err);
      return {
        kr: city.kr,
        en: city.en,
        temp: "--",
        icon: "",
        desc: "",
        ok: false,
        error: err?.message || String(err),
      };
    }
  }

  // 모든 도시를 병렬로 불러와 items에 저장
  async function fetchAllCitiesAndStore() {
    setLoading(true);
    try {
      const promises = CITY_LIST.map((c) => fetchOneCity(c));
      const results = await Promise.all(promises);
      if (!mountedRef.current) return;
      setItems(results);
      // rotation을 처음으로 리셋 (선택)
      setIndex(0);
    } catch (err) {
      console.error("fetchAllCitiesAndStore error", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  // 마운트: 최초 호출 + 10분 간격 전체 업데이트
  useEffect(() => {
    mountedRef.current = true;

    // 최초 1회 로드
    fetchAllCitiesAndStore();

    // 10분 간격 갱신
    const intervalFetch = setInterval(() => {
      fetchAllCitiesAndStore();
    }, 600000); // 600000ms = 10분

    return () => {
      mountedRef.current = false;
      clearInterval(intervalFetch);
    };
  }, []); // 빈 배열: 컴포넌트 생애주기동안 한 번 설정

  // items(저장된 데이터)을 기반으로 3초마다 화면 전환 (API 호출 X)
  useEffect(() => {
    if (!items || items.length === 0) return;

    const intervalRotate = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000); // 3초

    return () => clearInterval(intervalRotate);
  }, [items]);

  const current = items[index] ?? null;

  return (
    <header className="hdr">
      <div className="hdr-inner">
        {/* 로고 */}
        <Link to="/" className="logo">
          K-Weather
        </Link>

        {/* 오른쪽 자동 날씨 슬라이드 (3초마다 저장된 items만 전환) */}
        <div
          className="rotating-city"
          onClick={() =>
            current && navigate(`/detail/${encodeURIComponent(current.kr)}`)
          }
          role="button"
          tabIndex={0}
        >
          {loading || !current ? (
            <span className="loading-text">Loading...</span>
          ) : (
            <>
              {current.icon ? (
                <img
                  src={`https://openweathermap.org/img/wn/${current.icon}.png`}
                  alt={current.desc || `${current.kr} icon`}
                />
              ) : (
                <img
                  // 아이콘 없을 때 투명한 플레이스홀더로 공간 유지
                  src={`https://openweathermap.org/img/wn/01d.png`}
                  alt="icon-placeholder"
                  style={{ opacity: current.icon ? 1 : 0.12 }}
                />
              )}

              <span className="city-name">{current.kr}</span>
              <span className="temp">{current.temp}°</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
