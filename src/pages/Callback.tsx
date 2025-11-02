import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Callback = () => {
  const navigate = useNavigate();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('Auth error:', error);
        alert('Authentication failed');
        navigate('/');
        return;
      }

      if (!code) {
        navigate('/');
        return;
      }

      try {
        await handleCallback(code);
        navigate('/');
      } catch (error) {
        console.error('Callback error:', error);
        alert('Authentication failed');
        navigate('/');
      }
    };

    handleAuth();
  }, [handleCallback, navigate]);

  return (
    <div className="callback-container">
      <p>Authenticating...</p>
    </div>
  );
};
