import CollisionWarningComponent from '@/components/CollisionWarning';
import DeleteAccountModal from '@/components/DeleteAccountModal';
import MyPageSidebar from '@/components/MyPageSidebar';
import NaverMapView from '@/components/NaverMapView';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import SettingsSidebar from '@/components/SettingsSidebar';
import { apiConfig } from '@/config/api.config';
import { BRAND_COLOR, Colors, WHITE } from '@/constants/Colors';
import { apiService } from '@/services/api';
import { CollisionWarning } from '@/types/api.types';
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
  
  // API 모드 확인 (mock 모드에서만 테스트 활성화)
  const isMockMode = apiConfig.mode === 'mock';
  const insets = useSafeAreaInsets();

  // Mock 모드에서 테스트용 충돌 경고 가져오기
  const fetchTestCollisionWarning = async () => {
    // mock 모드가 아니면 실행하지 않음
    if (!isMockMode) return;
    
    try {
      console.log('[MainScreen] Mock 충돌 경고 테스트 요청');
      const response = await apiService.getCollisionWarning({
        device_id: `mobile_device_${Date.now()}`,
        latitude: 37.5666102,
        longitude: 126.9783881,
      });

      if (response.success && response.data?.hasWarning && response.data.warning) {
        console.log('[MainScreen] Mock 경고 생성됨:', response.data.warning);
        handleCollisionWarning(response.data.warning);
      } else {
        console.log('[MainScreen] Mock 경고 없음 - 기존 경고 유지');
        // 🎯 핵심 수정: 여기서는 handleCollisionWarning(null)을 호출하지 않음
        // 기존 경고가 있다면 5초 타이머로 자동 해제되도록 함
      }
    } catch (error) {
      console.error('[MainScreen] Mock 충돌 경고 조회 실패:', error);
    }
  };

  // NaverMapView에서 받은 충돌 경고 처리 (api 모드용)
  const handleCollisionWarning = (warning: CollisionWarning | null) => {
    console.log('[MainScreen] 충돌 경고 수신:', warning);
    
    // 🎯 핵심 수정: null이 오면 무시 (기존 경고가 5초 타이머로 자동 해제되도록)
    if (!warning) {
      console.log('[MainScreen] 경고 해제 신호 무시 - 기존 타이머 유지');
      return;
    }
    
    // 이전 타이머가 있으면 취소 (새로운 경고로 교체)
    if (warningTimerRef.current) {
      console.log('[MainScreen] 기존 경고 타이머 취소 - 새로운 경고로 교체');
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    // 새로운 경고 표시
    console.log('[MainScreen] 새로운 충돌 경고 표시 시작 (5초간)');
    setCollisionWarning(warning);
    setShowWarning(true);
    
    // 새로운 5초 타이머 설정
    warningTimerRef.current = setTimeout(() => {
      console.log('[MainScreen] 충돌 경고 5초 타이머 완료 - 경고 해제');
      setShowWarning(false);
      setCollisionWarning(null);
      warningTimerRef.current = null;
    }, 5000);
  };

  // 🔧 추가: 긴급 상황에서 수동으로 경고를 해제하고 싶을 때 사용할 수 있는 함수 (선택적)
  const clearCollisionWarning = () => {
    console.log('[MainScreen] 수동 충돌 경고 해제');
    
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
      warningTimerRef.current = null;
    }
    
    setShowWarning(false);
    setCollisionWarning(null);
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, []);

  // 키보드 이벤트 리스너 (웹에서 테스트용 - mock 모드에서만)
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      // 'W' 키를 누르면 충돌 경고 테스트 (mock 모드에서만)
      if ((event.key === 'w' || event.key === 'W') && isMockMode) {
        fetchTestCollisionWarning();
      }
    };

    if (Platform.OS === 'web') {
      window.addEventListener('keypress', handleKeyPress);
      return () => {
        window.removeEventListener('keypress', handleKeyPress);
      };
    }
  }, [isMockMode]);

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
        bottom: 100,
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
            source={collisionWarning.objectType === 'vehicle' 
              ? require('@/assets/images/icon_car_3.png')  // 차량 아이콘
              : require('@/assets/images/icon_walking.png')  // 보행자 아이콘
            }
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
        
        {/* Mock 모드 테스트 안내 (개발 모드 + mock 모드일 때만 표시) */}
        {__DEV__ && isMockMode && (
          <View style={styles.testHint}>
            <Text style={styles.testHintText}>이 영역을 터치하면 충돌 경고 테스트</Text>
          </View>
        )}
        
        {/* API 모드 안내 (개발 모드 + api 모드일 때만 표시) */}
        {__DEV__ && apiConfig.mode === 'api' && (
          <View style={styles.testHint}>
            <Text style={styles.testHintText}>API 모드: 실시간 서버 연동 중</Text>
          </View>
        )}
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
            onCollisionWarning={handleCollisionWarning} // 충돌 경고 콜백 연결
          />
        </View>

        {/* 하단 도로 배경 영역 */}
        {isMockMode ? (
          <TouchableOpacity 
            style={styles.roadSection}
            activeOpacity={1}
            onPress={fetchTestCollisionWarning}
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
  
  // 테스트 힌트
  testHint: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  testHintText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: WHITE,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});