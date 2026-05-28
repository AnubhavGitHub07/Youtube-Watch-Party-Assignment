export type Role = "HOST" | "MODERATOR" | "PARTICIPANT";

export interface Participant {
  socketId: string;
  username: string;
  role: Role;
}

export interface Room {
  id: string;

  roomName: string;

  hostId: string;

  currentVideoId: string;
  currentTime: number;
  isPlaying: boolean;

  participants: Participant[];
}