import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { socket } from "../socket/socket";
import VideoPlayer from "../components/VideoPlayer";
import { DottedSurface } from "../components/ui/dotted-surface";

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
        const handleConnect = () => {
            socket.emit("join_room", {
                roomId,
                username,
                roomName,
            });
        };

        if (socket.connected) {
            handleConnect();
        }

        socket.on("connect", handleConnect);

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
            socket.off("connect", handleConnect);
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
        <div className="min-h-screen p-4 sm:p-8 relative overflow-hidden bg-black">
            <DottedSurface />

            {/* Subtle Ambient Halo Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-pink-500/5 blur-[100px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-violet-500/5 blur-[110px] rounded-full pointer-events-none z-0" />

            <div className="relative z-10 max-w-7xl mx-auto space-y-6">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-extrabold tracking-tight text-white">
                            {roomName}
                        </h1>
                        {currentUserRole && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider ${currentUserRole === "HOST"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : currentUserRole === "MODERATOR"
                                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                    : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                                }`}>
                                {currentUserRole}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">
                        Room ID: <span className="text-zinc-400 font-mono select-all bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800/40 ml-1">{roomId}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    <div className="lg:col-span-2 space-y-4">

                        <div className="bg-black border border-zinc-800 p-5 rounded-xl shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/80">

                            <div className="flex gap-4 mb-4">

                                <input
                                    type="text"
                                    placeholder="Paste YouTube URL"
                                    value={videoUrl}
                                    onChange={(e) =>
                                        setVideoUrl(e.target.value)
                                    }
                                    disabled={!canControl}
                                    className="flex-1 h-11 px-4 rounded-md bg-black border border-zinc-800 outline-none
                                               text-white placeholder-zinc-600 text-sm font-normal
                                               hover:border-zinc-700 focus:border-zinc-400 focus:ring-1 focus:ring-zinc-400
                                               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-zinc-800
                                               transition-all duration-150"
                                />

                                <button
                                    onClick={handleLoadVideo}
                                    disabled={!canControl}
                                    className="h-11 px-6 rounded-md font-semibold text-sm text-black bg-white
                                               hover:bg-zinc-200 active:bg-zinc-300
                                               disabled:bg-zinc-900 disabled:text-zinc-600 disabled:border-zinc-900 disabled:cursor-not-allowed
                                               transition-all duration-150 cursor-pointer"
                                >
                                    Load
                                </button>

                            </div>

                            {videoId ? (
                                <VideoPlayer
                                    videoId={videoId}
                                    onReady={(player) => {
                                        playerRef.current = player;
                                    }}
                                    onPlay={handlePlay}
                                    onPause={handlePause}
                                    onSeek={handleSeek}
                                />
                            ) : (
                                <div className="w-full aspect-video bg-black border border-zinc-900/80 rounded-lg flex flex-col items-center justify-center p-6 space-y-4 select-none">
                                    <div className="text-5xl md:text-6xl mb-1 filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
                                        🎬
                                    </div>
                                    <p className="text-zinc-400 text-xs sm:text-sm md:text-base font-medium tracking-wide text-center">
                                        Load a YouTube video to start watching
                                    </p>
                                </div>
                            )}

                        </div>

                    </div>

                    <div className="bg-black border border-zinc-800 rounded-xl p-6 h-fit shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-zinc-700/80">

                        <h2 className="text-xl font-bold text-white mb-4">
                            Participants
                        </h2>

                        <div className="space-y-3">

                            {participants.map((participant) => (
                                <div
                                    key={participant.socketId}
                                    className="bg-black border border-zinc-800/80 hover:border-zinc-700 p-3.5 rounded-lg flex justify-between items-center transition-all duration-150"
                                >
                                    <span className="text-sm font-medium text-zinc-200">{participant.username}</span>

                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                                            participant.role === "HOST"
                                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                                : participant.role === "MODERATOR"
                                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                                : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                                        }`}>
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
                                                className="text-xs bg-black border border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:border-zinc-700 hover:text-white px-3 py-1.5 rounded-md cursor-pointer transition-all duration-150"
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
            </div>

            {showSeekDisclaimer && (
                <div className="fixed bottom-6 right-6 bg-black border border-zinc-800 text-zinc-200 px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-up max-w-sm z-50">
                    <div className="bg-red-500/10 p-2 rounded-lg text-red-400 animate-pulse">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div>
                        <p className="font-semibold text-sm text-red-400">Timeline Locked</p>
                        <p className="text-xs text-zinc-500 mt-0.5">Timeline authority belongs to the Host/Moderator. You will be resynced shortly.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoomPage;