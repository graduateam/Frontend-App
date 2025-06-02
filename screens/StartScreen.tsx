import { BRAND_COLOR, Colors, WHITE } from '@/constants/colors';
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

const { width } = Dimensions.get('window');

export default function StartScreen() {
  const handleLogin = () => {
    // TODO: 로그인 화면으로 이동
    console.log('로그인 버튼 클릭');
  };

  const handleSignUp = () => {
    // TODO: 회원가입 화면으로 이동
    console.log('회원가입 버튼 클릭');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={BRAND_COLOR} barStyle="light-content" />
      
      <View style={styles.content}>
        {/* 상단 타이틀 */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleLine1}>오직당신만을 위한</Text>
          <Text style={styles.titleLine2}>스마트 도로반사경</Text>
        </View>

        {/* 중앙 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.imageWrapper}>
            <Image
              source={require('@/assets/images/image_road_reflector.png')}
              style={styles.reflectorImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={handleSignUp}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>회원가입</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  
  // 타이틀 스타일
  titleContainer: {
    alignItems: 'center',
  },
  titleLine1: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: WHITE,
    marginBottom: 4,
  },
  titleLine2: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: WHITE,
  },
  
  // 이미지 스타일
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: Colors.neutral.gray20,
    borderRadius: width * 0.25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    // 그림자 효과
    shadowColor: Colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  reflectorImage: {
    width: '80%',
    height: '80%',
  },
  
  // 버튼 스타일
  buttonContainer: {
    gap: 12,
  },
  button: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: WHITE,
  },
  signUpButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: WHITE,
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: BRAND_COLOR,
  },
  signUpButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: WHITE,
  },
});