// App.tsx
import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import AvatarSelector from "./Pages/AvatarSelector";
import MapPage from "./Pages/Map";

const App: React.FC = () => {
  const [avatar, setAvatar] = useState(() => localStorage.getItem("selectedAvatar") || "");
  useEffect(() => localStorage.setItem("selectedAvatar", avatar), [avatar]);

  return (
    <Routes>
      <Route path="/" element={<AvatarSelector onSelect={setAvatar} />} />
      <Route path="/map" element={<MapPage avatar={avatar} />} />
    </Routes>
  );
};

export default App;
