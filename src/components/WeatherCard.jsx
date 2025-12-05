import React from "react";
import { useNavigate } from "react-router-dom";
import "./WeatherCard.css";

export default function WeatherCard({ city, temp, desc, icon }) {
  const navigate = useNavigate();
  const openDetail = () => navigate(`/detail/${encodeURIComponent(city)}`);

  return (
    <div className="wc-card" onClick={openDetail} role="button" tabIndex={0}>
      <div className="wc-top">
        <div className="wc-city">{city}</div>
        <div className="wc-temp">
          {temp != null ? `${Math.round(temp)}°C` : "-"}
        </div>
      </div>
      <div className="wc-mid">
        <img src={icon} alt={desc || "icon"} className="wc-icon" />
        <div className="wc-desc">{desc}</div>
      </div>
    </div>
  );
}
