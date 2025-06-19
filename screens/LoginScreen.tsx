import CustomInput from '@/components/CustomInput';
import { Colors } from '@/constants/Colors';
import { CommonStyles } from '@/constants/CommonStyles';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!id.trim() || !password.trim()) {
      Alert.alert('알림', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      console.log('로그인 시도:', { id });
      
      const result = await apiService.login({
        username: id,
        password: password,
      });

      if (result.success) {
        // 로그인 성공
        console.log('로그인 성공:', result.data?.user);
        router.replace('/main');
      } else {
        // 로그인 실패
        Alert.alert('로그인 실패', result.message || '아이디 또는 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      Alert.alert('오류', '로그인 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
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
            editable={!isLoading}
          />
          
          <CustomInput
            placeholder="비밀번호"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />
        </View>

        {/* 로그인 버튼 */}
        <View style={CommonStyles.buttonContainer}>
          <TouchableOpacity
            style={[CommonStyles.primaryButton, isLoading && { opacity: 0.6 }]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.neutral.white} />
            ) : (
              <Text style={CommonStyles.primaryButtonText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}