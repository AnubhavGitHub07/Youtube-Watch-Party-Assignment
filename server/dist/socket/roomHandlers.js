"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomHandlers = void 0;
const roomStore_1 = require("../rooms/roomStore");
const permissions_1 = require("../utils/permissions");
const removeUserFromRoom = (io, socketId, roomId) => {
    const room = roomStore_1.rooms[roomId];
    if (!room)
        return;
    const participantIndex = room.participants.findIndex((p) => p.socketId === socketId);
    if (participantIndex !== -1) {
        const removedParticipant = room.participants[participantIndex];
        room.participants.splice(participantIndex, 1);
        io.to(roomId).emit("user_left", {
            participants: room.participants,
        });
        console.log(`${removedParticipant.username} left room ${roomId}`);
        if (room.participants.length === 0) {
            delete roomStore_1.rooms[roomId];
        }
    }
};
const registerRoomHandlers = (io, socket) => {
    socket.on("join_room", ({ roomId, username, roomName, }) => {
        socket.join(roomId);
        let room = roomStore_1.rooms[roomId];
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
            roomStore_1.rooms[roomId] = room;
        }
        const participant = {
            socketId: socket.id,
            username,
            role: room.hostId === socket.id
                ? "HOST"
                : "PARTICIPANT",
        };
        room.participants.push(participant);
        socket.emit("sync_state", room);
        io.to(roomId).emit("user_joined", {
            participants: room.participants,
        });
        console.log(`${username} joined room ${roomId}`);
    });
    socket.on("leave_room", ({ roomId }) => {
        socket.leave(roomId);
        removeUserFromRoom(io, socket.id, roomId);
    });
    socket.on("disconnect", () => {
        for (const roomId in roomStore_1.rooms) {
            removeUserFromRoom(io, socket.id, roomId);
        }
    });
    socket.on("change_video", ({ roomId, videoId, }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.canControlPlayback)(participant)) {
            return;
        }
        room.currentVideoId = videoId;
        io.to(roomId).emit("video_changed", {
            videoId,
        });
    });
    socket.on("play", ({ roomId }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.canControlPlayback)(participant)) {
            return;
        }
        socket.to(roomId).emit("play_video");
    });
    socket.on("pause", ({ roomId }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.canControlPlayback)(participant)) {
            return;
        }
        socket.to(roomId).emit("pause_video");
    });
    socket.on("seek", ({ roomId, time, }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.canControlPlayback)(participant)) {
            return;
        }
        socket.to(roomId).emit("seek_video", {
            time,
        });
    });
    socket.on("sync_time", ({ roomId, currentTime, }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const participant = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.canControlPlayback)(participant)) {
            return;
        }
        socket.to(roomId).emit("sync_time_update", {
            currentTime,
        });
    });
    socket.on("toggle_moderator", ({ roomId, targetSocketId, }) => {
        const room = roomStore_1.rooms[roomId];
        if (!room)
            return;
        const currentUser = room.participants.find((p) => p.socketId === socket.id);
        if (!(0, permissions_1.isHost)(currentUser)) {
            return;
        }
        const targetParticipant = room.participants.find((p) => p.socketId === targetSocketId);
        if (!targetParticipant)
            return;
        if (targetParticipant.role === "HOST") {
            return;
        }
        targetParticipant.role =
            targetParticipant.role === "MODERATOR"
                ? "PARTICIPANT"
                : "MODERATOR";
        io.to(roomId).emit("roles_updated", {
            participants: room.participants,
        });
    });
};
exports.registerRoomHandlers = registerRoomHandlers;
