// components/DetectedObjectsList.tsx
import { BRAND_COLOR, Colors, WHITE } from '@/constants/colors';
import { DetectedObject } from '@/types/smart-road-api.types';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface DetectedObjectsListProps {
  objects: DetectedObject[];
  visible: boolean;
}

interface ObjectItemProps {
  object: DetectedObject;
}

function ObjectItem({ object }: ObjectItemProps) {
  // 객체 타입에 따른 아이콘
  const getObjectIcon = (type: string, subtype?: string) => {
    switch (type) {
      case 'vehicle':
        if (subtype === 'bus') return require('@/assets/images/icon_car_3.png');
        return require('@/assets/images/icon_car.png');
      case 'person':
        return require('@/assets/images/icon_walking.png');
      case 'bicycle':
        return require('@/assets/images/icon_car_2.png'); // 자전거 아이콘이 없어서 대체
      default:
        return require('@/assets/images/icon_car.png');
    }
  };

  // 위험도에 따른 색상
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return Colors.primary.darkRed;
      case 'high': return BRAND_COLOR;
      case 'medium': return Colors.primary.darkYellow;
      case 'low': return Colors.primary.darkBlue;
      case 'none': return Colors.neutral.gray30;
      default: return Colors.neutral.gray30;
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

  // 객체 타입 한글 변환
  const getObjectTypeText = (type: string, subtype?: string) => {
    if (type === 'vehicle') {
      switch (subtype) {
        case 'bus': return '버스';
        case 'truck': return '트럭';
        case 'car': return '승용차';
        case 'motorcycle': return '오토바이';
        default: return '차량';
      }
    }
    switch (type) {
      case 'person': return '보행자';
      case 'bicycle': return '자전거';
      default: return '객체';
    }
  };

  // 위험도 텍스트
  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '매우 위험';
      case 'high': return '위험';
      case 'medium': return '주의';
      case 'low': return '안전';
      case 'none': return '안전';
      default: return '알 수 없음';
    }
  };

  const riskColor = getRiskColor(object.risk_assessment.risk_level);
  const objectTypeText = getObjectTypeText(object.type, object.subtype);

  return (
    <View style={[styles.objectItem, { borderLeftColor: riskColor }]}>
      {/* 객체 아이콘 */}
      <View style={styles.iconContainer}>
        <Image
          source={getObjectIcon(object.type, object.subtype)}
          style={[styles.objectIcon, { tintColor: riskColor }]}
          resizeMode="contain"
        />
      </View>

      {/* 객체 정보 */}
      <View style={styles.objectInfo}>
        <Text style={styles.objectTitle}>
          {getDirectionText(object.position.relativeDirection)} {objectTypeText}
        </Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>
            거리: <Text style={[styles.detailValue, { color: riskColor }]}>
              {object.position.distance_m.toFixed(0)}m
            </Text>
          </Text>
          
          <Text style={styles.detailText}>
            속도: <Text style={[styles.detailValue, { color: riskColor }]}>
              {object.motion.speed_kph.toFixed(0)} km/h
            </Text>
          </Text>
          
          <Text style={styles.detailText}>
            상태: <Text style={[styles.detailValue, { color: riskColor }]}>
              {object.motion.is_stationary ? '정지' : '이동 중'}
            </Text>
          </Text>
        </View>

        {/* 위험도 표시 */}
        <View style={styles.riskContainer}>
          <View style={[styles.riskBadge, { backgroundColor: riskColor }]}>
            <Text style={styles.riskText}>{getRiskText(object.risk_assessment.risk_level)}</Text>
          </View>
          
          <Text style={styles.confidenceText}>
            신뢰도: {(object.metadata.detection_confidence * 100).toFixed(0)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DetectedObjectsList({ objects, visible }: DetectedObjectsListProps) {
  if (!visible || objects.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/icon_car.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={styles.headerText}>감지된 객체 ({objects.length}개)</Text>
      </View>

      <FlatList
        data={objects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ObjectItem object={item} />}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    maxHeight: 300,
    backgroundColor: WHITE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.neutral.gray5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray10,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: BRAND_COLOR,
    marginRight: 8,
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
  },

  // 리스트
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },

  // 객체 아이템
  objectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderLeftWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.gray10,
  },

  // 아이콘
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.whiteGradient.w5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  objectIcon: {
    width: 24,
    height: 24,
  },

  // 객체 정보
  objectInfo: {
    flex: 1,
  },
  objectTitle: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
    marginBottom: 6,
  },

  // 세부 정보
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
  },
  detailValue: {
    fontFamily: 'Pretendard-SemiBold',
  },

  // 위험도
  riskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 11,
    fontFamily: 'Pretendard-SemiBold',
    color: WHITE,
  },
  confidenceText: {
    fontSize: 11,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray40,
  },
});