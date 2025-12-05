import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import MainPage from "./pages/MainPage";
import DetailPage from "./pages/DetailPage";
import Header from "./components/Header";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <Header />
      <main className="app-container">
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/detail/:city" element={<DetailPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
