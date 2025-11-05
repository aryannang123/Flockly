import { useState } from 'react';
import FlocklyLogin from './FlocklyLogin';
import FlocklyManagerHome from './FlocklyManagerHome';
import FlocklyUserHome from './FlocklyUserHome';

function App() {
  const [userType, setUserType] = useState(null);

  const handleLogin = (isManager) => {
    setUserType(isManager ? 'manager' : 'user');
  };

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
