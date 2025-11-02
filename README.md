# Spotify Location Share

실시간 위치 기반 음악 공유 애플리케이션

## 기술 스택

- **프론트엔드**: React + Vite + TypeScript
- **인증**: Vercel Serverless Functions + Spotify OAuth
- **실시간 DB**: Firebase Firestore (onSnapshot)
- **위치**: Geolocation API + Geohash
- **배포**: Vercel

## 프로젝트 구조

```
spotify-location-share/
├── api/                          # Vercel Serverless Functions
│   ├── auth/
│   │   ├── login.ts             # Spotify OAuth 로그인 시작
│   │   ├── callback.ts          # OAuth 콜백 처리
│   │   └── refresh.ts           # 토큰 갱신
│   └── spotify/
│       └── currently-playing.ts # 현재 재생 중인 곡 가져오기
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase 설정
│   ├── services/
│   │   ├── authService.ts       # 인증 서비스
│   │   ├── spotifyService.ts    # Spotify API 서비스
│   │   ├── firestoreService.ts  # Firestore 데이터 관리
│   │   └── geolocationService.ts # 위치 서비스
│   ├── hooks/
│   │   ├── useAuth.ts           # 인증 훅
│   │   ├── useLocation.ts       # 위치 훅
│   │   └── useNearbyShares.ts   # 주변 공유 음악 훅
│   ├── pages/
│   │   ├── Login.tsx            # 로그인 페이지
│   │   ├── Home.tsx             # 메인 페이지
│   │   └── Callback.tsx         # OAuth 콜백 페이지
│   ├── types/
│   │   └── index.ts             # TypeScript 타입 정의
│   ├── App.tsx                  # 메인 앱 컴포넌트
│   └── App.css                  # 스타일
├── .env.example                 # 환경 변수 예시
├── vercel.json                  # Vercel 설정
└── package.json
```

## 셋업 가이드

### 1. 환경 변수 설정

`.env.example`을 `.env`로 복사하고 다음 값들을 설정하세요:

#### Firebase 설정
1. [Firebase Console](https://console.firebase.google.com/)에서 프로젝트 생성
2. Firestore Database 생성 (테스트 모드로 시작)
3. 프로젝트 설정에서 Firebase 구성 정보 복사

#### Spotify OAuth 설정
1. [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)에서 앱 생성
2. Redirect URIs 추가:
   - 개발: `http://localhost:5173/callback`
   - 프로덕션: `https://your-domain.vercel.app/callback`
3. Client ID와 Client Secret 복사

### 2. Firestore 보안 규칙 설정

Firebase Console에서 Firestore 보안 규칙 설정 (firestore.rules 참고)

### 3. 로컬 개발 실행

```bash
npm install
npm run dev
```

### 4. Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### Vercel 환경 변수 설정
Vercel Dashboard에서 다음 환경 변수들을 설정하세요:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `VITE_SPOTIFY_REDIRECT_URI`
- `VITE_API_BASE_URL`

## 주요 기능

### 1. Spotify OAuth 인증
- Vercel Serverless Functions를 통한 안전한 OAuth 플로우
- Access Token 자동 갱신
- 로컬 스토리지 기반 세션 관리

### 2. 실시간 위치 추적
- Geolocation API로 현재 위치 가져오기
- Geohash로 위치 인덱싱
- 실시간 위치 업데이트

### 3. 음악 공유
- 현재 재생 중인 Spotify 곡 가져오기
- 위치와 함께 Firestore에 저장
- 5km 반경 내 공유된 음악 실시간 조회

### 4. 실시간 동기화
- Firestore onSnapshot으로 실시간 데이터 동기화
- Geohash 범위 쿼리로 효율적인 위치 기반 검색
