import { BRAND_COLOR, Colors, WHITE } from '@/constants/Colors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.60; // 화면 너비의 60%

interface MyPageSidebarProps {
  visible: boolean;
  onClose: () => void;
}

export default function MyPageSidebar({ visible, onClose }: MyPageSidebarProps) {
  const slideAnim = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      // Modal을 먼저 보이게 한 후 애니메이션 시작
      setModalVisible(true);
      // 사이드바 열기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 사이드바 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SIDEBAR_WIDTH,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        // 애니메이션이 완료된 후 Modal을 숨김
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          console.log('로그아웃');
          onClose();
          // TODO: 실제 로그아웃 로직 구현
        }},
      ]
    );
  };

  const handlePasswordChange = () => {
    console.log('비밀번호 변경');
    onClose();
    // TODO: 비밀번호 변경 화면으로 이동
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n탈퇴 후에는 복구할 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => {
          console.log('회원탈퇴');
          onClose();
          // TODO: 실제 회원탈퇴 로직 구현
        }, style: 'destructive' },
      ]
    );
  };

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor={modalVisible && visible ? 'rgba(0,0,0,0.5)' : BRAND_COLOR} />
      
      {/* 배경 오버레이 */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View 
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]} 
        />
      </TouchableWithoutFeedback>

      {/* 사이드바 콘텐츠 */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* 헤더 - 마이페이지 타이틀만 포함 */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Image
              source={require('@/assets/images/icon_arrow-right.png')}
              style={styles.closeIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          
          <Text style={styles.title}>마이페이지</Text>
        </View>

        {/* 본문 영역 */}
        <View style={styles.body}>
          {/* 인사말 */}
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>반가워요 박덕철님,</Text>
            <Text style={styles.greetingSub}>오늘도 안전운전~ ♪</Text>
          </View>

          {/* 버튼 목록 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.menuButton, styles.logoutButton]}
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.menuButtonText}>로그아웃</Text>
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

          {/* 하단 이미지 - tintColor 제거 */}
          <View style={styles.bottomImageContainer}>
            <View style={styles.bottomImageWrapper}>
              <Image
                source={require('@/assets/images/image_road_reflector.png')}
                style={styles.bottomImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.whiteGradient.w5,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  
  // 헤더 - 배경색 구분
  header: {
    backgroundColor: Colors.whiteGradient.w4, // 더 진한 베이지색
    paddingHorizontal: 24,
    paddingTop: 60, // 상태바 높이 고려
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteGradient.w3,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: -8, // 시각적 정렬
  },
  closeIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.neutral.black,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: Colors.neutral.black,
    marginTop: 16,
  },
  
  // 본문 영역
  body: {
    flex: 1,
    backgroundColor: Colors.whiteGradient.w5, // 더 밝은 베이지색
  },
  
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
    color: WHITE, // 모든 버튼 텍스트를 흰색으로 통일
  },
  
  // 개별 버튼 스타일
  logoutButton: {
    backgroundColor: Colors.whiteGradient.w2, // 비밀번호 변경과 같은 색상
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
    // borderRadius: 50,
    // backgroundColor: Colors.whiteGradient.w3,
    justifyContent: 'center',
    alignItems: 'center',
    // // 원형 테두리 추가
    // borderWidth: 3,
    // borderColor: BRAND_COLOR,
  },
  bottomImage: {
    width: 60,
    height: 60,
    // tintColor 제거하여 원본 이미지 색상 유지
  },
});