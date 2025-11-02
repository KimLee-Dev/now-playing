/**
 * Firestore 데이터베이스 서비스
 * - 음악 공유 데이터 생성 및 조회
 * - 실시간 데이터 동기화 (onSnapshot)
 * - Geohash 기반 위치 쿼리
 */

import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { MusicShare } from '../types';
import { getGeohashRange } from './geolocationService';

const MUSIC_SHARES_COLLECTION = 'musicShares';

/**
 * 새로운 음악 공유를 Firestore에 추가
 * @param musicShare 음악 공유 데이터 (id와 createdAt 제외)
 * @returns 생성된 문서의 ID
 */
export const addMusicShare = async (musicShare: Omit<MusicShare, 'id' | 'createdAt'>) => {
  try {
    const docRef = await addDoc(collection(db, MUSIC_SHARES_COLLECTION), {
      ...musicShare,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding music share:', error);
    throw error;
  }
};

/**
 * 주변 음악 공유 실시간 구독
 * onSnapshot을 사용하여 Firestore 데이터 변경사항을 실시간으로 수신
 * @param latitude 중심점 위도
 * @param longitude 중심점 경도
 * @param radiusInKm 검색 반경 (km)
 * @param callback 데이터 업데이트 시 호출될 콜백 함수
 * @returns unsubscribe 함수 (구독 취소)
 */
export const subscribeToNearbyShares = (
  latitude: number,
  longitude: number,
  radiusInKm: number,
  callback: (shares: MusicShare[]) => void
) => {
  // Geohash 범위 계산 (효율적인 Firestore 쿼리를 위해)
  const geohashRange = getGeohashRange(latitude, longitude, radiusInKm);

  // Firestore 쿼리 조건 설정
  const constraints: QueryConstraint[] = [
    where('location.geohash', '>=', geohashRange.lower),
    where('location.geohash', '<=', geohashRange.upper),
    orderBy('location.geohash'),
    orderBy('timestamp', 'desc'),
    limit(50),  // 최대 50개 결과
  ];

  const q = query(collection(db, MUSIC_SHARES_COLLECTION), ...constraints);

  // 실시간 리스너 등록
  return onSnapshot(q, (snapshot) => {
    const shares: MusicShare[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as MusicShare[];

    // Geohash는 근사치이므로, 실제 거리로 한 번 더 필터링
    const filteredShares = shares.filter((share) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        share.location.latitude,
        share.location.longitude
      );
      return distance <= radiusInKm;
    });

    callback(filteredShares);
  });
};

/**
 * Haversine 공식을 사용하여 두 좌표 간의 거리 계산
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 두 지점 사이의 거리 (km)
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 지구 반지름 (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * 도(degree)를 라디안(radian)으로 변환
 */
const toRad = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};
