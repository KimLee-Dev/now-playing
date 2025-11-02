/**
 * Spotify OAuth 로그인 엔드포인트
 * Vercel Serverless Function
 *
 * GET /api/auth/login
 * - Spotify 인증 URL 생성
 * - CSRF 방지용 state 값 생성
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

// Spotify API 사용 권한 스코프
const SCOPES = [
  'user-read-currently-playing',  // 현재 재생 중인 곡 읽기
  'user-read-playback-state',     // 재생 상태 읽기
  'user-read-email',              // 이메일 읽기
  'user-read-private',            // 프로필 정보 읽기
].join(' ');

/**
 * Spotify OAuth 로그인 URL 생성
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CSRF 공격 방지를 위한 랜덤 state 생성
  const state = generateRandomString(16);

  // Spotify 인증 URL 구성
  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', SPOTIFY_CLIENT_ID!);
  authUrl.searchParams.append('scope', SCOPES);
  authUrl.searchParams.append('redirect_uri', SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.append('state', state);

  res.status(200).json({ authUrl: authUrl.toString(), state });
}

/**
 * 랜덤 문자열 생성 (CSRF state 용)
 */
function generateRandomString(length: number): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
