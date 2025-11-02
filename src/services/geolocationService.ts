/**
 * 위치 서비스 (Geolocation + Geohash)
 * - 브라우저 Geolocation API를 사용한 위치 추적
 * - Geohash를 통한 위치 인코딩 및 효율적인 쿼리
 * - 실시간 위치 추적 (watchPosition)
 */

import geohash from 'ngeohash';
import type { Location } from '../types';

/**
 * 현재 사용자 위치 가져오기
 * Geolocation API를 사용하여 GPS 좌표 획득 후 Geohash로 인코딩
 * @returns Promise<Location> 위도, 경도, geohash 포함
 */
export const getCurrentLocation = (): Promise<Location> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        // Geohash 9자리: 약 5m 정밀도
        const hash = geohash.encode(latitude, longitude, 9);

        resolve({
          latitude,
          longitude,
          geohash: hash,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,  // GPS 사용하여 높은 정확도 요청
        timeout: 10000,             // 10초 타임아웃
        maximumAge: 0,              // 캐시된 위치 사용 안 함
      }
    );
  });
};

/**
 * 실시간 위치 추적
 * 사용자가 이동할 때마다 위치 업데이트 수신
 * @param callback 위치 업데이트 시 호출될 콜백 함수
 * @param errorCallback 에러 발생 시 호출될 콜백 함수
 * @returns watchId 추적을 중단할 때 사용할 ID
 */
export const watchLocation = (
  callback: (location: Location) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number => {
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const hash = geohash.encode(latitude, longitude, 9);

      callback({
        latitude,
        longitude,
        geohash: hash,
      });
    },
    errorCallback,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }
  );
};

/**
 * 위치 추적 중단
 * @param watchId watchLocation에서 반환된 ID
 */
export const stopWatchingLocation = (watchId: number): void => {
  navigator.geolocation.clearWatch(watchId);
};

/**
 * 주변 위치 검색을 위한 Geohash 범위 계산
 * Firestore에서 특정 반경 내의 항목을 효율적으로 쿼리하기 위해 사용
 * @param latitude 중심점 위도
 * @param longitude 중심점 경도
 * @param radiusInKm 검색 반경 (km)
 * @returns lower와 upper geohash 범위
 */
export const getGeohashRange = (
  latitude: number,
  longitude: number,
  radiusInKm: number
): { lower: string; upper: string } => {
  const lat = latitude;
  const lon = longitude;

  // 경계 박스(Bounding Box) 계산
  const latDelta = (radiusInKm / 111.32);  // 위도 1도 ≈ 111.32 km
  const lonDelta = (radiusInKm / (111.32 * Math.cos(lat * (Math.PI / 180))));

  const minLat = lat - latDelta;
  const maxLat = lat + latDelta;
  const minLon = lon - lonDelta;
  const maxLon = lon + lonDelta;

  // 경계 박스의 모서리 지점들을 geohash로 인코딩
  const lowerHash = geohash.encode(minLat, minLon, 9);
  const upperHash = geohash.encode(maxLat, maxLon, 9);

  return {
    lower: lowerHash,
    upper: upperHash,
  };
};

/**
 * Geohash를 좌표로 디코딩
 * @param hash Geohash 문자열
 * @returns 위도와 경도
 */
export const decodeGeohash = (hash: string): { latitude: number; longitude: number } => {
  const decoded = geohash.decode(hash);
  return {
    latitude: decoded.latitude,
    longitude: decoded.longitude,
  };
};
