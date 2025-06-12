import CustomInput from '@/components/CustomInput';
import { BRAND_COLOR, Colors, WHITE } from '@/constants/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    Modal,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function PasswordChangeModal({ visible, onClose }: PasswordChangeModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = () => {
    // 입력 검증
    if (!currentPassword.trim() || !newPassword.trim()) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }
    
    if (currentPassword === newPassword) {
      Alert.alert('알림', '새로운 비밀번호는 기존 비밀번호와 달라야 합니다.');
      return;
    }
    
    console.log('비밀번호 변경 시도');
    // TODO: 실제 비밀번호 변경 로직 구현
    
    // 비밀번호 변경 후 시작 화면으로 이동
    Alert.alert(
      '알림', 
      '비밀번호가 변경되었습니다.\n다시 로그인해주세요.',
      [
        {
          text: '확인',
          onPress: () => {
            // 모달 닫기
            onClose();
            // 입력 필드 초기화
            setCurrentPassword('');
            setNewPassword('');
            // MainScreen을 종료하고 기존 StartScreen으로 돌아가기
            router.back();
          }
        }
      ]
    );
  };

  const handleClose = () => {
    // 입력 필드 초기화
    setCurrentPassword('');
    setNewPassword('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.whiteGradient.w5} barStyle="dark-content" />
        
        <View style={styles.content}>
          {/* 상단 헤더 (뒤로가기 버튼 + 타이틀) */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Image
                source={require('@/assets/images/icon_arrow-left.png')}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <Text style={styles.title}>비밀번호 변경</Text>
            
            {/* 오른쪽 공간 균형 맞추기 */}
            <View style={styles.placeholder} />
          </View>

          {/* 입력 폼 */}
          <View style={styles.formContainer}>
            <CustomInput
              label="기존 비밀번호"
              placeholder="기존 비밀번호"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            
            <CustomInput
              label="새로운 비밀번호"
              placeholder="새로운 비밀번호"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          {/* 비밀번호 변경 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handlePasswordChange}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>비밀번호 변경</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    marginTop: 40,
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
    justifyContent: 'flex-start',
    paddingHorizontal: 12,
    marginTop: 20,
  },
  
  // 버튼
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 12,
  },
  primaryButton: {
    height: 52,
    backgroundColor: BRAND_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: WHITE,
  },
});