import CustomInput from '@/components/CustomInput';
import { Colors } from '@/constants/Colors';
import { CommonStyles } from '@/constants/CommonStyles';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  Text,
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
          
          <Text style={CommonStyles.title}>로그인</Text>
          
          {/* 오른쪽 공간 균형 맞추기 */}
          <View style={CommonStyles.placeholder} />
        </View>

        {/* 입력 폼 */}
        <View style={CommonStyles.formContainer}>
          <CustomInput
            placeholder="아이디"
            value={id}
            onChangeText={setId}
          />
          
          <CustomInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        {/* 로그인 버튼 */}
        <View style={CommonStyles.buttonContainer}>
          <TouchableOpacity
            style={CommonStyles.primaryButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={CommonStyles.primaryButtonText}>로그인</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}