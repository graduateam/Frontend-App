import CustomInput from '@/components/CustomInput';
import { Colors } from '@/constants/Colors';
import { CommonStyles } from '@/constants/CommonStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    id: '',
    nickname: '',
    password: '',
    passwordConfirm: '',
    email: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = () => {
    // 입력 검증
    const { id, nickname, password, passwordConfirm, email } = formData;
    
    if (!id.trim() || !nickname.trim() || !password.trim() || !passwordConfirm.trim() || !email.trim()) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }
    
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    
    // 이메일 유효성 검사 (간단한 정규식)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('알림', '올바른 이메일 주소를 입력해주세요.');
      return;
    }
    
    console.log('회원가입 시도:', formData);
    Alert.alert('알림', '회원가입 기능은 준비 중입니다.');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={CommonStyles.container}>
      <StatusBar backgroundColor={Colors.whiteGradient.w5} barStyle="dark-content" />
      
      <View style={CommonStyles.content}>
        {/* 상단 헤더 (뒤로가기 버튼 + 타이틀) */}
        <View style={CommonStyles.header}>
          <TouchableOpacity
            style={CommonStyles.backButton}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <Image
              source={require('@/assets/images/icon_arrow-left.png')}
              style={CommonStyles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={CommonStyles.title}>회원가입</Text>
          
          {/* 오른쪽 공간 균형 맞추기 */}
          <View style={CommonStyles.placeholder} />
        </View>

        {/* 입력 폼 - ScrollView로 감싸기 */}
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CustomInput
            label="아이디 입력"
            placeholder="아이디"
            value={formData.id}
            onChangeText={(value) => handleInputChange('id', value)}
          />
          
          <CustomInput
            label="닉네임 입력"
            placeholder="닉네임"
            value={formData.nickname}
            onChangeText={(value) => handleInputChange('nickname', value)}
          />
          
          <CustomInput
            label="비밀번호 입력"
            placeholder="비밀번호"
            value={formData.password}
            onChangeText={(value) => handleInputChange('password', value)}
            secureTextEntry
          />
          
          <CustomInput
            placeholder="비밀번호 확인"
            value={formData.passwordConfirm}
            onChangeText={(value) => handleInputChange('passwordConfirm', value)}
            secureTextEntry
          />
          
          <CustomInput
            label="이메일 입력"
            placeholder="이메일"
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            keyboardType="email-address"
          />
        </ScrollView>

        {/* 회원가입 버튼 */}
        <View style={CommonStyles.buttonContainer}>
          <TouchableOpacity
            style={CommonStyles.primaryButton}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={CommonStyles.primaryButtonText}>시작하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  scrollContent: {
    // gap: 8,
    paddingBottom: 20,
  },
});