import React, { useState, useEffect } from "react";
import AvatarSelector from "./Pages/AvatarSelector.tsx";
import MapPage from "./Pages/Map.tsx";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const App: React.FC = () => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(() => {
    return localStorage.getItem("selectedAvatar") || "";
  });

  useEffect(() => {
    localStorage.setItem("selectedAvatar", selectedAvatar);
  }, [selectedAvatar]);

  return (
      <Routes>
        <Route path="/" element={<AvatarSelector onSelect={setSelectedAvatar} />} />
        <Route path="/map" element={<MapPage avatar={selectedAvatar} />} />
      </Routes>
  );
};

export default App;
