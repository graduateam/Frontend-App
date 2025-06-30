import { Colors } from '@/constants/Colors';
import { apiService } from '@/services/api';
import { CollisionWarning, LocationUpdateRequest, Person, Vehicle } from '@/types/api.types';
import { NaverMapMarkerOverlay, NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_WIDTH; // 정사각형 지도

// 기본 위치 (서울) - GPS 실패 시에만 사용
const DEFAULT_LOCATION = {
  latitude: 37.5666102,
  longitude: 126.9783881,
};

interface NaverMapProps {
  height?: number;
  onCollisionWarning?: (warning: CollisionWarning | null) => void; // 충돌 경고 콜백 추가
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null; // m/s
  heading: number | null; // degrees (0-360)
  accuracy: number;
}

export default function NaverMap({ height = MAP_HEIGHT, onCollisionWarning }: NaverMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    speed: null,
    heading: null,
    accuracy: 0,
  });
  const [camera, setCamera] = useState({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    zoom: 15,
    tilt: 0,
    bearing: 0,
  });
  const [nearbyVehicles, setNearbyVehicles] = useState<Vehicle[]>([]);
  const [nearbyPeople, setNearbyPeople] = useState<Person[]>([]);
  const [calculatedMotion, setCalculatedMotion] = useState({
    speed: 0,
    speed_kph: 0,
    heading: 0,
  });
  
  // ✅ useRef로 초기화 상태 관리 (컴포넌트 재렌더링과 독립적)
  const hasInitializedCamera = useRef(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const dataUpdateInterval = useRef<number | null>(null);
  const mapRef = useRef<any>(null);
  const deviceId = useRef<string>(`mobile_device_${Date.now()}`); // 고유 기기 ID

  // 통합 API를 통해 위치 정보 전송 및 주변 정보 가져오기
  const updateLocationData = async (latitude: number, longitude: number, accuracy: number) => {
    try {
      const locationUpdateRequest: LocationUpdateRequest = {
        device_id: deviceId.current,
        timestamp: new Date().toISOString(),
        location: {
          latitude,
          longitude,
          accuracy,
        },
        device_info: {
          device_type: 'mobile',
          app_version: '1.0.0',
        },
      };

      console.log('[NaverMap] 위치 업데이트 요청:', locationUpdateRequest);
      
      const response = await apiService.updateLocation(locationUpdateRequest);

      if (response.success) {
        console.log('[NaverMap] 위치 업데이트 성공:', response);
        
        // 서버에서 계산된 모션 정보 업데이트
        if (response.calculated_motion) {
          setCalculatedMotion({
            speed: response.calculated_motion.speed,
            speed_kph: response.calculated_motion.speed_kph,
            heading: response.calculated_motion.heading,
          });
        }

        // 주변 차량 정보 업데이트
        if (response.nearby_vehicles) {
          setNearbyVehicles(response.nearby_vehicles.vehicles);
        }

        // 주변 사람 정보 업데이트
        if (response.nearby_people) {
          setNearbyPeople(response.nearby_people.people);
        }

        // 충돌 경고 처리
        if (response.collision_warning && onCollisionWarning) {
          const warning = response.collision_warning.hasWarning 
            ? response.collision_warning.warning || null
            : null;
          onCollisionWarning(warning);
        }
      } else {
        console.error('[NaverMap] 위치 업데이트 실패:', response.message);
      }
    } catch (error) {
      console.error('[NaverMap] 위치 업데이트 오류:', error);
    }
  };

  // 위치 권한 요청 및 초기 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // 현재 위치 가져오기
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const newLocation = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          };
          
          setLocation(newLocation);
          setLocationData({
            ...newLocation,
            speed: currentLocation.coords.speed,
            heading: currentLocation.coords.heading,
            accuracy: currentLocation.coords.accuracy || 0,
          });
          
          // ✅ 초기 카메라 위치 설정 (현재 GPS 위치로 단 한 번만)
          if (!hasInitializedCamera.current) {
            console.log('[NaverMap] 초기 카메라 위치를 현재 GPS 위치로 설정');
            setCamera({
              latitude: currentLocation.coords.latitude,   // 실제 GPS 위치 사용
              longitude: currentLocation.coords.longitude, // 실제 GPS 위치 사용
              zoom: 16, // 적절한 축척으로 설정
              tilt: 0,
              bearing: 0,
            });
            hasInitializedCamera.current = true;
          }
        }
      } catch (error) {
        console.log('위치 가져오기 실패, 기본 위치 사용:', error);
        
        // ✅ GPS 실패 시에도 기본 위치로 카메라 초기화 (단 한 번만)
        if (!hasInitializedCamera.current) {
          console.log('[NaverMap] GPS 실패로 기본 위치로 카메라 설정');
          setCamera({
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
            zoom: 15,
            tilt: 0,
            bearing: 0,
          });
          hasInitializedCamera.current = true;
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 실시간 위치 추적
  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }

      // 실시간 위치 업데이트 구독
      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // 1초마다 업데이트
          distanceInterval: 1, // 1미터 이동 시 업데이트
        },
        (location) => {
          const newLocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            speed: location.coords.speed,
            heading: location.coords.heading,
            accuracy: location.coords.accuracy || 0,
          };
          
          setLocationData(newLocationData);
          
          // ✅ 카메라 초기화는 더 이상 하지 않음
          // 사용자가 수동으로 지도를 이동한 후에는 자동으로 따라가지 않음
        }
      );
    })();

    // 컴포넌트 언마운트 시 구독 해제
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, []);

  // 주기적으로 통합 API로 위치 정보 전송 및 데이터 업데이트
  useEffect(() => {
    if (!isLoading && locationData.latitude && locationData.longitude) {
      // 1초마다 통합 API 호출
      dataUpdateInterval.current = setInterval(() => {
        updateLocationData(
          locationData.latitude, 
          locationData.longitude, 
          locationData.accuracy
        );
      }, 1000);
    }
    
    return () => {
      if (dataUpdateInterval.current) {
        clearInterval(dataUpdateInterval.current);
      }
    };
  }, [isLoading, locationData.latitude, locationData.longitude, locationData.accuracy]);

  // ✅ 수동으로 내 위치로 이동하는 함수 (필요시 사용)
  const moveToMyLocation = () => {
    if (locationData.latitude && locationData.longitude) {
      console.log('[NaverMap] 사용자 요청으로 내 위치로 이동');
      setCamera({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        zoom: 16,
        tilt: 0,
        bearing: 0,
      });
    }
  };

  // 속도를 km/h로 변환 (서버 계산값 우선 사용)
  const getSpeedInKmh = (): string => {
    // 서버에서 계산된 속도가 있으면 사용
    if (calculatedMotion.speed_kph > 0) {
      return calculatedMotion.speed_kph.toFixed(1);
    }
    
    // GPS 속도 사용
    if (locationData.speed === null || locationData.speed < 0) return '0';
    return (locationData.speed * 3.6).toFixed(1);
  };

  // 방향을 나침반 방향으로 변환 (서버 계산값 우선 사용)
  const getCompassDirection = (): string => {
    let heading = calculatedMotion.heading > 0 ? calculatedMotion.heading : locationData.heading;
    
    if (heading === null) return '-';
    
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  };

  // 현재 사용할 방향값 (서버 계산값 우선)
  const getCurrentHeading = (): number => {
    return calculatedMotion.heading > 0 ? calculatedMotion.heading : (locationData.heading || 0);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { height }]}>
      <NaverMapView
        ref={mapRef}
        style={styles.map}
        camera={camera}
        isShowLocationButton={true}  // ✅ 네이버 지도 기본 위치 버튼 활성화
        isShowCompass={true}
        isShowScaleBar={true}
        isShowZoomControls={Platform.OS === 'android'}
        isNightModeEnabled={false}
      >
        {/* 현재 위치 마커 */}
        <NaverMapMarkerOverlay
          latitude={locationData.latitude}
          longitude={locationData.longitude}
          width={30}
          height={30}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View style={styles.markerContainer}>
            <Image
              source={require('@/assets/images/icon_triangle.png')}
              style={[
                styles.triangleIcon,
                { transform: [{ rotate: `${getCurrentHeading()}deg` }] }
              ]}
              resizeMode="contain"
            />
          </View>
        </NaverMapMarkerOverlay>
        
        {/* 주변 차량 마커들 */}
        {nearbyVehicles.map((vehicle) => (
          <NaverMapMarkerOverlay
            key={vehicle.id}
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            width={25}
            height={25}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.vehicleMarkerContainer,
              vehicle.is_collision_risk && styles.collisionRiskMarker
            ]}>
              <Image
                source={require('@/assets/images/icon_car_2.png')}
                style={[
                  styles.vehicleIcon,
                  { tintColor: vehicle.is_collision_risk ? Colors.primary.darkRed : Colors.primary.darkBlue }
                ]}
                resizeMode="contain"
              />
            </View>
          </NaverMapMarkerOverlay>
        ))}
        
        {/* 주변 사람 마커들 */}
        {nearbyPeople.map((person) => (
          <NaverMapMarkerOverlay
            key={person.id}
            latitude={person.latitude}
            longitude={person.longitude}
            width={25}
            height={25}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.personMarkerContainer,
              person.is_collision_risk && styles.collisionRiskMarker
            ]}>
              <Image
                source={require('@/assets/images/icon_user_2.png')}
                style={[
                  styles.personIcon,
                  { tintColor: person.is_collision_risk ? Colors.primary.darkRed : Colors.primary.darkYellow }
                ]}
                resizeMode="contain"
              />
            </View>
          </NaverMapMarkerOverlay>
        ))}
      </NaverMapView>

      {/* 속도 및 방향 정보 표시 */}
      <View style={styles.infoContainer}>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>속도</Text>
          <Text style={styles.infoValue}>{getSpeedInKmh()} km/h</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>방향</Text>
          <Text style={styles.infoValue}>{getCompassDirection()}</Text>
        </View>
        {nearbyVehicles.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>차량</Text>
            <Text style={styles.infoValue}>{nearbyVehicles.length}대</Text>
          </View>
        )}
        {nearbyPeople.length > 0 && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>사람</Text>
            <Text style={styles.infoValue}>{nearbyPeople.length}명</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteGradient.w5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
  },
  
  // 마커 스타일
  markerContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  triangleIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.primary.darkRed, // 진한 빨강색으로 변경
  },
  
  // 차량 마커 스타일
  vehicleMarkerContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleIcon: {
    width: 25,
    height: 25,
    tintColor: Colors.primary.darkBlue, // 진한 파란색
  },
  
  // 사람 마커 스타일
  personMarkerContainer: {
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  personIcon: {
    width: 25,
    height: 25,
    tintColor: Colors.primary.darkYellow, // 진한 노란색
  },
  
  // 충돌 위험 마커 강조
  collisionRiskMarker: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: Colors.primary.darkRed,
  },
  
  // 정보 표시
  infoContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 10,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
  },
});