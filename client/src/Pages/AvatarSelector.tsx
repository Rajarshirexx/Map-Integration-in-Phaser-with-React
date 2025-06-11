import { useNavigate } from "react-router-dom";

const avatars = [
  { name: "Kurt", sprite: "player1.png" },
  { name: "Jimmy", sprite: "player2.png" },
  { name: "Bella", sprite: "player3.png" },
  { name: "Freddie", sprite: "player4.png" },
  { name: "Billie", sprite: "player5.png" },
];

type Props = {
  onSelect: (sprite: string) => void;
};

const AvatarSelector: React.FC<Props> = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleAvatarSelect = (sprite: string) => {
    onSelect(sprite);
  };

  const handleHost = () => {
    if (!localStorage.getItem("selectedAvatar")) {
      alert("Please select an avatar first.");
      return;
    }
    navigate("/host");
  };

  const handleJoin = () => {
    const sessionId = prompt("Enter Session ID:");
    if (sessionId) {
      navigate(`/join/${sessionId}`);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-yellow-300 to-orange-400 p-10 space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-md max-w-4xl w-full">
        <h2 className="text-2xl font-bold text-center mb-4">Select Your Avatar</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              onClick={() => handleAvatarSelect(avatar.sprite)}
              className="cursor-pointer hover:scale-105 transition"
            >
              <img
                src={`/assets/${avatar.sprite}`}
                alt={avatar.name}
                className="w-28 h-32 object-contain border rounded-md p-2 bg-gray-100"
              />
              <p className="text-center mt-2">{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleHost}
          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Host Game
        </button>
        <button
          onClick={handleJoin}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Join Game
        </button>
      </div>
    </div>
  );
};

export default AvatarSelector;
