import Game from "../Components/Game/Game.tsx";

type MapPageProps = {
  avatar: string;
};

const MapPage: React.FC<MapPageProps> = ({ avatar }) => {
  return (
    <div className="w-screen h-screen relative">
      {/* Game takes full screen */}
      <Game avatar={avatar} />

      {/* Overlay UI (e.g., chat) */}
      {/* <div className="absolute bottom-0 left-0 w-full h-36 bg-white/90 border-t border-gray-300 p-4 overflow-y-auto z-50">
        <p className="text-gray-700">This is where player messages will show up.</p>
        
      </div> */}
    </div>
  );
};

export default MapPage;
