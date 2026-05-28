import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import VideoPlayer from "../components/VideoPlayer";

interface Participant {
  socketId: string;
  username: string;
  role: string;
}

function RoomPage() {

  const { roomId } = useParams();

  const location = useLocation();

  const [videoUrl, setVideoUrl] = useState("");

  const [videoId, setVideoId] = useState("");

  const username =
    location.state?.username || "Guest";

  const [participants, setParticipants] = useState<
    Participant[]
  >([]);

  const extractVideoId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : "";
  };

  const handleLoadVideo = () => {
    const extractedId = extractVideoId(videoUrl);
    if (!extractedId) return;
    setVideoId(extractedId);
  };

  useEffect(() => {
    socket.emit("join_room", {
      roomId,
      username,
    });

    const handleUserJoined = (data: { participants: Participant[] }) => {
      setParticipants(data.participants);
    };

    const handleUserLeft = (data: { participants: Participant[] }) => {
      setParticipants(data.participants);
    };

    socket.on("user_joined", handleUserJoined);
    socket.on("user_left", handleUserLeft);

    return () => {
      socket.emit("leave_room", { roomId });
      socket.off("user_joined", handleUserJoined);
      socket.off("user_left", handleUserLeft);
    };
  }, [roomId, username]);

  return (
    <div className="min-h-screen p-8">

      <h1 className="text-3xl font-bold mb-6">
        Room: {roomId}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">

          <div className="bg-slate-900 p-4 rounded-xl">

            <div className="flex gap-4 mb-4">

              <input
                type="text"
                placeholder="Paste YouTube URL"
                value={videoUrl}
                onChange={(e) =>
                  setVideoUrl(e.target.value)
                }
                className="flex-1 p-3 rounded-lg bg-slate-800 outline-none"
              />

              <button
                onClick={handleLoadVideo}
                className="bg-red-500 hover:bg-red-600 px-6 rounded-lg"
              >
                Load
              </button>

            </div>

            {videoId && (
              <VideoPlayer videoId={videoId} />
            )}

          </div>

        </div>

        <div className="bg-slate-900 rounded-xl p-6 h-fit">

          <h2 className="text-2xl font-semibold mb-4">
            Participants
          </h2>

          <div className="space-y-3">

            {participants.map((participant) => (
              <div
                key={participant.socketId}
                className="bg-slate-800 p-3 rounded-lg flex justify-between"
              >
                <span>{participant.username}</span>

                <span className="text-red-400">
                  {participant.role}
                </span>
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}

export default RoomPage;