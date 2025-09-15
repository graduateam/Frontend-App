import CollisionWarningComponent from '@/components/CollisionWarning';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import DetectedObjectsList from '@/components/DetectedObjectsList';
import MyPageSidebar from '@/components/MyPageSidebar';
import NaverMapView from '@/components/NaverMapView';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import SettingsSidebar from '@/components/SettingsSidebar';
import { apiConfig } from '@/config/api.config';
import { BRAND_COLOR, Colors, WHITE } from '@/constants/colors';
import { realTimeLocationService, LocationUpdateResult } from '@/services/RealTimeLocationService';
import { cctvCoverageService } from '@/services/CCTVCoverageService';
import { CollisionWarning, DetectedObject } from '@/types/smart-road-api.types';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = width; // 정사각형 지도

export default function MainScreen() {
  const [isMyPageVisible, setIsMyPageVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);
  const [isDeleteAccountVisible, setIsDeleteAccountVisible] = useState(false);
  
  // 충돌 경고 관련 state
  const [collisionWarning, setCollisionWarning] = useState<CollisionWarning | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const warningTimerRef = useRef<number | null>(null);
  
  // 🆕 감지된 객체 관련 state
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const [showObjectsList, setShowObjectsList] = useState(false);
  
  // 실시간 위치 추적 상태
  const [isLocationTracking, setIsLocationTracking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [cctvLoaded, setCctvLoaded] = useState(false);
  
  // API 모드 확인
  const isMockMode = apiConfig.mode === 'mock';
  const insets = useSafeAreaInsets();

  // 실시간 위치 추적 시작
  const startLocationTracking = async () => {
    try {
      setLocationError(null);
      console.log('🚀 실시간 위치 추적 시작...');
      
      const success = await realTimeLocationService.start();
      if (success) {
        setIsLocationTracking(true);
        console.log('✅ 실시간 위치 추적 시작됨');
      } else {
        throw new Error('위치 추적을 시작할 수 없습니다');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      console.error('❌ 위치 추적 시작 실패:', errorMessage);
      setLocationError(errorMessage);
      setIsLocationTracking(false);
    }
  };

  // 실시간 위치 추적 중지
  const stopLocationTracking = () => {
    console.log('⏹️ 실시간 위치 추적 중지...');
    realTimeLocationService.stop();
    setIsLocationTracking(false);
  };

  // CCTV 데이터 로드
  const loadCCTVData = async () => {
    try {
      console.log('📡 CCTV 데이터 로드...');
      await cctvCoverageService.loadCCTVCoverage();
      setCctvLoaded(true);
      console.log('✅ CCTV 데이터 로드 완료');
    } catch (error) {
      console.error('❌ CCTV 데이터 로드 실패:', error);
    }
  };

  // Mock 모드에서 테스트용 충돌 경고 생성
  const createTestCollisionWarning = () => {
    if (!isMockMode) return;
    
    const testWarning: CollisionWarning = {
      objectType: Math.random() > 0.5 ? 'vehicle' : 'person',
      relativeDirection: ['front', 'front-left', 'front-right', 'left', 'right'][Math.floor(Math.random() * 5)] as any,
      speed_kph: Math.random() * 20 + 5,
      distance: Math.random() * 30 + 10,
      ttc: Math.random() * 5 + 1,
      collisionProbability: Math.random() * 0.8 + 0.2,
      severity: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      timestamp: new Date().toISOString()
    };

    displayCollisionWarning(testWarning);
  };

  // 충돌 경고 표시
  const displayCollisionWarning = (warning: CollisionWarning) => {
    // 이전 타이머가 있으면 취소
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // 상태 업데이트
    setCollisionWarning(warning);
    setShowWarning(true);
    
    // 5초 후 자동 숨김
    warningTimerRef.current = setTimeout(() => {
      setShowWarning(false);
      setCollisionWarning(null);
      warningTimerRef.current = null;
    }, 5000);
  };

  // 컴포넌트 초기화
  useEffect(() => {
    console.log('🏗️ MainScreen 초기화...');
    
    // CCTV 데이터 최초 로드
    loadCCTVData();
    
    // 실시간 위치 추적 시작 (API 모드에서만)
    if (apiConfig.mode === 'api') {
      startLocationTracking();
    }

    // 실시간 위치 서비스 콜백 등록
    const handleLocationUpdate = (result: LocationUpdateResult) => {
      if (result.success && result.collisionWarning) {
        displayCollisionWarning(result.collisionWarning);
      }
      
      // 🆕 감지된 객체 정보 처리
      if (result.success && result.detectedObjects) {
        setDetectedObjects(result.detectedObjects);
        setShowObjectsList(result.detectedObjects.length > 0);
      }
    };

    const handleCollisionWarning = (warning: CollisionWarning) => {
      displayCollisionWarning(warning);
    };

    // 🆕 감지된 객체 콜백
    const handleDetectedObjects = (objects: DetectedObject[]) => {
      console.log('🎯 감지된 객체:', objects.length, '개');
      setDetectedObjects(objects);
      setShowObjectsList(objects.length > 0);
    };

    const handleLocationError = (error: string) => {
      // 에러 로그 제거 (네트워크 에러 팝업 방지)
      // console.error('위치 서비스 오류:', error);
      setLocationError(error);
    };

    // 콜백 등록
    realTimeLocationService.addLocationUpdateCallback(handleLocationUpdate);
    realTimeLocationService.addCollisionWarningCallback(handleCollisionWarning);
    realTimeLocationService.addDetectedObjectsCallback(handleDetectedObjects); // 🆕 추가
    realTimeLocationService.addErrorCallback(handleLocationError);

    // 정리 함수
    return () => {
      console.log('🧹 MainScreen 정리...');
      
      // 타이머 정리
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
      
      // 위치 추적 중지
      realTimeLocationService.stop();
      
      // 콜백 제거
      realTimeLocationService.removeLocationUpdateCallback(handleLocationUpdate);
      realTimeLocationService.removeCollisionWarningCallback(handleCollisionWarning);
      realTimeLocationService.removeDetectedObjectsCallback(handleDetectedObjects); // 🆕 추가
      realTimeLocationService.removeErrorCallback(handleLocationError);
    };
  }, []);

  // 키보드 이벤트 리스너 (웹에서 테스트용)
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      // 'W' 키를 누르면 충돌 경고 테스트 (mock 모드에서만)
      if ((event.key === 'w' || event.key === 'W') && isMockMode) {
        createTestCollisionWarning();
      }
      // 'S' 키를 누르면 위치 추적 시작/중지
      else if (event.key === 's' || event.key === 'S') {
        if (isLocationTracking) {
          stopLocationTracking();
        } else {
          startLocationTracking();
        }
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener('keypress', handleKeyPress);
      return () => {
        window.removeEventListener('keypress', handleKeyPress);
      };
    }
  }, [isMockMode, isLocationTracking]);

  const handleMyPage = () => {
    console.log('마이페이지 클릭');
    setIsMyPageVisible(true);
  };

  const handlePopup = () => {
    console.log('팝업 클릭');
    // TODO: 팝업 기능 구현
  };

  const handleSettings = () => {
    console.log('환경설정 클릭');
    setIsSettingsVisible(true);
  };
  
  // 도로 섹션 내용 컴포넌트
  const RoadSectionContent = () => {
    // 충돌 경고 이미지 위치 결정
    const getWarningImageStyle = () => {
      // showWarning 체크 추가
      if (!showWarning || !collisionWarning) return null;
      
      const direction = collisionWarning.relativeDirection;
      
      // 후방에서 접근하는 경우 이미지 표시 안함
      if (direction === 'rear') {
        return null;
      }
      
      let position: { left?: number; right?: number } = {};
      
      // 방향에 따른 위치 설정
      if (direction === 'front-left' || direction === 'left' || direction === 'rear-left') {
        // 왼쪽
        position = { left: width * -0.15 }; // 벽 이미지 너비를 고려
      } else if (direction === 'front-right' || direction === 'right' || direction === 'rear-right') {
        // 오른쪽
        position = { right: width * -0.15 }; // 벽 이미지 너비를 고려
      } else if (direction === 'front') {
        // 중앙
        position = { left: width / 2 - 120}; // 크기에 맞게 중앙 정렬
      } else {
        return null;
      }
      
      // 오른쪽에서 접근하는 경우 좌우반전 추가
      const isRightDirection = direction === 'front-right' || direction === 'right' || direction === 'rear-right';
      
      const imageStyle: any = {
        position: 'absolute' as const,
        bottom: 150,
        width: 240,
        height: 240,
        zIndex: 10, // 벽 이미지보다 위에 표시
        transform: isRightDirection ? [{ scaleX: -1 }] : undefined,
        ...position,
      };
      
      return imageStyle;
    };
    
    const warningImageStyle = getWarningImageStyle();
    
    return (
      <>
        {/* 배경 및 하단 어두운 영역 */}
        <View style={styles.backgroundContainer}>
          {/* 하단 어두운 네모 영역 */}
          <View style={styles.darkArea} />
        </View>
        
        {/* 충돌 경고 배경 이미지 (벽 이미지보다 아래 레이어) */}
        {showWarning && warningImageStyle && collisionWarning && (
          <Image
            source={require('@/assets/images/icon_car_3.png')} // 차량 탐지 전용 - 모든 객체를 차량으로 처리
            style={warningImageStyle}
            resizeMode="contain"
          />
        )}

        {/* 양측 벽 이미지 */}
        <Image
          source={require('@/assets/images/image_wall_1.png')}
          style={styles.leftWall}
          resizeMode="contain"
        />
        <Image
          source={require('@/assets/images/image_wall_2.png')}
          style={styles.rightWall}
          resizeMode="contain"
        />
        
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar backgroundColor={BRAND_COLOR} barStyle="light-content" translucent={false}/>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 상단 지도 영역 */}
        <View style={styles.mapSection}>
          <NaverMapView 
            height={MAP_HEIGHT} 
            collisionWarning={collisionWarning}
            detectedObjects={detectedObjects}
          />
        </View>

        {/* 하단 도로 배경 영역 */}
        {isMockMode ? (
          <TouchableOpacity 
            style={styles.roadSection}
            activeOpacity={1}
            onPress={createTestCollisionWarning}
          >
            <RoadSectionContent />
          </TouchableOpacity>
        ) : (
          <View style={styles.roadSection}>
            <RoadSectionContent />
          </View>
        )}
      </ScrollView>

      {/* 충돌 경고 표시 */}
      <CollisionWarningComponent
        warning={collisionWarning}
        visible={showWarning && !!collisionWarning}
      />


      {/* 🆕 감지된 객체 목록 표시 (지도에 마커로 표시되므로 비활성화) */}
      {/* <DetectedObjectsList 
        objects={detectedObjects}
        visible={showObjectsList && detectedObjects.length > 0}
      /> */}

      {/* 하단 네비게이션 버튼 (고정) */}
      <View style={[
        styles.bottomNavigation,
        { bottom: insets.bottom } // 시스템 네비게이션 바 높이만큼 올림
      ]}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={handleMyPage}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/icon_user.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
          <Text style={styles.navText}>마이페이지</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handlePopup}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/icon_minimize.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
          <Text style={styles.navText}>팝업</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Image
            source={require('@/assets/images/icon_settings.png')}
            style={styles.navIcon}
            resizeMode="contain"
          />
          <Text style={styles.navText}>환경설정</Text>
        </TouchableOpacity>
      </View>

      {/* 마이페이지 사이드바 */}
      <MyPageSidebar
        visible={isMyPageVisible}
        onClose={() => setIsMyPageVisible(false)}
        onPasswordChange={() => {
          setIsMyPageVisible(false);
          setIsPasswordChangeVisible(true);
        }}
        onDeleteAccount={() => {
          setIsMyPageVisible(false);
          setIsDeleteAccountVisible(true);
        }}
      />

      {/* 환경설정 사이드바 */}
      <SettingsSidebar
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
      />

      {/* 비밀번호 변경 모달 */}
      <PasswordChangeModal
        visible={isPasswordChangeVisible}
        onClose={() => setIsPasswordChangeVisible(false)}
      />
      
      {/* 회원탈퇴 모달 */}
      <DeleteAccountModal
        visible={isDeleteAccountVisible}
        onClose={() => setIsDeleteAccountVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLOR,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  
  // 지도 섹션
  mapSection: {
    width: width,
    height: MAP_HEIGHT,
    backgroundColor: Colors.whiteGradient.w5,
  },
  
  // 도로 섹션
  roadSection: {
    flex: 1,
    minHeight: height - MAP_HEIGHT - 100, // 지도 높이와 네비게이션 높이를 뺀 나머지
    backgroundColor: BRAND_COLOR,
    position: 'relative',
    overflow: 'hidden', // 애니메이션이 영역 밖으로 나가지 않도록
  },
  
  // 배경 및 하단 영역
  backgroundContainer: {
    flex: 1,
    position: 'relative',
  },
  darkArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200, // 고정 높이
    backgroundColor: Colors.blackGradient.b2,
  },
  
  // 양측 벽 이미지
  leftWall: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: width * 0.15,
    height: 250,
    zIndex: 20, // 충돌 경고 이미지보다 위
  },
  rightWall: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * 0.15,
    height: 250,
    zIndex: 20, // 충돌 경고 이미지보다 위
  },
  
  // 하단 네비게이션 (고정)
  bottomNavigation: {
    position: 'absolute',
    // bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 20, // Platform.OS === 'ios' ? 30 : 20, // 20으로 고정
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // 반투명 배경
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  navIcon: {
    width: 24,
    height: 24,
    tintColor: WHITE,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: WHITE,
  },
  
});