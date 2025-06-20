import { apiConfig } from '@/config/api.config';
import { Colors } from '@/constants/Colors';
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

// 기본 위치 (서울)
const DEFAULT_LOCATION = {
  latitude: 37.5666102,
  longitude: 126.9783881,
};

interface NaverMapProps {
  height?: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null; // m/s
  heading: number | null; // degrees (0-360)
}

interface VehicleData {
  id: string;
  latitude: number;
  longitude: number;
  speed: number; // m/s
  heading: number; // degrees (0-360)
  timestamp: string;
}

export default function NaverMap({ height = MAP_HEIGHT }: NaverMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [locationData, setLocationData] = useState<LocationData>({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    speed: null,
    heading: null,
  });
  const [isFirstLocationUpdate, setIsFirstLocationUpdate] = useState(true);
  const [camera, setCamera] = useState({
    latitude: DEFAULT_LOCATION.latitude,
    longitude: DEFAULT_LOCATION.longitude,
    zoom: 15,
    tilt: 0,
    bearing: 0,
  });
  const [nearbyVehicles, setNearbyVehicles] = useState<VehicleData[]>([]);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const vehicleUpdateInterval = useRef<number | null>(null);
  const mapRef = useRef<any>(null);

  // Mock 차량 데이터 생성 함수
  const generateMockVehicles = (centerLat: number, centerLng: number): VehicleData[] => {
    const vehicles: VehicleData[] = [];
    const vehicleCount = 5; // 5대의 차량 시뮬레이션
    
    for (let i = 0; i < vehicleCount; i++) {
      // 중심점에서 약 100-500m 반경 내 랜덤 위치
      const distance = (Math.random() * 400 + 100) / 111000; // degrees
      const angle = Math.random() * Math.PI * 2;
      
      vehicles.push({
        id: `vehicle_${i}`,
        latitude: centerLat + distance * Math.cos(angle),
        longitude: centerLng + distance * Math.sin(angle),
        speed: Math.random() * 16.67 + 5.56, // 20-60 km/h (5.56-16.67 m/s)
        heading: Math.random() * 360,
        timestamp: new Date().toISOString(),
      });
    }
    
    return vehicles;
  };

  // Mock 차량 데이터 업데이트 함수
  const updateMockVehicles = () => {
    setNearbyVehicles(prevVehicles => {
      return prevVehicles.map(vehicle => {
        // 각 차량을 조금씩 이동
        const speedInDegrees = vehicle.speed / 111000; // m/s to degrees/s
        const headingRad = (vehicle.heading * Math.PI) / 180;
        
        // 방향을 약간 변경 (±10도)
        const newHeading = (vehicle.heading + (Math.random() - 0.5) * 20 + 360) % 360;
        
        return {
          ...vehicle,
          latitude: vehicle.latitude + speedInDegrees * Math.sin(headingRad),
          longitude: vehicle.longitude + speedInDegrees * Math.cos(headingRad),
          heading: newHeading,
          speed: Math.max(5.56, Math.min(16.67, vehicle.speed + (Math.random() - 0.5) * 2)), // 속도 변화
          timestamp: new Date().toISOString(),
        };
      });
    });
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
          });
          
          // 초기 카메라 위치 설정
          setCamera({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            zoom: 15,
            tilt: 0,
            bearing: 0,
          });
        }
      } catch (error) {
        console.log('위치 가져오기 실패, 기본 위치 사용:', error);
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
          };
          
          setLocationData(newLocationData);
          
          // 처음 위치를 받을 때만 지도 중심 이동
          if (isFirstLocationUpdate) {
            setCamera({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              zoom: 16, // 적절한 축척으로 설정
              tilt: 0,
              bearing: 0,
            });
            setIsFirstLocationUpdate(false);
          }
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

  // Mock 모드에서 차량 데이터 시뮬레이션
  useEffect(() => {
    if (apiConfig.mode === 'mock' && !isLoading) {
      // 초기 차량 데이터 생성 (현재 위치 근처)
      const initialVehicles = generateMockVehicles(37.338861, 126.734563);
      setNearbyVehicles(initialVehicles);
      
      // 1초마다 차량 위치 업데이트
      vehicleUpdateInterval.current = setInterval(() => {
        updateMockVehicles();
      }, 1000);
    }
    
    return () => {
      if (vehicleUpdateInterval.current) {
        clearInterval(vehicleUpdateInterval.current);
      }
    };
  }, [isLoading]);

  // 속도를 km/h로 변환
  const getSpeedInKmh = (speedInMs: number | null): string => {
    if (speedInMs === null || speedInMs < 0) return '0';
    return (speedInMs * 3.6).toFixed(1);
  };

  // 방향을 나침반 방향으로 변환
  const getCompassDirection = (heading: number | null): string => {
    if (heading === null) return '-';
    
    const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
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
        isShowLocationButton={true}
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
                { transform: [{ rotate: `${locationData.heading || 0}deg` }] }
              ]}
              resizeMode="contain"
            />
          </View>
        </NaverMapMarkerOverlay>
        
        {/* Mock 차량 마커들 */}
        {apiConfig.mode === 'mock' && nearbyVehicles.map((vehicle) => (
          <NaverMapMarkerOverlay
            key={vehicle.id}
            latitude={vehicle.latitude}
            longitude={vehicle.longitude}
            width={25}
            height={25}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.vehicleMarkerContainer}>
              <Image
                source={require('@/assets/images/icon_car_2.png')}
                style={styles.vehicleIcon}
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
          <Text style={styles.infoValue}>{getSpeedInKmh(locationData.speed)} km/h</Text>
        </View>
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>방향</Text>
          <Text style={styles.infoValue}>{getCompassDirection(locationData.heading)}</Text>
        </View>
        {apiConfig.mode === 'mock' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>차량</Text>
            <Text style={styles.infoValue}>{nearbyVehicles.length}대</Text>
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