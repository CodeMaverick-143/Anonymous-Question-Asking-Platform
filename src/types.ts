export interface User {
  id: string;
  role: 'student' | 'teacher';
  anonymousName?: string;
  violations: number;
  silencedUntil?: Date;
  banned: boolean;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  username: string;
  timestamp: Date;
  reactions: { [emoji: string]: string[] };
}

export interface Poll {
  id: string;
  question: string;
  options: string[];
  votes: { [option: string]: string[] };
  createdBy: string;
  active: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  teacherId: string;
  messages: Message[];
  polls: Poll[];
  participants: User[];
}