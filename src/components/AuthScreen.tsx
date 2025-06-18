import React, { useState } from 'react';
import { GraduationCap, Users, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const AuthScreen: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);
  const [teacherName, setTeacherName] = useState('');
  const { login } = useApp();

  const handleLogin = () => {
    if (!selectedRole) return;
    
    if (selectedRole === 'teacher' && !teacherName.trim()) {
      return;
    }
    
    login(selectedRole, selectedRole === 'teacher' ? teacherName : undefined);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Anonymous Q&A
          </h1>
          <p className="text-gray-600 mt-2">
            Safe space for questions and discussions
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Choose your role
          </h2>

          <div className="space-y-4 mb-6">
            <button
              onClick={() => setSelectedRole('student')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                selectedRole === 'student'
                  ? 'bg-blue-50 border-blue-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
              }`}
            >
              <Users className="w-6 h-6 text-blue-500" />
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Student</div>
                <div className="text-sm text-gray-600">Ask questions anonymously</div>
              </div>
            </button>

            <button
              onClick={() => setSelectedRole('teacher')}
              className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                selectedRole === 'teacher'
                  ? 'bg-purple-50 border-purple-500 shadow-md'
                  : 'bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <GraduationCap className="w-6 h-6 text-purple-500" />
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-800">Teacher</div>
                <div className="text-sm text-gray-600">Moderate and create rooms</div>
              </div>
            </button>
          </div>

          {selectedRole === 'teacher' && (
            <div className="mb-6">
              <input
                type="text"
                placeholder="Enter your name"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={!selectedRole || (selectedRole === 'teacher' && !teacherName.trim())}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;