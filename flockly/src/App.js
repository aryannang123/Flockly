// src/App.js
import { useState, useEffect } from 'react';
import FlocklyLogin from './FlocklyLogin';
import FlocklyManagerHome from './FlocklyManagerHome';
import FlocklyUserHome from './FlocklyUserHome';
import FlocklyQueryPage from './FlocklyQueryPage';
import FlocklyManagerQueries from './FlocklyManagerQueries'; // manager queries page
import ViewEvent from './components/ViewEvent';
import RegisterEvent from './components/RegisterEvent';
import { authService } from './services/api';

function App() {
  const [userType, setUserType] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    checkAuth();

    // Handle OAuth callback (if your app uses it)
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get('auth');
    const userTypeParam = urlParams.get('userType');

    if (authStatus === 'success' && userTypeParam) {
      setUserType(userTypeParam);
      // Clean URL params
      window.history.replaceState({}, document.title, '/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authService.getCurrentUser();
      if (response && response.success && response.user) {
        setUser(response.user);
        setUserType(response.user.userType);
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (isManager) => {
    setUserType(isManager ? 'manager' : 'user');
  };

  const handleViewEvent = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentView('viewEvent');
  };

  const handleRegisterEvent = (eventId) => {
    setSelectedEventId(eventId);
    setCurrentView('registerEvent');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedEventId(null);
  };

  const handleRegistrationSuccess = () => {
    setCurrentView('home');
    setSelectedEventId(null);
  };

  // Show spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  // If viewing an event
  if (currentView === 'viewEvent' && selectedEventId) {
    return (
      <ViewEvent
        eventId={selectedEventId}
        onBack={handleBackToHome}
        onRegister={handleRegisterEvent}
      />
    );
  }

  // If registering for an event
  if (currentView === 'registerEvent' && selectedEventId) {
    return (
      <RegisterEvent
        eventId={selectedEventId}
        onBack={handleBackToHome}
        onSuccess={handleRegistrationSuccess}
      />
    );
  }

  // Minimal path-based routing (no react-router)
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isQueryPath = pathname === '/query';
  const isManagerQueriesPath = pathname === '/manager/queries';

  return (
    <div>
      {userType === 'manager' ? (
        // Manager: show manager queries page when on /manager/queries, else manager home
        isManagerQueriesPath ? (
          <FlocklyManagerQueries />
        ) : (
          <FlocklyManagerHome />
        )
      ) : userType === 'user' ? (
        // User: show query page when on /query, else normal user home
        isQueryPath ? (
          <FlocklyQueryPage onViewEvent={handleViewEvent} />
        ) : (
          <FlocklyUserHome onViewEvent={handleViewEvent} />
        )
      ) : (
        <FlocklyLogin onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App;
