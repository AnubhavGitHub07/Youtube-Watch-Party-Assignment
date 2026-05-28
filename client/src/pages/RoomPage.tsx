import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import VideoPlayer from "../components/VideoPlayer";

interface Participant {
    socketId: string;
    username: string;
    role: string;
}

interface RoomState {
    roomName: string;
    currentVideoId: string;
    isPlaying: boolean;
    participants: Participant[];
}

function RoomPage() {

    const { roomId } = useParams();

    const location = useLocation();

    const [videoUrl, setVideoUrl] = useState("");

    const [videoId, setVideoId] = useState("");

    const [isPlaying, setIsPlaying] = useState(false);

    const playerRef = useRef<any>(null);

    const isRemoteAction = useRef(false);

    // isPlaying will be consumed in play/pause sync (Phase 5)
    void isPlaying;

    const username =
        location.state?.username || "Guest";

    const [roomName, setRoomName] = useState<string>(
        location.state?.roomName || "Watch Party Room"
    );

    const [participants, setParticipants] = useState<
        Participant[]
    >([]);


    const extractVideoId = (url: string): string => {

        const regExp =
            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?v=))([^#&?]*).*/;

        const match = url.match(regExp);

        return match && match[7].length === 11
            ? match[7]
            : "";
    };



    const handleLoadVideo = () => {
        const extractedId = extractVideoId(videoUrl);
        if (!extractedId) return;
        setVideoId(extractedId);
        socket.emit("change_video", {
            roomId,
            videoId: extractedId,
        });
    };

    const handlePlay = () => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        socket.emit("play", {
            roomId,
        });
    };

    const handlePause = () => {
        if (isRemoteAction.current) {
            isRemoteAction.current = false;
            return;
        }

        socket.emit("pause", {
            roomId,
        });
    };

    const handleSeek = (time: number) => {
        if (isRemoteAction.current) {
            return;
        }

        socket.emit("seek", {
            roomId,
            time,
        });
    };

    useEffect(() => {
        socket.emit("join_room", {
            roomId,
            username,
            roomName,
        });

        const handleUserJoined = (data: { participants: Participant[] }) => {
            setParticipants(data.participants);
        };

        const handleUserLeft = (data: { participants: Participant[] }) => {
            setParticipants(data.participants);
        };

        const handleSyncState = (data: RoomState) => {
            setRoomName(data.roomName);
            setVideoId(data.currentVideoId);
            setIsPlaying(data.isPlaying);
            setParticipants(data.participants);
        };

        const handleVideoChanged = (data: { videoId: string }) => {
            setVideoId(data.videoId);
        };

        socket.on("user_joined", handleUserJoined);
        socket.on("user_left", handleUserLeft);
        socket.on("sync_state", handleSyncState);
        socket.on("video_changed", handleVideoChanged);

        socket.on("play_video", () => {

            if (!playerRef.current) return;

            isRemoteAction.current = true;

            playerRef.current.playVideo();
        });

        socket.on("pause_video", () => {

            if (!playerRef.current) return;

            isRemoteAction.current = true;

            playerRef.current.pauseVideo();
        });

        socket.on(
            "seek_video",
            ({ time }: { time: number }) => {

                if (!playerRef.current) return;

                isRemoteAction.current = true;

                playerRef.current.seekTo(time, true);
            }
        );

        return () => {
            socket.emit("leave_room", { roomId });
            socket.off("user_joined", handleUserJoined);
            socket.off("user_left", handleUserLeft);
            socket.off("sync_state", handleSyncState);
            socket.off("video_changed", handleVideoChanged);
            socket.off("seek_video");
        };
    }, [roomId, username]);

    return (
        <div className="min-h-screen p-8">

            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    {roomName}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Room ID: {roomId}
                </p>
            </div>

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
                            <VideoPlayer
                                videoId={videoId}
                                onReady={(player) => {
                                    playerRef.current = player;
                                }}
                                onPlay={handlePlay}
                                onPause={handlePause}
                                onSeek={handleSeek}
                            />
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