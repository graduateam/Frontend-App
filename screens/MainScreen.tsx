import DeleteAccountModal from '@/components/DeleteAccountModal';
import MyPageSidebar from '@/components/MyPageSidebar';
import NaverMapView from '@/components/NaverMapView';
import PasswordChangeModal from '@/components/PasswordChangeModal';
import SettingsSidebar from '@/components/SettingsSidebar';
import { BRAND_COLOR, Colors, WHITE } from '@/constants/Colors';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = width; // 정사각형 지도

export default function MainScreen() {
  const [isMyPageVisible, setIsMyPageVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [isPasswordChangeVisible, setIsPasswordChangeVisible] = useState(false);
  const [isDeleteAccountVisible, setIsDeleteAccountVisible] = useState(false);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={BRAND_COLOR} barStyle="light-content" />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* 상단 지도 영역 */}
        <View style={styles.mapSection}>
          <NaverMapView height={MAP_HEIGHT} />
        </View>

        {/* 하단 도로 배경 영역 */}
        <View style={styles.roadSection}>
          {/* 배경 및 하단 어두운 영역 */}
          <View style={styles.backgroundContainer}>
            {/* 하단 어두운 네모 영역 */}
            <View style={styles.darkArea} />
          </View>

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
        </View>
      </ScrollView>

      {/* 하단 네비게이션 버튼 (고정) */}
      <View style={styles.bottomNavigation}>
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
  },
  rightWall: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * 0.15,
    height: 250,
  },
  
  // 하단 네비게이션 (고정)
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, // iPhone 노치 대응
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