import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocation } from '../hooks/useLocation';
import { useNearbyShares } from '../hooks/useNearbyShares';
import { getCurrentlyPlaying } from '../services/spotifyService';
import { addMusicShare } from '../services/firestoreService';
import type { SpotifyTrack } from '../types';

export const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { location, error: locationError, loading: locationLoading } = useLocation(true);
  const { shares, loading: sharesLoading } = useNearbyShares(location, 5);
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCurrentTrack = async () => {
      try {
        const { isPlaying, track } = await getCurrentlyPlaying();
        if (isPlaying && track) {
          setCurrentTrack(track);
        } else {
          setCurrentTrack(null);
        }
      } catch (error) {
        console.error('Error fetching current track:', error);
      }
    };

    fetchCurrentTrack();
    const interval = setInterval(fetchCurrentTrack, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleShare = async () => {
    if (!location || !currentTrack || !user) return;

    setSharing(true);
    try {
      await addMusicShare({
        userId: user.id,
        username: user.displayName,
        track: currentTrack,
        location,
        timestamp: Date.now(),
      });
      alert('Music shared successfully!');
    } catch (error) {
      console.error('Error sharing music:', error);
      alert('Failed to share music');
    } finally {
      setSharing(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <header>
        <h1>Spotify Location Share</h1>
        <div className="user-info">
          {user?.profileImage && <img src={user.profileImage} alt={user.displayName} />}
          <span>{user?.displayName}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        <section className="current-track">
          <h2>Currently Playing</h2>
          {currentTrack ? (
            <div className="track-card">
              <img src={currentTrack.albumArt} alt={currentTrack.album} />
              <div className="track-info">
                <h3>{currentTrack.name}</h3>
                <p>{currentTrack.artist}</p>
                <p className="album">{currentTrack.album}</p>
              </div>
              <button onClick={handleShare} disabled={!location || sharing}>
                {sharing ? 'Sharing...' : 'Share Location'}
              </button>
            </div>
          ) : (
            <p>No track currently playing</p>
          )}
        </section>

        <section className="location">
          <h2>Your Location</h2>
          {locationLoading ? (
            <p>Getting location...</p>
          ) : locationError ? (
            <p className="error">{locationError}</p>
          ) : location ? (
            <p>
              Lat: {location.latitude.toFixed(4)}, Lon: {location.longitude.toFixed(4)}
            </p>
          ) : null}
        </section>

        <section className="nearby-shares">
          <h2>Nearby Shares (5km radius)</h2>
          {sharesLoading ? (
            <p>Loading nearby shares...</p>
          ) : shares.length === 0 ? (
            <p>No nearby shares found</p>
          ) : (
            <div className="shares-grid">
              {shares.map((share) => (
                <div key={share.id} className="share-card">
                  <img src={share.track.albumArt} alt={share.track.album} />
                  <div className="share-info">
                    <h4>{share.track.name}</h4>
                    <p>{share.track.artist}</p>
                    <p className="username">Shared by {share.username}</p>
                    <p className="time">{new Date(share.timestamp).toLocaleString()}</p>
                    <a href={share.track.externalUrl} target="_blank" rel="noopener noreferrer">
                      Listen on Spotify
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
