import { Server, Socket } from "socket.io";
import { rooms } from "../rooms/roomStore";
import { Participant, Room, Role } from "../types/room.types";
import {
    canControlPlayback,
    isHost,
} from "../utils/permissions";

const removeUserFromRoom = (io: Server, socketId: string, roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    const participantIndex = room.participants.findIndex(
        (p) => p.socketId === socketId
    );

    if (participantIndex !== -1) {
        const removedParticipant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);

        // If the host left and there are other participants, elect a new host
        if (removedParticipant.role === "HOST" && room.participants.length > 0) {
            const nextHost = room.participants[0];
            nextHost.role = "HOST";
            room.hostId = nextHost.socketId;
            
            io.to(roomId).emit("roles_updated", {
                participants: room.participants,
            });
        }

        io.to(roomId).emit("user_left", {
            participants: room.participants,
        });

        console.log(
            `${removedParticipant.username} left room ${roomId}`
        );

        if (room.participants.length === 0) {
            delete rooms[roomId];
        }
    }
};

export const registerRoomHandlers = (
    io: Server,
    socket: Socket
) => {
    socket.on(
        "join_room",
        ({
            roomId,
            username,
            roomName,
        }: {
            roomId: string;
            username: string;
            roomName?: string;
        }) => {

            socket.join(roomId);

            let room = rooms[roomId];

            if (!room) {
                room = {
                    id: roomId,
                    roomName: roomName || "Watch Party Room",
                    hostId: socket.id,

                    currentVideoId: "",
                    currentTime: 0,
                    isPlaying: false,

                    participants: [],
                };

                rooms[roomId] = room;
            }

            // Check if there is already an active host in the room
            const hasActiveHost = room.participants.some(p => p.role === "HOST");
            
            let assignedRole: Role = "PARTICIPANT";
            if (!hasActiveHost || room.hostId === socket.id) {
                room.hostId = socket.id;
                assignedRole = "HOST";
            }

            const participant: Participant = {
                socketId: socket.id,
                username,
                role: assignedRole,
            };

            room.participants.push(participant);

            socket.emit("sync_state", room);

            io.to(roomId).emit("user_joined", {
                participants: room.participants,
            });

            console.log(`${username} joined room ${roomId} as ${assignedRole}`);
        }
    );

    socket.on("leave_room", ({ roomId }: { roomId: string }) => {
        socket.leave(roomId);
        removeUserFromRoom(io, socket.id, roomId);
    });

    socket.on("disconnect", () => {
        for (const roomId in rooms) {
            removeUserFromRoom(io, socket.id, roomId);
        }
    });

    socket.on(
        "change_video",
        ({
            roomId,
            videoId,
        }: {
            roomId: string;
            videoId: string;
        }) => {

            const room = rooms[roomId];

            if (!room) return;

            const participant =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!canControlPlayback(participant)) {
                return;
            }

            room.currentVideoId = videoId;

            io.to(roomId).emit(
                "video_changed",
                {
                    videoId,
                }
            );
        }
    );



    socket.on(
        "play",
        ({ roomId }: { roomId: string }) => {

            const room = rooms[roomId];

            if (!room) return;

            const participant =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!canControlPlayback(participant)) {
                return;
            }

            socket.to(roomId).emit(
                "play_video"
            );
        }
    );




    socket.on(
        "pause",
        ({ roomId }: { roomId: string }) => {

            const room = rooms[roomId];

            if (!room) return;

            const participant =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!canControlPlayback(participant)) {
                return;
            }

            socket.to(roomId).emit(
                "pause_video"
            );
        }
    );



    socket.on(
        "seek",
        ({
            roomId,
            time,
        }: {
            roomId: string;
            time: number;
        }) => {

            const room = rooms[roomId];

            if (!room) return;

            const participant =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!canControlPlayback(participant)) {
                return;
            }

            socket.to(roomId).emit(
                "seek_video",
                {
                    time,
                }
            );
        }
    );

    socket.on(
        "sync_time",
        ({
            roomId,
            currentTime,
        }: {
            roomId: string;
            currentTime: number;
        }) => {

            const room = rooms[roomId];

            if (!room) return;

            const participant =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!canControlPlayback(participant)) {
                return;
            }

            socket.to(roomId).emit(
                "sync_time_update",
                {
                    currentTime,
                }
            );
        }
    );


    socket.on(
        "toggle_moderator",
        ({
            roomId,
            targetSocketId,
        }: {
            roomId: string;
            targetSocketId: string;
        }) => {

            const room = rooms[roomId];

            if (!room) return;

            const currentUser =
                room.participants.find(
                    (p) => p.socketId === socket.id
                );

            if (!isHost(currentUser)) {
                return;
            }

            const targetParticipant =
                room.participants.find(
                    (p) => p.socketId === targetSocketId
                );

            if (!targetParticipant) return;

            if (targetParticipant.role === "HOST") {
                return;
            }

            targetParticipant.role =
                targetParticipant.role === "MODERATOR"
                    ? "PARTICIPANT"
                    : "MODERATOR";

            io.to(roomId).emit(
                "roles_updated",
                {
                    participants: room.participants,
                }
            );
        }
    );

    socket.on(
        "remove_participant",
        ({
            roomId,
            targetSocketId,
        }: {
            roomId: string;
            targetSocketId: string;
        }) => {
            const room = rooms[roomId];
            if (!room) return;

            const currentUser = room.participants.find(
                (p) => p.socketId === socket.id
            );

            if (!isHost(currentUser)) {
                return;
            }

            const targetParticipant = room.participants.find(
                (p) => p.socketId === targetSocketId
            );

            if (!targetParticipant || targetParticipant.role === "HOST") {
                return;
            }

            const targetSocket = io.sockets.sockets.get(targetSocketId);
            if (targetSocket) {
                targetSocket.emit("kicked", { roomId });
                targetSocket.leave(roomId);
            }

            removeUserFromRoom(io, targetSocketId, roomId);
        }
    );


};