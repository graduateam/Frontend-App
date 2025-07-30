import { BRAND_COLOR, Colors, WHITE } from '@/constants/colors';
import { CollisionWarning } from '@/types/api.types';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CollisionWarningProps {
  warning: CollisionWarning | null;
  visible: boolean;
}

export default function CollisionWarningComponent({ warning, visible }: CollisionWarningProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible && warning) {
      // 경고 표시 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // 경고 숨기기 애니메이션
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, warning, fadeAnim, scaleAnim]);

  if (!warning || !visible) {
    return null;
  }

  // 방향에 따른 아이콘 회전 각도
  const getRotationAngle = (direction: string) => {
    const angles: Record<string, number> = {
      'front': 0,
      'front-right': 45,
      'right': 90,
      'rear-right': 135,
      'rear': 180,
      'rear-left': -135,
      'left': -90,
      'front-left': -45,
    };
    return angles[direction] || 0;
  };

  // 위험도에 따른 색상
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return Colors.primary.darkRed;
      case 'high': return BRAND_COLOR;
      case 'medium': return Colors.primary.darkYellow;
      case 'low': return Colors.primary.darkBlue;
      default: return BRAND_COLOR;
    }
  };

  // 상대 방향 한글 변환
  const getDirectionText = (direction: string) => {
    const directions: Record<string, string> = {
      'front': '전방',
      'front-right': '우전방',
      'right': '우측',
      'rear-right': '우후방',
      'rear': '후방',
      'rear-left': '좌후방',
      'left': '좌측',
      'front-left': '좌전방',
    };
    return directions[direction] || '전방';
  };

  const severityColor = getSeverityColor(warning.severity);
  const objectTypeText = warning.objectType === 'vehicle' ? '차량' : '보행자';

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <View style={[styles.warningBox, { borderColor: severityColor }]}>
        {/* 헤더 */}
        <View style={[styles.header, { backgroundColor: severityColor }]}>
          <Image
            source={require('@/assets/images/icon_circle-error.png')}
            style={styles.warningIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerText}>충돌 경고</Text>
        </View>

        {/* 본문 */}
        <View style={styles.body}>
          {/* 방향 표시 */}
          <View style={styles.directionContainer}>
            <View style={[styles.directionCircle, { borderColor: severityColor }]}>
              <Image
                source={require('@/assets/images/icon_triangle.png')}
                style={[
                  styles.directionArrow,
                  { 
                    tintColor: severityColor,
                    transform: [{ rotate: `${getRotationAngle(warning.relativeDirection)}deg` }]
                  }
                ]}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.directionText}>{getDirectionText(warning.relativeDirection)}</Text>
          </View>

          {/* 정보 표시 */}
          <View style={styles.infoContainer}>
            <Text style={styles.mainInfo}>
              {getDirectionText(warning.relativeDirection)}에서 {objectTypeText} 접근 중
            </Text>
            
            <View style={styles.detailsRow}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>속도</Text>
                <Text style={[styles.detailValue, { color: severityColor }]}>
                  {warning.speed_kph.toFixed(0)} km/h
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>거리</Text>
                <Text style={[styles.detailValue, { color: severityColor }]}>
                  {warning.distance.toFixed(0)}m
                </Text>
              </View>
              
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>충돌까지</Text>
                <Text style={[styles.detailValue, { color: severityColor }]}>
                  {warning.ttc.toFixed(1)}초
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: width - 80, // 지도 하단에서 약간 위로 (지도와 도로 영역 경계)
    left: 20,
    right: 20,
    zIndex: 100,
  },
  warningBox: {
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    overflow: 'hidden',
  },
  
  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  warningIcon: {
    width: 24,
    height: 24,
    tintColor: WHITE,
    marginRight: 8,
  },
  headerText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: WHITE,
  },
  
  // 본문
  body: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  
  // 방향 표시
  directionContainer: {
    alignItems: 'center',
    marginRight: 20,
  },
  directionCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.whiteGradient.w5,
  },
  directionArrow: {
    width: 30,
    height: 30,
  },
  directionText: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
    marginTop: 4,
  },
  
  // 정보 표시
  infoContainer: {
    flex: 1,
  },
  mainInfo: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
    marginBottom: 12,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
});