import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleJoinRoom = () => {

    if (!username || !roomId) return;

    navigate(`/room/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">

      <div className="bg-slate-900 p-8 rounded-2xl w-full max-w-md">

        <h1 className="text-4xl font-bold mb-8 text-center">
          Watch Party 🚀
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 outline-none"
          />

          <input
            type="text"
            placeholder="Enter room ID"
            value={roomId}
            onChange={(e) =>
              setRoomId(e.target.value)
            }
            className="w-full p-3 rounded-lg bg-slate-800 outline-none"
          />

          <button
            onClick={handleJoinRoom}
            className="w-full bg-red-500 hover:bg-red-600 transition-all p-3 rounded-lg font-semibold"
          >
            Join Room
          </button>

        </div>
      </div>
    </div>
  );
}

export default HomePage;