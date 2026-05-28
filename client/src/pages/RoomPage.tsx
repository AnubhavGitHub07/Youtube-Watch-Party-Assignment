import { useParams } from "react-router-dom";

function RoomPage() {
  const { roomId } = useParams();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        Room: {roomId}
      </h1>
    </div>
  );
}

export default RoomPage;