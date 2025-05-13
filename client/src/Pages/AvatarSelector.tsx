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
    navigate("/map");
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center bg-gradient-to-br from-yellow-300 to-red-400 p-20">
      <div className="bg-gradient-to-br from-green-200 to-pink-400  shadow-2xl rounded-xl p-6 w-full max-w-4xl border border-gray-200">
        <h2 className="text-center text-3xl font-bold text-gray-800 mb-6">Select Your Avatar</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              onClick={() => handleAvatarSelect(avatar.sprite)}
              className="flex flex-col items-center cursor-pointer transform hover:scale-105 transition duration-200 ease-in-out"
            >
              <img
                src={`/assets/${avatar.sprite}`}
                alt={avatar.name}
                className="w-28 sm:w-32 md:w-36 lg:w-44 xl:w-48 h-auto object-contain border border-gray-300 rounded-lg shadow-md p-2 bg-gray-50"
              />
              <p className="mt-2 text-sm font-medium text-gray-700">{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvatarSelector;
