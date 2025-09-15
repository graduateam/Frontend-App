import { Colors } from '@/constants/colors';
import { realTimeLocationService, LocationUpdateResult } from '@/services/RealTimeLocationService';
import { cctvCoverageService } from '@/services/CCTVCoverageService';
import { CollisionWarning, CCTV, DetectedObject } from '@/types/smart-road-api.types';
import { NaverMapMarkerOverlay, NaverMapView, NaverMapPolygonOverlay } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_WIDTH; // 정사각형 지도

// 기본 위치 (종합운동장_사거리 CCTV 영역)
const DEFAULT_LOCATION = {
  latitude: 37.67685,
  longitude: 126.7458,
};

interface NaverMapProps {
  height?: number;
  collisionWarning?: CollisionWarning | null;
  detectedObjects?: DetectedObject[];
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null; // m/s
  heading: number | null; // degrees (0-360)
}

export default function NaverMap({ height = MAP_HEIGHT, collisionWarning, detectedObjects = [] }: NaverMapProps) {
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
    zoom: 17, // CCTV 커버리지와 객체를 잘 볼 수 있도록 줌 레벨 증가
    tilt: 0,
    bearing: 0,
  });
  
  // 🎯 줌 레벨별 표시 제어
  const [currentZoom, setCurrentZoom] = useState(17);
  const ZOOM_THRESHOLD = 15.5; // 15.5배율 이상에서는 커버리지, 미만에서는 아이콘
  
  // CCTV 및 충돌 경고 관련 상태
  const [cctvCoverages, setCctvCoverages] = useState<CCTV[]>([]);
  const [isInCctvArea, setIsInCctvArea] = useState(false);
  const [currentLocationUpdate, setCurrentLocationUpdate] = useState<LocationUpdateResult | null>(null);
  
  // 🆕 위치 추적 모드 상태 관리
  const [isFollowingUser, setIsFollowingUser] = useState(true);
  const [isMapManuallyMoved, setIsMapManuallyMoved] = useState(false);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const mapRef = useRef<any>(null);
  // 폴리곤 ref들을 배열로 관리 (Hook 규칙 준수)
  const polygonRefs = useRef<Array<any>>([]);

  // CCTV 커버리지 데이터 로드
  const loadCCTVCoverage = async () => {
    try {
      const cctvs = await cctvCoverageService.loadCCTVCoverage();
      setCctvCoverages(cctvs);
      console.log('📡 지도에 CCTV 커버리지 로드 완료:', cctvs.length + '개');
    } catch (error) {
      console.error('❌ CCTV 커버리지 로드 실패:', error);
    }
  };

  // 현재 위치가 CCTV 커버리지 영역 내부인지 확인
  const checkCCTVCoverage = (currentLocation: LocationData) => {
    const locationForCheck = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      speed: currentLocation.speed || 0,
      heading: currentLocation.heading || 0,
      accuracy: 0,
      timestamp: Date.now()
    };
    const result = cctvCoverageService.isLocationInCoverage(locationForCheck);
    
    // 🎨 상태 변화 감지 및 색상 변경 로그
    const previousState = isInCctvArea;
    setIsInCctvArea(result.isInCoverage);

    if (previousState !== result.isInCoverage) {
      if (result.isInCoverage) {
        console.log('🟦 CCTV 영역 진입! 범위 색상이 파란색으로 변경됩니다.');
        console.log('📹 모니터링 CCTV:', result.coveringCCTVs.map(c => c.name).join(', '));
      } else {
        console.log('🟧 CCTV 영역 벗어남! 범위 색상이 주황색으로 변경됩니다.');
      }
    }
  };

  // 컴포넌트 초기화
  useEffect(() => {
    console.log('🗺️ NaverMapView 초기화...');
    
    // CCTV 커버리지 데이터 로드
    loadCCTVCoverage();
    
    // 위치 권한 요청 및 초기 위치 가져오기
    (async () => {
      try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // 현재 위치 가져오기
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const newLocationData = {
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            speed: currentLocation.coords.speed,
            heading: currentLocation.coords.heading,
          };
          
          setLocation({
            latitude: newLocationData.latitude,
            longitude: newLocationData.longitude,
          });
          setLocationData(newLocationData);
          
          // CCTV 커버리지 확인
          checkCCTVCoverage(newLocationData);
          
          // 초기 카메라 위치 설정
          const initialZoom = 17;
          setCamera({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
            zoom: initialZoom,
            tilt: 0,
            bearing: 0,
          });
          // 초기 줌 레벨도 동기화
          setCurrentZoom(initialZoom);
        }
      } catch (error) {
        console.log('위치 가져오기 실패, 기본 위치 사용:', error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 실시간 위치 서비스 연동
  useEffect(() => {
    console.log('📍 실시간 위치 서비스와 지도 연동...');
    
    // 위치 업데이트 콜백
    const handleLocationUpdate = (result: LocationUpdateResult) => {
      if (result.success && result.location) {
        const newLocationData = {
          latitude: result.location.latitude,
          longitude: result.location.longitude,
          speed: result.location.speed,
          heading: result.location.heading,
        };
        
        setLocationData(newLocationData);
        setCurrentLocationUpdate(result);
        
        // CCTV 커버리지 확인
        checkCCTVCoverage(newLocationData);
        
        // 🆕 항상 사용자 위치를 중심으로 지도 이동 (위치 추적 모드)
        const updateZoom = isFirstLocationUpdate ? 17 : currentZoom; // 첫 업데이트만 줌 레벨 17, 이후는 현재 줌 유지
        const newCameraPosition = {
          latitude: result.location.latitude,
          longitude: result.location.longitude,
          zoom: updateZoom,
          tilt: 0,
          bearing: result.location.heading || 0, // 사용자 방향에 따라 지도 회전
        };
        
        // 🎬 항상 카메라를 사용자 위치로 이동 (위치와 방향 추적)
        if (mapRef.current && !isFirstLocationUpdate) {
          // 위치 추적 중에는 부드러운 애니메이션 사용
          try {
            mapRef.current.animateCamera(newCameraPosition, {
              duration: 1000, // 1초 애니메이션
              easing: 'easeInOut', // 부드러운 easing
            });
          } catch (error) {
            console.log('애니메이션 실패, 기본 이동 사용:', error);
            setCamera(newCameraPosition);
          }
        } else {
          // 첫 위치 업데이트는 즉시 이동
          setCamera(newCameraPosition);
        }
        
        // 일반 위치 업데이트 (위치 추적 모드가 아닐 때)
        setLocation({
          latitude: result.location.latitude,
          longitude: result.location.longitude,
        });
        
        // 첫 업데이트에서만 줌 레벨 설정
        if (isFirstLocationUpdate) {
          setCurrentZoom(updateZoom);
          setIsFirstLocationUpdate(false);
        }
      }
    };

    // 콜백 등록
    realTimeLocationService.addLocationUpdateCallback(handleLocationUpdate);

    // 정리 함수
    return () => {
      console.log('🧹 지도 실시간 위치 서비스 연동 해제...');
      realTimeLocationService.removeLocationUpdateCallback(handleLocationUpdate);
    };
  }, [isFirstLocationUpdate, isFollowingUser, currentZoom]);


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

  // 🎯 위치 추적 모드 토글 함수
  // 🎯 현재 위치로 즉시 이동하는 함수
  const moveToCurrentLocation = useCallback(() => {
    if (locationData && mapRef.current) {
      const currentPosition = {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        zoom: currentZoom,
        tilt: 0,
        bearing: locationData.heading || 0,
      };
      
      try {
        mapRef.current.animateCamera(currentPosition, {
          duration: 800,
          easing: 'easeInOut',
        });
        console.log('🎯 현재 위치로 이동');
      } catch (error) {
        console.log('현재 위치 이동 실패:', error);
        setCamera(currentPosition);
      }
    }
  }, [locationData, currentZoom]);

  // 🆕 객체 타입에 따른 아이콘 선택
  const getObjectIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'vehicle':
        if (subtype === 'bus') return require('@/assets/images/icon_car_3.png');
        return require('@/assets/images/icon_car.png');
      case 'person': // 차량 탐지 전용 - 보행자도 차량 아이콘 사용
        return require('@/assets/images/icon_car.png');
      case 'bicycle':
        return require('@/assets/images/icon_car_2.png'); // 자전거 아이콘이 없어서 대체
      default:
        return require('@/assets/images/icon_car.png');
    }
  };

  // 🆕 충돌 위험도 기준 2단계 색상 (직관적인 빨강-초록 구분)
  const getObjectRiskColor = (riskLevel: string) => {
    // 위험한 상황 (critical, high) vs 안전한 상황 (medium, low, none)
    const isDangerous = riskLevel === 'critical' || riskLevel === 'high';
    
    if (isDangerous) {
      return '#FF3030'; // 위험: 선명한 빨강 (경고)
    } else {
      return '#228B22'; // 안전: 포레스트 그린 (안전함)
    }
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
        onCameraChanged={(args) => {
          // 🛡️ camera 정보 안전성 검사
          console.log('🔍 카메라 변경 이벤트:', args);
          if (args && typeof args.zoom === 'number') {
            console.log('🔍 현재 줌 레벨:', args.zoom, '| 임계값:', ZOOM_THRESHOLD);
            setCurrentZoom(args.zoom);
          } else if (args && args.camera && typeof args.camera.zoom === 'number') {
            console.log('🔍 현재 줌 레벨 (camera):', args.camera.zoom, '| 임계값:', ZOOM_THRESHOLD);
            setCurrentZoom(args.camera.zoom);
          }
          
          // 🎯 위치 추적이 항상 활성화되어 있으므로 수동 이동 감지 비활성화
        }}
      >
        {/* 🆕 CCTV 커버리지 영역 표시 - 줌 레벨에 따른 조건부 표시 */}
        {currentZoom >= ZOOM_THRESHOLD && cctvCoverages.map((cctv, index) => {
          // 백엔드 좌표를 그대로 사용 (GeoJSON 형식: [경도, 위도])
          const polygonCoords = cctv.coverage_area.coordinates[0].map(coord => ({
            latitude: coord[1],  // 위도
            longitude: coord[0]  // 경도
          }));
          
          // 🐛 디버깅: 좌표 확인
          if (cctv.cctv_id === 'cctv_001') {
            console.log('🗺️ CCTV 폴리곤 좌표:', polygonCoords.map((p, i) => 
              `${i+1}: 위도${p.latitude}, 경도${p.longitude}`
            ).join(' | '));
          }
          
          // 🎨 동적 색상 시스템: 사용자 위치에 따른 색상 변경
          const getPolygonColors = () => {
            if (isInCctvArea) {
              // 사용자가 CCTV 범위 안에 있을 때: 파란색 (모니터링 중)
              return {
                fillColor: "rgba(0, 123, 255, 0.25)",      // 투명도만 낮춘 파란색
                outlineColor: "rgba(0, 123, 255, 0.7)",    // 투명도 낮춘 파란색 테두리
                outlineWidth: 3                            // 더 두꺼운 테두리
              };
            } else {
              // 사용자가 CCTV 범위 밖에 있을 때: 주황색 (일반 상태)
              return {
                fillColor: "rgba(255, 127, 0, 0.3)",       // 기본 주황색
                outlineColor: "rgba(255, 127, 0, 0.8)",    // 주황색 테두리
                outlineWidth: 2                            // 일반 테두리
              };
            }
          };
          
          const colors = getPolygonColors();
          
          return (
            <NaverMapPolygonOverlay
              key={`polygon_${cctv.cctv_id}`}
              coords={polygonCoords}
              color={colors.fillColor}
              outlineColor={colors.outlineColor}
              outlineWidth={colors.outlineWidth}
            />
          );
        })}

        {/* CCTV 위치 마커들 - 줌 레벨에 따른 조건부 표시 */}
        {currentZoom < ZOOM_THRESHOLD && cctvCoverages.map((cctv) => (
          <NaverMapMarkerOverlay
            key={`marker_${cctv.cctv_id}`}
            latitude={cctv.location.latitude}
            longitude={cctv.location.longitude}
            width={30}
            height={30}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.cctvMarkerContainer}>
              <Text style={styles.cctvMarkerText}>📹</Text>
            </View>
          </NaverMapMarkerOverlay>
        ))}

        {/* 현재 위치 마커 */}
        <NaverMapMarkerOverlay
          latitude={locationData.latitude}
          longitude={locationData.longitude}
          width={35}
          height={35}
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

        {/* 충돌 경고 마커 (충돌 위험이 있을 때만 표시) */}
        {collisionWarning && (
          <NaverMapMarkerOverlay
            latitude={locationData.latitude}
            longitude={locationData.longitude}
            width={50}
            height={50}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.warningMarkerContainer}>
              <View style={styles.warningPulse} />
              <Image
                source={require('@/assets/images/icon_car_3.png')} // 차량 탐지 전용 - 모든 객체를 차량으로 처리
                style={styles.warningIcon}
                resizeMode="contain"
              />
            </View>
          </NaverMapMarkerOverlay>
        )}

        {/* 🆕 감지된 객체 마커들 - 작은 원형 (줌 레벨에 따른 조건부 표시) */}
        {currentZoom >= ZOOM_THRESHOLD && detectedObjects.map((obj) => (
          <NaverMapMarkerOverlay
            key={obj.id}
            latitude={obj.position.coordinates?.latitude || locationData.latitude}
            longitude={obj.position.coordinates?.longitude || locationData.longitude}
            width={18}
            height={18}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[
              styles.detectedObjectCircle,
              { backgroundColor: getObjectRiskColor(obj.risk_assessment.risk_level) }
            ]}>
              {/* 위험도가 높은 경우 펄스 효과 */}
              {(obj.risk_assessment.risk_level === 'high' || obj.risk_assessment.risk_level === 'critical') && (
                <View style={[
                  styles.detectedObjectPulse,
                  { borderColor: getObjectRiskColor(obj.risk_assessment.risk_level) }
                ]} />
              )}
            </View>
          </NaverMapMarkerOverlay>
        ))}
      </NaverMapView>

      {/* 🎯 위치 추적 버튼 (상시 표시) */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.returnToLocationButton}
          onPress={moveToCurrentLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.returnButtonIcon}>🎯</Text>
        </TouchableOpacity>
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
  
  // 마커 스타일 (항상 파란색으로 고정)
  markerContainer: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 100, 255, 0.1)',
    borderRadius: 17.5,
    borderWidth: 2,
    borderColor: Colors.primary.darkBlue,
  },
  triangleIcon: {
    width: 25,
    height: 25,
    tintColor: Colors.primary.darkBlue,
  },
  
  // CCTV 마커 스타일
  cctvMarkerContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 100, 255, 0.8)',
    borderRadius: 15,
  },
  cctvMarkerText: {
    fontSize: 14,
  },
  
  // 충돌 경고 마커 스타일
  warningMarkerContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 00, 0, 0.3)',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.6)',
  },
  warningIcon: {
    width: 30,
    height: 30,
    tintColor: Colors.primary.darkRed,
  },
  

  // 🆕 감지된 객체 마커 스타일 - 작은 원형
  detectedObjectCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  detectedObjectPulse: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    backgroundColor: 'transparent',
    opacity: 0.6,
    top: -4,
    left: -4,
  },

  // 🎯 위치 추적 복귀 버튼 스타일
  floatingButtonContainer: {
    position: 'absolute',
    right: 16,
    bottom: 20,
    alignItems: 'center',
  },
  returnToLocationButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E35500',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  returnButtonIcon: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E35500',
  },
});