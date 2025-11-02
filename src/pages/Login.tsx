import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
      alert('Failed to login. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Spotify Location Share</h1>
        <p>Share your music with people nearby</p>
        <button onClick={handleLogin} className="login-button">
          Login with Spotify
        </button>
      </div>
    </div>
  );
};
