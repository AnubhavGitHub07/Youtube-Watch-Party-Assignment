import { Server, Socket } from "socket.io";
import { rooms } from "../rooms/roomStore";
import { Participant, Room } from "../types/room.types";

const removeUserFromRoom = (io: Server, socketId: string, roomId: string) => {
    const room = rooms[roomId];
    if (!room) return;

    const participantIndex = room.participants.findIndex(
        (p) => p.socketId === socketId
    );

    if (participantIndex !== -1) {
        const removedParticipant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);

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
        }: {
            roomId: string;
            username: string;
        }) => {

            socket.join(roomId);

            let room = rooms[roomId];

            if (!room) {
                room = {
                    id: roomId,
                    hostId: socket.id,

                    currentVideoId: "",
                    currentTime: 0,
                    isPlaying: false,

                    participants: [],
                };

                rooms[roomId] = room;
            }

            const participant: Participant = {
                socketId: socket.id,
                username,
                role:
                    room.hostId === socket.id
                        ? "HOST"
                        : "PARTICIPANT",
            };

            room.participants.push(participant);

            socket.emit("sync_state", room);

            io.to(roomId).emit("user_joined", {
                participants: room.participants,
            });

            console.log(`${username} joined room ${roomId}`);
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
};