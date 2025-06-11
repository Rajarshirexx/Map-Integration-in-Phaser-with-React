import React, { useState, useEffect } from "react";
import AvatarSelector from "./Pages/AvatarSelector";
import HostSession from "./Pages/HostSession";
import JoinSession from "./Pages/JoinSession";
import PlayRoom from "./Pages/Playroom";
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
        <Route path="/host" element={<HostSession avatar={selectedAvatar} />} />
        <Route path="/join/:sessionId" element={<JoinSession avatar={selectedAvatar} />} />
        <Route path="/play/:sessionId" element={<PlayRoom avatar={selectedAvatar} />} />
      </Routes>
    
  );
};

export default App;
