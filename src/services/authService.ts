/**
 * Spotify 인증 서비스
 * - OAuth 2.0 플로우를 통한 사용자 인증
 * - Access Token 및 Refresh Token 관리
 * - 토큰 자동 갱신
 * - 로컬 스토리지를 통한 세션 유지
 */

import axios from 'axios';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

class AuthService {
  // 사용자 인증 정보
  private accessToken: string | null = null;       // Spotify API 호출에 사용되는 액세스 토큰
  private refreshToken: string | null = null;      // 액세스 토큰 갱신에 사용되는 리프레시 토큰
  private tokenExpiry: number | null = null;       // 액세스 토큰 만료 시간 (timestamp)
  private user: User | null = null;                // 사용자 정보

  constructor() {
    // 초기화 시 localStorage에서 인증 정보 로드
    this.loadFromStorage();
  }

  /**
   * localStorage에서 인증 정보 불러오기
   * 페이지 새로고침 시에도 로그인 상태 유지
   */
  private loadFromStorage() {
    const stored = localStorage.getItem('spotify_auth');
    if (stored) {
      const data = JSON.parse(stored);
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.tokenExpiry = data.tokenExpiry;
      this.user = data.user;
    }
  }

  /**
   * 현재 인증 정보를 localStorage에 저장
   * 브라우저를 닫아도 세션이 유지됨
   */
  private saveToStorage() {
    const data = {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry,
      user: this.user,
    };
    localStorage.setItem('spotify_auth', JSON.stringify(data));
  }

  /**
   * Spotify 로그인 시작
   * @returns Spotify 인증 페이지 URL
   */
  async login(): Promise<string> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/auth/login`);
      const { authUrl, state } = response.data;

      // CSRF 공격 방지를 위해 state 값을 세션에 저장
      sessionStorage.setItem('spotify_auth_state', state);

      return authUrl;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * OAuth 콜백 처리
   * Spotify에서 리다이렉트된 후 인증 코드를 토큰으로 교환
   * @param code - Spotify에서 받은 인증 코드
   * @returns 사용자 정보
   */
  async handleCallback(code: string): Promise<User> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/callback`, { code });
      const { accessToken, refreshToken, expiresIn, user } = response.data;

      // 토큰 및 사용자 정보 저장
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      const userWithTokens: User = {
        ...user,
        accessToken,
        refreshToken,
        tokenExpiry: this.tokenExpiry,
      };

      this.user = userWithTokens;

      this.saveToStorage();

      return userWithTokens;
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  }

  /**
   * 액세스 토큰 갱신
   * 만료된 액세스 토큰을 리프레시 토큰으로 재발급
   * @returns 새로운 액세스 토큰
   */
  async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
        refreshToken: this.refreshToken,
      });

      const { accessToken, expiresIn } = response.data;

      this.accessToken = accessToken;
      this.tokenExpiry = Date.now() + expiresIn * 1000;

      if (this.user) {
        this.user.accessToken = accessToken;
        this.user.tokenExpiry = this.tokenExpiry;
      }

      this.saveToStorage();

      return accessToken;
    } catch (error) {
      console.error('Refresh token error:', error);
      this.logout();
      throw error;
    }
  }

  /**
   * 유효한 액세스 토큰 가져오기
   * 만료가 임박하면 자동으로 토큰 갱신
   * @returns 유효한 액세스 토큰
   */
  async getValidAccessToken(): Promise<string> {
    if (!this.accessToken || !this.tokenExpiry) {
      throw new Error('Not authenticated');
    }

    // 토큰이 5분 이내에 만료되면 자동으로 갱신
    if (Date.now() > this.tokenExpiry - 5 * 60 * 1000) {
      return await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  /**
   * 로그아웃
   * 모든 인증 정보를 제거
   */
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    this.user = null;
    localStorage.removeItem('spotify_auth');
  }

  /**
   * 인증 상태 확인
   * @returns 인증 여부
   */
  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.tokenExpiry && Date.now() < this.tokenExpiry;
  }

  /**
   * 현재 사용자 정보 가져오기
   * @returns 사용자 정보 또는 null
   */
  getUser(): User | null {
    return this.user;
  }

  /**
   * 현재 액세스 토큰 가져오기
   * @returns 액세스 토큰 또는 null
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }
}

// AuthService 싱글톤 인스턴스
export const authService = new AuthService();
