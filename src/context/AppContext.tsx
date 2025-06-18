import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Room, Message, Poll } from '../types';
import { generateAnonymousName, checkProfanity } from '../utils/helpers';

interface AppContextType {
  user: User | null;
  currentRoom: Room | null;
  login: (role: 'student' | 'teacher', username?: string) => void;
  logout: () => void;
  createRoom: (name: string) => string;
  joinRoom: (code: string) => boolean;
  leaveRoom: () => void;
  sendMessage: (content: string) => boolean;
  silenceUser: (userId: string, duration: number) => void;
  addReaction: (messageId: string, emoji: string) => void;
  createPoll: (question: string, options: string[]) => void;
  votePoll: (pollId: string, option: string) => void;
  rooms: Room[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const login = (role: 'student' | 'teacher', username?: string) => {
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      role,
      anonymousName: role === 'student' ? generateAnonymousName() : username,
      violations: 0,
      banned: false,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
    setCurrentRoom(null);
  };

  const createRoom = (name: string): string => {
    if (!user || user.role !== 'teacher') return '';
    
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const newRoom: Room = {
      id: Math.random().toString(36).substr(2, 9),
      code,
      name,
      teacherId: user.id,
      messages: [],
      polls: [],
      participants: [user],
    };
    
    setRooms(prev => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    return code;
  };

  const joinRoom = (code: string): boolean => {
    if (!user) return false;
    
    const room = rooms.find(r => r.code === code);
    if (!room) return false;
    
    if (user.banned) return false;
    
    const updatedRoom = {
      ...room,
      participants: room.participants.find(p => p.id === user.id) 
        ? room.participants 
        : [...room.participants, user]
    };
    
    setRooms(prev => prev.map(r => r.id === room.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
    return true;
  };

  const leaveRoom = () => {
    setCurrentRoom(null);
  };

  const sendMessage = (content: string): boolean => {
    if (!user || !currentRoom || user.banned) return false;
    
    if (user.silencedUntil && new Date() < user.silencedUntil) {
      return false;
    }
    
    if (checkProfanity(content)) {
      // Increment violations for profanity
      const updatedUser = { ...user, violations: user.violations + 1 };
      setUser(updatedUser);
      return false;
    }
    
    const message: Message = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      userId: user.id,
      username: user.anonymousName || 'Anonymous',
      timestamp: new Date(),
      reactions: {},
    };
    
    const updatedRoom = {
      ...currentRoom,
      messages: [...currentRoom.messages, message],
    };
    
    setRooms(prev => prev.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
    return true;
  };

  const silenceUser = (userId: string, duration: number) => {
    if (!user || user.role !== 'teacher' || !currentRoom) return;
    
    const targetUser = currentRoom.participants.find(p => p.id === userId);
    if (!targetUser) return;
    
    const silencedUntil = new Date(Date.now() + duration * 60 * 1000);
    const newViolations = targetUser.violations + 1;
    
    // Auto-ban rule: 4 times silenced for 20+ minutes
    const shouldBan = newViolations >= 4 && duration >= 20;
    
    const updatedUser = {
      ...targetUser,
      violations: newViolations,
      silencedUntil,
      banned: shouldBan,
    };
    
    const updatedParticipants = currentRoom.participants.map(p => 
      p.id === userId ? updatedUser : p
    );
    
    const updatedRoom = {
      ...currentRoom,
      participants: updatedParticipants,
    };
    
    setRooms(prev => prev.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
  };

  const addReaction = (messageId: string, emoji: string) => {
    if (!user || !currentRoom) return;
    
    const updatedMessages = currentRoom.messages.map(msg => {
      if (msg.id === messageId) {
        const reactions = { ...msg.reactions };
        if (!reactions[emoji]) reactions[emoji] = [];
        
        const userIndex = reactions[emoji].indexOf(user.id);
        if (userIndex > -1) {
          reactions[emoji].splice(userIndex, 1);
          if (reactions[emoji].length === 0) delete reactions[emoji];
        } else {
          reactions[emoji].push(user.id);
        }
        
        return { ...msg, reactions };
      }
      return msg;
    });
    
    const updatedRoom = { ...currentRoom, messages: updatedMessages };
    setRooms(prev => prev.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
  };

  const createPoll = (question: string, options: string[]) => {
    if (!user || user.role !== 'teacher' || !currentRoom) return;
    
    const poll: Poll = {
      id: Math.random().toString(36).substr(2, 9),
      question,
      options,
      votes: {},
      createdBy: user.id,
      active: true,
    };
    
    const updatedRoom = {
      ...currentRoom,
      polls: [...currentRoom.polls, poll],
    };
    
    setRooms(prev => prev.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
  };

  const votePoll = (pollId: string, option: string) => {
    if (!user || !currentRoom) return;
    
    const updatedPolls = currentRoom.polls.map(poll => {
      if (poll.id === pollId && poll.active) {
        const votes = { ...poll.votes };
        
        // Remove user's previous vote
        Object.keys(votes).forEach(opt => {
          votes[opt] = votes[opt].filter(id => id !== user.id);
          if (votes[opt].length === 0) delete votes[opt];
        });
        
        // Add new vote
        if (!votes[option]) votes[option] = [];
        votes[option].push(user.id);
        
        return { ...poll, votes };
      }
      return poll;
    });
    
    const updatedRoom = { ...currentRoom, polls: updatedPolls };
    setRooms(prev => prev.map(r => r.id === currentRoom.id ? updatedRoom : r));
    setCurrentRoom(updatedRoom);
  };

  return (
    <AppContext.Provider value={{
      user,
      currentRoom,
      login,
      logout,
      createRoom,
      joinRoom,
      leaveRoom,
      sendMessage,
      silenceUser,
      addReaction,
      createPoll,
      votePoll,
      rooms,
    }}>
      {children}
    </AppContext.Provider>
  );
};