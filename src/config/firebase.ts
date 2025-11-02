/**
 * Firebase 설정 및 초기화
 * - Firestore 데이터베이스 인스턴스를 생성하고 export
 * - 환경 변수에서 Firebase 설정 정보를 가져옴
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 프로젝트 설정
// .env 파일의 환경 변수에서 값을 가져옴
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Firebase 앱 초기화
const app = initializeApp(firebaseConfig);

// Firestore 데이터베이스 인스턴스 생성
// 이 인스턴스를 통해 실시간 데이터 읽기/쓰기 작업 수행
export const db = getFirestore(app);

export default app;
