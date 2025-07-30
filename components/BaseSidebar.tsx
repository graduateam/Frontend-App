import { BRAND_COLOR, Colors } from '@/constants/colors';
import React, { useEffect, useRef, useState } from 'react';
import {
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

// 이미지를 미리 import
const arrowLeftIcon = require('@/assets/images/icon_arrow-left.png');
const arrowRightIcon = require('@/assets/images/icon_arrow-right.png');

const { width, height } = Dimensions.get('window');

interface BaseSidebarProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  direction?: 'left' | 'right';
  sidebarWidth?: number;
}

export default function BaseSidebar({ 
  visible, 
  onClose, 
  title, 
  children,
  direction = 'right',
  sidebarWidth = width * 0.60,
}: BaseSidebarProps) {
  const isLeftDirection = direction === 'left';
  const initialPosition = isLeftDirection ? -sidebarWidth - 100 : sidebarWidth + 100;
  
  const slideAnim = useRef(new Animated.Value(initialPosition)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      // 애니메이션 값을 먼저 초기화
      slideAnim.setValue(initialPosition);
      fadeAnim.setValue(0);
      
      // Modal을 먼저 보이게 한 후 애니메이션 시작
      setModalVisible(true);
      
      // 짧은 지연 후 애니메이션 실행
      setTimeout(() => {
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
      }, 50);
    } else {
      // 사이드바 닫기 애니메이션
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: initialPosition,
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
  }, [visible, slideAnim, fadeAnim, initialPosition]);

  return (
    <Modal
      transparent
      visible={modalVisible}
      animationType="none"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent
    >
      <View style={{ flex: 1, overflow: 'hidden' }}>
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
            pointerEvents={visible ? 'auto' : 'none'}
          />
        </TouchableWithoutFeedback>

        {/* 사이드바 콘텐츠 */}
        <Animated.View
          style={[
            styles.sidebar,
            isLeftDirection ? styles.sidebarLeft : styles.sidebarRight,
            {
              width: sidebarWidth,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <TouchableOpacity
              style={[styles.closeButton, isLeftDirection ? styles.closeButtonLeft : styles.closeButtonRight]}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Image
                source={isLeftDirection ? arrowLeftIcon : arrowRightIcon}
                style={styles.closeIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
            
            <Text style={styles.title}>{title}</Text>
          </View>

          {/* 본문 영역 */}
          <View style={styles.body}>
            {children}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: Colors.whiteGradient.w5,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  sidebarLeft: {
    left: 0,
    shadowOffset: {
      width: 2,
      height: 0,
    },
  },
  sidebarRight: {
    right: 0,
    shadowOffset: {
      width: -2,
      height: 0,
    },
  },
  
  // 헤더
  header: {
    backgroundColor: Colors.whiteGradient.w4,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteGradient.w3,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  closeButtonLeft: {
    alignItems: 'flex-end',
    marginRight: -8,
  },
  closeButtonRight: {
    alignItems: 'flex-start',
    marginLeft: -8,
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
    backgroundColor: Colors.whiteGradient.w5,
  },
});