import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface JoinSessionProps {
  avatar: string;
}

const JoinSession: React.FC<JoinSessionProps> = ({ avatar }) => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) return;
    navigate(`/play/${sessionId}`, { state: { avatar } });
  }, [sessionId, avatar, navigate]);

  return <div>Joining session...</div>;
};

export default JoinSession;
