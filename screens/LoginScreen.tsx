import { BRAND_COLOR, Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function LoginScreen() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 실제 로그인 로직 구현
    if (!id.trim() || !password.trim()) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    console.log('로그인 시도:', { id, password });
    Alert.alert('알림', '로그인 기능은 준비 중입니다.');
  };

  const handleBack = () => {
    router.back(); // 이전 화면으로 돌아가기 (스택에서 현재 화면 제거)
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={Colors.whiteGradient.w5} barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* 상단 헤더 (뒤로가기 버튼 + 타이틀) */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Image
              source={require('@/assets/images/icon_arrow-left.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>로그인</Text>
          
          {/* 오른쪽 공간 균형 맞추기 */}
          <View style={styles.placeholder} />
        </View>

        {/* 입력 폼 */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="아이디"
            placeholderTextColor={Colors.neutral.gray40}
            value={id}
            onChangeText={setId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          
          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor={Colors.neutral.gray40}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {/* 로그인 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.loginButtonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.whiteGradient.w5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // 헤더 (뒤로가기 + 타이틀)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.neutral.black,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: Colors.neutral.black,
  },
  placeholder: {
    width: 40, // backButton과 같은 크기로 균형 맞추기
  },
  
  // 폼
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 12,
  },
  input: {
    height: 52,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.black,
    // 그림자 효과
    shadowColor: Colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // 버튼
  buttonContainer: {
    marginTop: 40,
  },
  loginButton: {
    height: 52,
    backgroundColor: BRAND_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.white,
  },
});