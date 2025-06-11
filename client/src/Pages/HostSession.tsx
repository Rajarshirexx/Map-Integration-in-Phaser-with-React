import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface HostSessionProps {
  avatar: string;
}

const HostSession: React.FC<HostSessionProps> = ({ avatar }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Generate a unique session ID
    const sessionId = uuidv4();

    // Optional: You could store session details on the server here via API call

    // Navigate to playroom with session ID and avatar passed in state
    navigate(`/play/${sessionId}`, { state: { avatar } });
  }, [avatar, navigate]);

  return <div>Creating your game session...</div>;
};

export default HostSession;
