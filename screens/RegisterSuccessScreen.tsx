import { BRAND_COLOR, WHITE } from '@/constants/Colors';
import { router } from 'expo-router';
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

export default function RegisterSuccessScreen() {
  const handleStart = () => {
    // 메인 화면으로 이동 (replace를 사용하여 뒤로가기 방지)
    router.replace('/main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={BRAND_COLOR} barStyle="light-content" />
      
      <View style={styles.content}>
        {/* 중앙 콘텐츠 */}
        <View style={styles.centerContent}>
          {/* 체크 아이콘 */}
          <View style={styles.iconContainer}>
            <Image
              source={require('@/assets/images/icon_circle-check-4x.png')}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          </View>
          
          {/* 완료 메시지 */}
          <Text style={styles.message}>회원가입이 완료되었습니다</Text>
        </View>

        {/* 하단 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>시작하기</Text>
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
  
  // 중앙 콘텐츠
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkIcon: {
    width: '100%',
    height: '100%',
    tintColor: WHITE,  // 이미지를 흰색으로 변경
  },
  message: {
    fontSize: 20,
    fontFamily: 'Pretendard-Regular',
    color: WHITE,
    textAlign: 'center',
  },
  
  // 하단 버튼
  buttonContainer: {
    width: '100%',
  },
  startButton: {
    height: 52,
    backgroundColor: WHITE,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: BRAND_COLOR,
  },
});