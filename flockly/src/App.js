import { useState, useEffect } from 'react';
import FlocklyLogin from './FlocklyLogin';
import FlocklyManagerHome from './FlocklyManagerHome';
import FlocklyUserHome from './FlocklyUserHome';
import { authService } from './services/api';

function App() {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    checkAuth();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const userTypeParam = urlParams.get('userType');

    if (authStatus === 'success' && userTypeParam) {
      setUserType(userTypeParam);
      // Clean URL
      window.history.replaceState({}, document.title, '/');
    }
  }, []);

  const checkAuth = async () => {
    const response = await authService.getCurrentUser();
    if (response.success && response.user) {
      setUser(response.user);
      setUserType(response.user.userType);
    }
    setLoading(false);
  };

  const handleLogin = (isManager) => {
    setUserType(isManager ? 'manager' : 'user');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {userType === 'manager' ? (
        <FlocklyManagerHome />
      ) : userType === 'user' ? (
        <FlocklyUserHome />
      ) : (
        <FlocklyLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
