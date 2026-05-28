import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket/socket";

interface Participant {
  socketId: string;
  username: string;
  role: string;
}

function RoomPage() {

  const { roomId } = useParams();

  const location = useLocation();

  const username =
    location.state?.username || "Guest";

  const [participants, setParticipants] = useState<
    Participant[]
  >([]);

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

      <div className="bg-slate-900 rounded-xl p-6">

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
  );
}

export default RoomPage;