import { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");

  const generateRoomId = (): string => {
    return `room-${Date.now().toString(36)}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
  };

  const handleCreateRoom = () => {
    if (!username.trim()) return;

    const generatedRoomId = generateRoomId();

    navigate(`/room/${generatedRoomId}`, {
      state: {
        username: username.trim(),
        roomName: roomName.trim() || undefined,
      },
    });
  };

  const handleJoinRoom = () => {
    if (!username.trim() || !roomId.trim()) return;

    navigate(`/room/${roomId.trim()}`, {
      state: { username: username.trim() },
    });
  };

  const isCreateDisabled = !username.trim();
  const isJoinDisabled = !username.trim() || !roomId.trim();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Watch Party
          </h1>
          <p className="text-slate-400 text-sm tracking-wide">
            Watch YouTube videos together in real time
          </p>
        </div>

        {/* Username — shared across both flows */}
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
          <label
            htmlFor="username-input"
            className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2"
          >
            Your Name
          </label>
          <input
            id="username-input"
            type="text"
            placeholder="e.g. Anubhav"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none
                       text-white placeholder-slate-500
                       focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
                       transition-all duration-200"
          />
          {!username.trim() && (
            <p className="text-xs text-slate-500 mt-2">
              Enter your name to get started
            </p>
          )}
        </div>

        {/* Two-column card layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Create Room Card */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4
                          hover:border-red-500/30 transition-colors duration-300">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/15 text-red-400 text-sm">
                  ✦
                </span>
                Create Room
              </h2>
              <p className="text-xs text-slate-500">
                Start a new watch party
              </p>
            </div>

            <div className="flex-1">
              <label
                htmlFor="room-name-input"
                className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2"
              >
                Room Name
                <span className="text-slate-600 ml-1 normal-case tracking-normal font-normal">
                  (optional)
                </span>
              </label>
              <input
                id="room-name-input"
                type="text"
                placeholder="e.g. Marvel Night"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none
                           text-white placeholder-slate-500 text-sm
                           focus:border-red-500/60 focus:ring-1 focus:ring-red-500/30
                           transition-all duration-200"
              />
            </div>

            <button
              id="create-room-btn"
              onClick={handleCreateRoom}
              disabled={isCreateDisabled}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide
                         bg-gradient-to-r from-red-500 to-pink-500
                         hover:from-red-600 hover:to-pink-600
                         disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg shadow-red-500/20
                         disabled:shadow-none cursor-pointer"
            >
              Create & Join
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 flex flex-col space-y-4
                          hover:border-sky-500/30 transition-colors duration-300">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-sky-500/15 text-sky-400 text-sm">
                  →
                </span>
                Join Room
              </h2>
              <p className="text-xs text-slate-500">
                Enter an existing room
              </p>
            </div>

            <div className="flex-1">
              <label
                htmlFor="room-id-input"
                className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2"
              >
                Room ID
              </label>
              <input
                id="room-id-input"
                type="text"
                placeholder="e.g. room-abc123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none
                           text-white placeholder-slate-500 text-sm
                           focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/30
                           transition-all duration-200"
              />
            </div>

            <button
              id="join-room-btn"
              onClick={handleJoinRoom}
              disabled={isJoinDisabled}
              className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide
                         bg-gradient-to-r from-sky-500 to-blue-500
                         hover:from-sky-600 hover:to-blue-600
                         disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg shadow-sky-500/20
                         disabled:shadow-none cursor-pointer"
            >
              Join Room
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default HomePage;