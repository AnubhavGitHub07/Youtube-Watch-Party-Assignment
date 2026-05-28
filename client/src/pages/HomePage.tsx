import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DottedSurface } from "@/components/ui/dotted-surface";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-black select-none">
      <DottedSurface />

      {/* Subtle Ambient Halo Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-violet-500/5 blur-[110px] rounded-full pointer-events-none z-0" />

      <div className="w-full max-w-4xl px-4 space-y-9 relative z-10 animate-fade-in-up flex flex-col items-center -translate-y-6 sm:-translate-y-10">

        {/* Header */}
        <div className="text-center space-y-3 relative w-full flex flex-col items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-pink-500/10 to-violet-500/10 opacity-30 blur-[60px] w-64 h-16 mx-auto rounded-full pointer-events-none -z-10" />

          <h1 className="text-3xl min-[480px]:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-white bg-clip-text text-transparent animate-title-premium select-none whitespace-nowrap leading-none filter drop-shadow-[0_4px_16px_rgba(255,255,255,0.12)] pb-1.5">
            YouTube Watch Party
          </h1>

          <p className="text-sm sm:text-base md:text-lg font-semibold tracking-wide bg-gradient-to-r from-rose-500 via-pink-500 to-violet-400 bg-clip-text text-transparent max-w-xl mx-auto filter drop-shadow-[0_0_12px_rgba(244,63,94,0.15)]">
            Watch YouTube videos together in real time
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-lg space-y-6">

        {/* Username — shared across both flows */}
        <div className="bg-black border border-zinc-800 rounded-lg p-6 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700">
          <label
            htmlFor="username-input"
            className="block text-sm font-medium text-zinc-400 mb-2"
          >
            Your Name
          </label>
          <input
            id="username-input"
            type="text"
            placeholder="e.g. Anubhav"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full h-11 px-4 rounded-md bg-black border border-zinc-800 outline-none
                       text-white placeholder-zinc-600 text-sm font-normal
                       hover:border-zinc-700 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                       transition-all duration-150"
          />
          {!username.trim() && (
            <p className="text-xs text-zinc-500 mt-2 font-normal">
              Enter your name to get started
            </p>
          )}
        </div>

        {/* Two-column card layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          {/* Create Room Card */}
          <div className="bg-black border border-zinc-800 rounded-lg p-6 flex flex-col space-y-5
                          hover:border-zinc-700 transition-all duration-300 shadow-2xl relative overflow-hidden group">
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Create Room
              </h2>
              <p className="text-xs text-zinc-500">
                Start a new watch party
              </p>
            </div>

            <div className="flex-1">
              <label
                htmlFor="room-name-input"
                className="block text-sm font-medium text-zinc-400 mb-2"
              >
                Room Name
                <span className="text-zinc-600 ml-1 font-normal text-xs">
                  (optional)
                </span>
              </label>
              <input
                id="room-name-input"
                type="text"
                placeholder="e.g. Marvel Night"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full h-11 px-4 rounded-md bg-black border border-zinc-800 outline-none
                           text-white placeholder-zinc-600 text-sm font-normal
                           hover:border-zinc-700 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                           transition-all duration-150"
              />
            </div>

            <button
              id="create-room-btn"
              onClick={handleCreateRoom}
              disabled={isCreateDisabled}
              className="w-full h-11 px-4 rounded-md font-semibold text-sm text-black bg-white
                         hover:bg-zinc-200 active:bg-zinc-300
                         disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-900 disabled:cursor-not-allowed
                         transition-all duration-150 cursor-pointer"
            >
              Create & Join
            </button>
          </div>

          {/* Join Room Card */}
          <div className="bg-black border border-zinc-800 rounded-lg p-6 flex flex-col space-y-5
                          hover:border-zinc-700 transition-all duration-300 shadow-2xl relative overflow-hidden group">
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Join Room
              </h2>
              <p className="text-xs text-zinc-500">
                Enter an existing room
              </p>
            </div>

            <div className="flex-1">
              <label
                htmlFor="room-id-input"
                className="block text-sm font-medium text-zinc-400 mb-2"
              >
                Room ID
              </label>
              <input
                id="room-id-input"
                type="text"
                placeholder="e.g. room-abc123"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full h-11 px-4 rounded-md bg-black border border-zinc-800 outline-none
                           text-white placeholder-zinc-600 text-sm font-normal
                           hover:border-zinc-700 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                           transition-all duration-150"
              />
            </div>

            <button
              id="join-room-btn"
              onClick={handleJoinRoom}
              disabled={isJoinDisabled}
              className="w-full h-11 px-4 rounded-md font-semibold text-sm text-white bg-black border border-zinc-800
                         hover:bg-zinc-900 hover:border-zinc-700
                         disabled:bg-black disabled:border-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed
                         transition-all duration-150 cursor-pointer"
            >
              Join Room
            </button>
          </div>

        </div>

      </div>

      </div>
    </div>
  );
}

export default HomePage;