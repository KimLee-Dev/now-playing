export interface Location {
  latitude: number;
  longitude: number;
  geohash: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  previewUrl?: string;
  externalUrl: string;
}

export interface MusicShare {
  id: string;
  userId: string;
  username: string;
  track: SpotifyTrack;
  location: Location;
  timestamp: number;
  createdAt: Date;
}

export interface User {
  id: string;
  spotifyId: string;
  displayName: string;
  email?: string;
  profileImage?: string;
  accessToken: string;
  refreshToken: string;
  tokenExpiry: number;
}

export interface SpotifyAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

export interface SpotifyCurrentlyPlaying {
  item: {
    id: string;
    name: string;
    artists: Array<{ name: string }>;
    album: {
      name: string;
      images: Array<{ url: string }>;
    };
    preview_url?: string;
    external_urls: {
      spotify: string;
    };
  };
  is_playing: boolean;
}
