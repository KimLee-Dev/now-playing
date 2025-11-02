/**
 * Spotify OAuth 콜백 엔드포인트
 * Vercel Serverless Function
 *
 * POST /api/auth/callback
 * - 인증 코드를 액세스 토큰으로 교환
 * - 사용자 프로필 정보 가져오기
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback';

/**
 * OAuth 콜백 처리 - 인증 코드를 토큰으로 교환
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Missing authorization code' });
  }

  try {
    // Spotify에 액세스 토큰 요청
    // Basic Auth 사용 (Client ID:Client Secret을 Base64 인코딩)
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Spotify token error:', error);
      return res.status(tokenResponse.status).json({ error: 'Failed to get access token' });
    }

    const tokenData = await tokenResponse.json();

    // 사용자 프로필 정보 가져오기
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      return res.status(profileResponse.status).json({ error: 'Failed to get user profile' });
    }

    const profileData = await profileResponse.json();

    // 액세스 토큰, 리프레시 토큰, 사용자 정보 반환
    res.status(200).json({
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      user: {
        id: profileData.id,
        displayName: profileData.display_name,
        email: profileData.email,
        profileImage: profileData.images?.[0]?.url,
      },
    });
  } catch (error) {
    console.error('Auth callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
