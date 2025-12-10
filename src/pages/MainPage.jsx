// src/pages/MainPage.jsx
import React, { useEffect, useState } from "react";
import WeatherCard from "../components/WeatherCard";
import "./MainPage.css";
import { useNavigate } from "react-router-dom";
import { fetchCurrentWeatherByCityNameWithFallback } from "../services/weatherService";

export default function MainPage() {
  const [input, setInput] = useState("");
  const [recent, setRecent] = useState([]);
  const [majorData, setMajorData] = useState([]); // 실제 API로 받은 데이터
  const [loadingMajor, setLoadingMajor] = useState(true);
  const [majorError, setMajorError] = useState("");
  const navigate = useNavigate();

  // load recent from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("recentCities");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const saveRecent = (next) => {
    setRecent(next);
    try {
      localStorage.setItem("recentCities", JSON.stringify(next));
    } catch {}
  };

  const handleSearch = () => {
    const t = input.trim();
    if (!t) return;
    const next = [t, ...recent.filter((r) => r !== t)].slice(0, 6);
    saveRecent(next);
    setInput("");
    navigate(`/detail/${encodeURIComponent(t)}`);
  };

  const removeRecent = (city) => {
    const next = recent.filter((r) => r !== city);
    saveRecent(next);
  };

  // 주요 도시 리스트
  const majorCities = ["서울", "부산", "대구", "인천", "제주"];

  useEffect(() => {
    let mounted = true;
    setLoadingMajor(true);
    setMajorError("");
    setMajorData([]);

    (async () => {
      try {
        const promises = majorCities.map((c) =>
          fetchCurrentWeatherByCityNameWithFallback(c).then(
            (res) => ({ ok: true, city: c, data: res }),
            (err) => ({ ok: false, city: c, error: err })
          )
        );
        const results = await Promise.all(promises);
        if (!mounted) return;

        const success = results
          .filter((r) => r.ok)
          .map((r) => {
            const d = r.data;
            return {
              city: r.city,
              temp: d?.main?.temp ?? null,
              desc: d?.weather?.[0]?.description ?? "",
              icon: d?.weather?.[0]?.icon
                ? `https://openweathermap.org/img/wn/${d.weather[0].icon}@2x.png`
                : "",
            };
          });

        const failed = results.filter((r) => !r.ok);
        if (failed.length > 0) {
          console.warn("Some major city requests failed:", failed);
          setMajorError("일부 도시의 날씨를 가져오지 못했습니다.");
        }

        if (success.length === 0) {
          setMajorData([
            {
              city: "서울",
              temp: 17,
              desc: "흐림",
              icon: "https://openweathermap.org/img/wn/04d@2x.png",
            },
            {
              city: "부산",
              temp: 21,
              desc: "맑음",
              icon: "https://openweathermap.org/img/wn/01d@2x.png",
            },
            {
              city: "대구",
              temp: 20,
              desc: "구름조금",
              icon: "https://openweathermap.org/img/wn/02d@2x.png",
            },
            {
              city: "인천",
              temp: 16,
              desc: "비",
              icon: "https://openweathermap.org/img/wn/10d@2x.png",
            },
            {
              city: "제주",
              temp: 19,
              desc: "소나기",
              icon: "https://openweathermap.org/img/wn/09d@2x.png",
            },
          ]);
        } else {
          setMajorData(success);
        }
      } catch (err) {
        console.error("major fetch error", err);
        if (mounted) {
          setMajorError("주요 도시 정보를 불러오는 중 오류가 발생했습니다.");
          setMajorData([
            {
              city: "서울",
              temp: 17,
              desc: "흐림",
              icon: "https://openweathermap.org/img/wn/04d@2x.png",
            },
            {
              city: "부산",
              temp: 21,
              desc: "맑음",
              icon: "https://openweathermap.org/img/wn/01d@2x.png",
            },
            {
              city: "대구",
              temp: 20,
              desc: "구름조금",
              icon: "https://openweathermap.org/img/wn/02d@2x.png",
            },
            {
              city: "인천",
              temp: 16,
              desc: "비",
              icon: "https://openweathermap.org/img/wn/10d@2x.png",
            },
            {
              city: "제주",
              temp: 19,
              desc: "소나기",
              icon: "https://openweathermap.org/img/wn/09d@2x.png",
            },
          ]);
        }
      } finally {
        if (mounted) setLoadingMajor(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="main-page">
      <div className="main-inner">
        <section className="search-wrap">
          <h2 className="sr-title">도시 검색</h2>
          <div className="search-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="예: 서울"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <button className="btn-search" onClick={handleSearch}>
              검색
            </button>
          </div>

          <div className="recent-block">
            <div className="recent-header">
              <strong>최근 검색</strong>
              {recent.length > 0 && (
                <span className="recent-count">{recent.length}</span>
              )}
            </div>
            {recent.length === 0 ? (
              <div className="recent-empty">최근 검색 내역이 없습니다.</div>
            ) : (
              <ul className="recent-list">
                {recent.map((r) => (
                  <li key={r} className="recent-item">
                    <button
                      className="recent-link"
                      onClick={() =>
                        navigate(`/detail/${encodeURIComponent(r)}`)
                      }
                    >
                      {r}
                    </button>
                    <button
                      className="recent-del"
                      onClick={() => removeRecent(r)}
                      aria-label={`삭제 ${r}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="major-wrap">
          <h3>주요 도시</h3>

          {loadingMajor ? (
            <div style={{ color: "var(--muted)", padding: 12 }}>
              주요 도시 정보를 불러오는 중...
            </div>
          ) : majorError ? (
            <div style={{ color: "#b91c1c", padding: 8 }}>{majorError}</div>
          ) : null}

          <div className="major-cards">
            {majorData.map((m) => (
              <WeatherCard
                key={m.city}
                city={m.city}
                temp={m.temp}
                desc={m.desc}
                icon={m.icon}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
