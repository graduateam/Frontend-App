import CustomInput from '@/components/CustomInput';
import { Colors } from '@/constants/colors';
import { apiService } from '@/services/api';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = async () => {
    // 비밀번호 입력 검증
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요.');
      return;
    }
    
    // 1차 확인
    Alert.alert(
      '회원탈퇴',
      '정말로 탈퇴하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '탈퇴', 
          style: 'destructive',
          onPress: () => {
            // 2차 확인
            Alert.alert(
              '최종 확인',
              '회원탈퇴를 진행하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
              [
                { text: '취소', style: 'cancel' },
                {
                  text: '확인',
                  style: 'destructive',
                  onPress: performDeleteAccount
                }
              ]
            );
          }
        }
      ]
    );
  };

  const performDeleteAccount = async () => {
    setIsLoading(true);
    
    try {
      console.log('회원탈퇴 진행');
      
      const result = await apiService.deleteAccount({
        password: password,
      });

      if (result.success) {
        Alert.alert(
          '탈퇴 완료',
          result.message || '회원탈퇴가 완료되었습니다.',
          [
            {
              text: '확인',
              onPress: () => {
                // 모달 닫기
                onClose();
                // 입력 필드 초기화
                setPassword('');
                // 시작 화면으로 돌아가기
                router.back();
              }
            }
          ]
        );
      } else {
        Alert.alert('오류', result.message || '회원탈퇴에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원탈퇴 오류:', error);
      Alert.alert('오류', '회원탈퇴 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // 입력 필드 초기화
    setPassword('');
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
            
            <Text style={styles.title}>회원탈퇴</Text>
            
            {/* 오른쪽 공간 균형 맞추기 */}
            <View style={styles.placeholder} />
          </View>

          {/* 경고 메시지 */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              회원탈퇴 시 모든 데이터가 삭제되며{'\n'}복구할 수 없습니다.
            </Text>
          </View>

          {/* 입력 폼 */}
          <View style={styles.formContainer}>
            <CustomInput
              label="비밀번호 확인"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {/* 회원탈퇴 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.deleteButton, isLoading && { opacity: 0.6 }]}
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                <Text style={styles.deleteButtonText}>회원탈퇴</Text>
              )}
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
  
  // 경고 메시지
  warningContainer: {
    backgroundColor: Colors.whiteGradient.w3,
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    marginHorizontal: 12,
  },
  warningText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: Colors.blackGradient.b2,
    textAlign: 'center',
    lineHeight: 20,
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
  deleteButton: {
    height: 52,
    backgroundColor: Colors.blackGradient.b2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.white,
  },
});