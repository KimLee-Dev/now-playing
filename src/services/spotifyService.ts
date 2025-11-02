import axios from 'axios';
import type { SpotifyTrack } from '../types';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const getCurrentlyPlaying = async (): Promise<{ isPlaying: boolean; track?: SpotifyTrack }> => {
  try {
    const accessToken = await authService.getValidAccessToken();

    const response = await axios.get(`${API_BASE_URL}/api/spotify/currently-playing`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting currently playing track:', error);
    throw error;
  }
};
