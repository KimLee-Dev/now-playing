/**
 * Spotify 현재 재생 중인 곡 조회 엔드포인트
 * Vercel Serverless Function
 *
 * GET /api/spotify/currently-playing
 * Authorization: Bearer {accessToken}
 * - 사용자가 현재 듣고 있는 곡 정보 반환
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 현재 재생 중인 Spotify 트랙 가져오기
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Authorization 헤더에서 액세스 토큰 추출
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const accessToken = authHeader.substring(7);

  try {
    // Spotify API 호출: 현재 재생 중인 곡 조회
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 204) {
      // 204 No Content - 현재 재생 중인 곡이 없음
      return res.status(200).json({ isPlaying: false });
    }

    if (!response.ok) {
      const error = await response.text();
      console.error('Spotify API error:', error);
      return res.status(response.status).json({ error: 'Failed to get currently playing track' });
    }

    const data = await response.json();

    if (!data.item) {
      return res.status(200).json({ isPlaying: false });
    }

    // 트랙 정보를 클라이언트 친화적인 형태로 변환하여 반환
    res.status(200).json({
      isPlaying: data.is_playing,
      track: {
        id: data.item.id,
        name: data.item.name,
        artist: data.item.artists.map((a: any) => a.name).join(', '),
        album: data.item.album.name,
        albumArt: data.item.album.images[0]?.url,
        previewUrl: data.item.preview_url,
        externalUrl: data.item.external_urls.spotify,
      },
    });
  } catch (error) {
    console.error('Currently playing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
