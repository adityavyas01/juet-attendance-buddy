import React from 'react';
import { useStudent } from '@/contexts/StudentContext';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/Dashboard';

const Index = () => {
  const { state } = useStudent();

  return (
    <div className="min-h-screen">
      {state.isAuthenticated ? (
        <Dashboard />
      ) : (
        <LoginScreen />
      )}
    </div>
  );
};

export default Index;
