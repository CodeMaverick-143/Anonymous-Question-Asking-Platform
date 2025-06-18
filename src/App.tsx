import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import AuthScreen from './components/AuthScreen';
import StudentDashboard from './components/StudentDashboard';
import TeacherDashboard from './components/TeacherDashboard';

const AppContent: React.FC = () => {
  const { user } = useApp();

  if (!user) {
    return <AuthScreen />;
  }

  if (user.role === 'student') {
    return <StudentDashboard />;
  }

  return <TeacherDashboard />;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;