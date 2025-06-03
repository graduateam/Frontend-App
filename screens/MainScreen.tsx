import { BRAND_COLOR, Colors, WHITE } from '@/constants/Colors';
import React from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function MainScreen() {
  const handleMyPage = () => {
    console.log('마이페이지 클릭');
    // TODO: 마이페이지로 이동
  };

  const handlePopup = () => {
    console.log('팝업 클릭');
    // TODO: 팝업 기능 구현
  };

  const handleSettings = () => {
    console.log('환경설정 클릭');
    // TODO: 환경설정으로 이동
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={BRAND_COLOR} barStyle="light-content" />
      
      <View style={styles.content}>
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

        {/* 하단 네비게이션 버튼 */}
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BRAND_COLOR,
  },
  content: {
    flex: 1,
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
    height: height * 0.3, // 화면 높이의 30%
    backgroundColor: Colors.blackGradient.b2, // 어두운 오렌지-브라운
  },
  
  // 양측 벽 이미지
  leftWall: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: width * 0.15, // 화면 너비의 15%
    height: height * 0.5, // 화면 높이의 50%
  },
  rightWall: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: width * 0.15, // 화면 너비의 15%
    height: height * 0.5, // 화면 높이의 50%
  },
  
  // 하단 네비게이션
  bottomNavigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 30, // iPhone 노치 대응
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