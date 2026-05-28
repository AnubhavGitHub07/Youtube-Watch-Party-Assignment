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

    const playerRef = useRef<any>(null);

    const isRemoteAction = useRef(false);

    const username =
        location.state?.username || "Guest";

    const [roomName, setRoomName] = useState<string>(
        location.state?.roomName || "Watch Party Room"
    );

    const [participants, setParticipants] = useState<
        Participant[]
    >([]);

    const [currentUserRole, setCurrentUserRole] = useState("");

    const [showSeekDisclaimer, setShowSeekDisclaimer] = useState(false);

    const disclaimerTimeoutRef = useRef<any>(null);

    const canControl =
        currentUserRole === "HOST" ||
        currentUserRole === "MODERATOR";

    const canControlRef = useRef(canControl);
    canControlRef.current = canControl;


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

        if (!canControl) {
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

        if (!canControl) {
            return;
        }

        socket.emit("pause", {
            roomId,
        });
    };

    const handleSeek = (time: number) => {

        if (!canControl) {
            if (!isRemoteAction.current) {
                if (disclaimerTimeoutRef.current) {
                    clearTimeout(disclaimerTimeoutRef.current);
                }
                setShowSeekDisclaimer(true);
                disclaimerTimeoutRef.current = setTimeout(() => {
                    setShowSeekDisclaimer(false);
                    disclaimerTimeoutRef.current = null;
                }, 4000);
            }
            return;
        }

       
        if (isRemoteAction.current) {
            return;
        }

        socket.emit("seek", {
            roomId,
            time,
        });
    };

    const handleToggleModerator = (targetSocketId: string) => {
        socket.emit("toggle_moderator", {
            roomId,
            targetSocketId,
        });
    };

    useEffect(() => {
        socket.emit("join_room", {
            roomId,
            username,
            roomName,
        });

        const interval = setInterval(() => {
            if (!canControlRef.current) return;
            if (!playerRef.current) return;

            const currentTime = playerRef.current.getCurrentTime();
            socket.emit("sync_time", {
                roomId,
                currentTime,
            });
        }, 3000);

        const handleUserJoined = (data: { participants: Participant[] }) => {
            setParticipants(data.participants);
            const currentParticipant = data.participants.find(
                (p) => p.socketId === socket.id
            );
            if (currentParticipant) {
                setCurrentUserRole(currentParticipant.role);
            }
        };

        const handleUserLeft = (data: { participants: Participant[] }) => {
            setParticipants(data.participants);
            const currentParticipant = data.participants.find(
                (p) => p.socketId === socket.id
            );
            if (currentParticipant) {
                setCurrentUserRole(currentParticipant.role);
            }
        };

        const handleSyncState = (data: RoomState) => {
            setRoomName(data.roomName);
            setVideoId(data.currentVideoId);
            setParticipants(data.participants);
            const currentParticipant = data.participants.find(
                (p) => p.socketId === socket.id
            );
            if (currentParticipant) {
                setCurrentUserRole(currentParticipant.role);
            }
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

        socket.on(
            "sync_time_update",
            ({ currentTime }: { currentTime: number }) => {
                if (!playerRef.current) return;
                if (canControlRef.current) return;

                const localTime = playerRef.current.getCurrentTime();
                const drift = Math.abs(localTime - currentTime);

                if (drift > 2) {
                    isRemoteAction.current = true;
                    playerRef.current.seekTo(currentTime, true);
                }
            }
        );

        socket.on(
            "roles_updated",
            ({
                participants,
            }: {
                participants: Participant[];
            }) => {
                setParticipants(participants);

                const currentParticipant = participants.find(
                    (p) => p.socketId === socket.id
                );

                if (currentParticipant) {
                    setCurrentUserRole(currentParticipant.role);
                }
            }
        );

        return () => {
            clearInterval(interval);
            if (disclaimerTimeoutRef.current) {
                clearTimeout(disclaimerTimeoutRef.current);
            }
            socket.emit("leave_room", { roomId });
            socket.off("user_joined", handleUserJoined);
            socket.off("user_left", handleUserLeft);
            socket.off("sync_state", handleSyncState);
            socket.off("video_changed", handleVideoChanged);
            socket.off("seek_video");
            socket.off("sync_time_update");
            socket.off("roles_updated");
        };
    }, [roomId, username]);

    return (
        <div className="min-h-screen p-8">

            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold">
                        {roomName}
                    </h1>
                    {currentUserRole && (
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${currentUserRole === "HOST"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : currentUserRole === "MODERATOR"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                            }`}>
                            {currentUserRole}
                        </span>
                    )}
                </div>
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
                                disabled={!canControl}
                                className="flex-1 p-3 rounded-lg bg-slate-800 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            />

                            <button
                                onClick={handleLoadVideo}
                                disabled={!canControl}
                                className="bg-red-500 hover:bg-red-600 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
                                className="bg-slate-800 p-3 rounded-lg flex justify-between items-center"
                            >
                                <span>{participant.username}</span>

                                <div className="flex items-center gap-3">
                                    <span className={
                                        participant.role === "HOST"
                                            ? "text-red-400"
                                            : participant.role === "MODERATOR"
                                            ? "text-blue-400"
                                            : "text-slate-400"
                                    }>
                                        {participant.role}
                                    </span>

                                    {currentUserRole === "HOST" &&
                                     participant.role !== "HOST" && (
                                        <button
                                            onClick={() =>
                                                handleToggleModerator(
                                                    participant.socketId
                                                )
                                            }
                                            className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg cursor-pointer transition-colors"
                                        >
                                            {participant.role === "MODERATOR"
                                                ? "Remove Moderator"
                                                : "Make Moderator"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                    </div>
                </div>

            </div>

            {showSeekDisclaimer && (
                <div className="fixed bottom-6 right-6 bg-slate-900 border border-red-500/30 text-slate-200 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up max-w-sm z-50">
                    <div className="bg-red-500/10 p-2 rounded-lg text-red-400 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-red-400">Timeline Locked</p>
                        <p className="text-xs text-slate-400 mt-0.5">Timeline authority belongs to the Host/Moderator. You will be resynced shortly.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomPage;