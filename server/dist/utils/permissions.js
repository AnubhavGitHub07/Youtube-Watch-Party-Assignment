"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHost = exports.canControlPlayback = void 0;
const canControlPlayback = (participant) => {
    if (!participant)
        return false;
    return (participant.role === "HOST" ||
        participant.role === "MODERATOR");
};
exports.canControlPlayback = canControlPlayback;
const isHost = (participant) => {
    if (!participant)
        return false;
    return participant.role === "HOST";
};
exports.isHost = isHost;
