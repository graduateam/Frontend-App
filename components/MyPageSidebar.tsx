// components/MyPageSidebar.tsx
import { Colors, WHITE } from '@/constants/Colors';
import { apiService } from '@/services/api';
import { User } from '@/types/api.types';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseSidebar from './BaseSidebar';

interface MyPageSidebarProps {
  visible: boolean;
  onClose: () => void;
  onPasswordChange: () => void;
  onDeleteAccount: () => void;
}

export default function MyPageSidebar({ visible, onClose, onPasswordChange, onDeleteAccount }: MyPageSidebarProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    if (visible) {
      loadUserInfo();
    }
  }, [visible]);

  const loadUserInfo = async () => {
    try {
      const user = await apiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('사용자 정보 로드 실패:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '확인', 
          onPress: async () => {
            setIsLoading(true);
            try {
              console.log('로그아웃 시도');
              await apiService.logout();
              
              onClose();
              // MainScreen을 종료하고 StartScreen으로 돌아가기
              router.back();
            } catch (error) {
              console.error('로그아웃 실패:', error);
              Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
            } finally {
              setIsLoading(false);
            }
          }
        },
      ]
    );
  };

  const handlePasswordChange = () => {
    console.log('비밀번호 변경');
    // 부모 컴포넌트의 onPasswordChange 호출
    onPasswordChange();
  };

  const handleDeleteAccount = () => {
    console.log('회원탈퇴');
    // 부모 컴포넌트의 onDeleteAccount 호출
    onDeleteAccount();
  };

  return (
    <BaseSidebar
      visible={visible}
      onClose={onClose}
      title="마이페이지"
      direction="right"
      sidebarWidth={Dimensions.get('window').width * 0.60}
    >
      {/* 인사말 */}
      <View style={styles.greetingContainer}>
        <Text style={styles.greeting}>
          반가워요 {currentUser?.nickname || '사용자'}님,
        </Text>
        <Text style={styles.greetingSub}>오늘도 안전운전~ ♪</Text>
      </View>

      {/* 버튼 목록 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.menuButton, styles.logoutButton]}
          onPress={handleLogout}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={WHITE} />
          ) : (
            <Text style={styles.menuButtonText}>로그아웃</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.passwordButton]}
          onPress={handlePasswordChange}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonText}>비밀번호 변경</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuButton, styles.deleteButton]}
          onPress={handleDeleteAccount}
          activeOpacity={0.8}
        >
          <Text style={styles.menuButtonText}>회원탈퇴</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 이미지 */}
      <View style={styles.bottomImageContainer}>
        <View style={styles.bottomImageWrapper}>
          <Image
            source={require('@/assets/images/image_road_reflector.png')}
            style={styles.bottomImage}
            resizeMode="contain"
          />
        </View>
      </View>
    </BaseSidebar>
  );
}

const styles = StyleSheet.create({
  // 인사말
  greetingContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
  },
  
  // 버튼 목록
  buttonContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  menuButton: {
    height: 52,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: WHITE,
  },
  
  // 개별 버튼 스타일
  logoutButton: {
    backgroundColor: Colors.whiteGradient.w2,
  },
  passwordButton: {
    backgroundColor: Colors.whiteGradient.w2,
  },
  deleteButton: {
    backgroundColor: Colors.blackGradient.b2,
  },
  
  // 하단 이미지
  bottomImageContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomImageWrapper: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomImage: {
    width: 60,
    height: 60,
  },
});