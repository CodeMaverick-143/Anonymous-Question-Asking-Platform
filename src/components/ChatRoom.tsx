import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  ArrowLeft, 
  Users, 
  Volume, 
  VolumeX, 
  Shield, 
  Clock,
  BarChart3,
  Smile,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTime, getTimeRemaining } from '../utils/helpers';

const ChatRoom: React.FC = () => {
  const [message, setMessage] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showModerationPanel, setShowModerationPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { 
    user, 
    currentRoom, 
    leaveRoom, 
    sendMessage, 
    silenceUser,
    addReaction,
    createPoll,
    votePoll
  } = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentRoom?.messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const success = sendMessage(message);
    if (success) {
      setMessage('');
    } else {
      alert('Message blocked due to inappropriate content or you are silenced.');
    }
  };

  const handleSilence = (userId: string, duration: number) => {
    silenceUser(userId, duration);
    setSelectedUser(null);
    setShowModerationPanel(false);
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim());
    if (!pollQuestion.trim() || validOptions.length < 2) return;
    
    createPoll(pollQuestion, validOptions);
    setPollQuestion('');
    setPollOptions(['', '']);
    setShowPollForm(false);
  };

  const reactions = ['👍', '👎', '❤️', '😂', '😮', '🤔'];

  const isUserSilenced = (userId: string) => {
    const participant = currentRoom?.participants.find(p => p.id === userId);
    return participant?.silencedUntil && new Date() < participant.silencedUntil;
  };

  if (!currentRoom) return null;

  const activePoll = currentRoom.polls.find(poll => poll.active);
  const currentUserSilenced = user && isUserSilenced(user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-white/20 p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={leaveRoom}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{currentRoom.name}</h1>
              <p className="text-sm text-gray-600">Room Code: {currentRoom.code}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {user?.role === 'teacher' && (
              <>
                <button
                  onClick={() => setShowPollForm(true)}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Poll</span>
                </button>
                <button
                  onClick={() => setShowModerationPanel(!showModerationPanel)}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Moderate</span>
                </button>
              </>
            )}
            <button
              onClick={() => setShowParticipants(!showParticipants)}
              className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Users className="w-4 h-4" />
              <span>{currentRoom.participants.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Active Poll */}
          {activePoll && (
            <div className="bg-green-50 border-b border-green-200 p-4">
              <div className="max-w-4xl mx-auto">
                <h3 className="font-semibold text-green-800 mb-3">{activePoll.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {activePoll.options.map((option, index) => {
                    const votes = activePoll.votes[option] || [];
                    const percentage = currentRoom.participants.length > 1 
                      ? Math.round((votes.length / (currentRoom.participants.length - 1)) * 100)
                      : 0;
                    const userVoted = user && votes.includes(user.id);
                    
                    return (
                      <button
                        key={index}
                        onClick={() => votePoll(activePoll.id, option)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          userVoted
                            ? 'bg-green-100 border-green-500'
                            : 'bg-white border-green-200 hover:border-green-400'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{option}</span>
                          <span className="text-sm text-gray-600">{votes.length} votes</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {currentRoom.messages.map((msg) => (
                <div key={msg.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {msg.username.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800">{msg.username}</span>
                      {user?.role === 'teacher' && (
                        <button
                          onClick={() => {
                            setSelectedUser(msg.userId);
                            setShowModerationPanel(true);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">{formatTime(msg.timestamp)}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{msg.content}</p>
                  
                  {/* Reactions */}
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      {reactions.map((emoji) => {
                        const reactionUsers = msg.reactions[emoji] || [];
                        const userReacted = user && reactionUsers.includes(user.id);
                        
                        return (
                          <button
                            key={emoji}
                            onClick={() => addReaction(msg.id, emoji)}
                            className={`px-2 py-1 rounded-lg text-sm transition-all ${
                              userReacted
                                ? 'bg-blue-100 border border-blue-300'
                                : 'bg-gray-100 hover:bg-gray-200 border border-transparent'
                            }`}
                          >
                            {emoji} {reactionUsers.length > 0 && reactionUsers.length}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <div className="bg-white/80 backdrop-blur-sm border-t border-white/20 p-4">
            <div className="max-w-4xl mx-auto">
              {currentUserSilenced ? (
                <div className="flex items-center justify-center space-x-2 text-red-600 py-3">
                  <VolumeX className="w-5 h-5" />
                  <span>You are silenced until {user?.silencedUntil && formatTime(user.silencedUntil)}</span>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Participants Sidebar */}
        {showParticipants && (
          <div className="w-80 bg-white/70 backdrop-blur-sm border-l border-white/20 p-4">
            <h3 className="font-semibold text-gray-800 mb-4">Participants ({currentRoom.participants.length})</h3>
            <div className="space-y-2">
              {currentRoom.participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {participant.anonymousName?.charAt(0) || 'T'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {participant.anonymousName}
                        {participant.role === 'teacher' && ' (Teacher)'}
                      </div>
                      {participant.violations > 0 && (
                        <div className="text-xs text-yellow-600">
                          {participant.violations} violation{participant.violations > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {participant.banned && <Ban className="w-4 h-4 text-red-500" />}
                    {isUserSilenced(participant.id) && <VolumeX className="w-4 h-4 text-orange-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Poll Creation Modal */}
      {showPollForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Create Poll</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
              <input
                type="text"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Enter your question"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Options</label>
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...pollOptions];
                    newOptions[index] = e.target.value;
                    setPollOptions(newOptions);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-2"
                  placeholder={`Option ${index + 1}`}
                />
              ))}
              <button
                onClick={() => setPollOptions([...pollOptions, ''])}
                className="text-blue-500 text-sm hover:text-blue-600"
              >
                + Add Option
              </button>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowPollForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePoll}
                className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Panel */}
      {showModerationPanel && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Moderate User</h3>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleSilence(selectedUser, 10)}
                className="w-full flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <span>Silence for 10 minutes</span>
                <Clock className="w-4 h-4 text-yellow-600" />
              </button>
              
              <button
                onClick={() => handleSilence(selectedUser, 20)}
                className="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <span>Silence for 20 minutes</span>
                <Clock className="w-4 h-4 text-orange-600" />
              </button>
              
              <button
                onClick={() => handleSilence(selectedUser, 30)}
                className="w-full flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <span>Silence for 30 minutes</span>
                <Clock className="w-4 h-4 text-red-600" />
              </button>
              
              <button
                onClick={() => handleSilence(selectedUser, 60)}
                className="w-full flex items-center justify-between p-3 bg-red-100 border border-red-300 rounded-lg hover:bg-red-200 transition-colors"
              >
                <span>Silence for 1 hour</span>
                <AlertTriangle className="w-4 h-4 text-red-700" />
              </button>
              
              <button
                onClick={() => handleSilence(selectedUser, 1440)}
                className="w-full flex items-center justify-between p-3 bg-red-200 border border-red-400 rounded-lg hover:bg-red-300 transition-colors"
              >
                <span>Silence for 24 hours</span>
                <Ban className="w-4 h-4 text-red-800" />
              </button>
            </div>

            <button
              onClick={() => {
                setSelectedUser(null);
                setShowModerationPanel(false);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;