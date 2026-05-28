import { Participant } from "../types/room.types";

export const canControlPlayback = (
  participant?: Participant
) => {

  if (!participant) return false;

  return (
    participant.role === "HOST" ||
    participant.role === "MODERATOR"
  );
};

export const isHost = (
  participant?: Participant
) => {

  if (!participant) return false;

  return participant.role === "HOST";
};