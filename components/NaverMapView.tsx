import { Colors } from '@/constants/Colors';
import { NaverMapView } from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_WIDTH; // 정사각형 지도

// 기본 위치 (서울)
const DEFAULT_LOCATION = {
  latitude: 37.5666102,
  longitude: 126.9783881,
};

interface NaverMapProps {
  height?: number;
}

export default function NaverMap({ height = MAP_HEIGHT }: NaverMapProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  // 위치 권한 요청 및 현재 위치 가져오기
  useEffect(() => {
    (async () => {
      try {
        // 위치 권한 요청
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // 현재 위치 가져오기
          const currentLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation({
            latitude: currentLocation.coords.latitude,
            longitude: currentLocation.coords.longitude,
          });
        }
      } catch (error) {
        console.log('위치 가져오기 실패, 기본 위치 사용:', error);
        // 기본 위치 사용
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 로딩 화면
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
        <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.mapContainer, { height }]}>
      <NaverMapView
        style={styles.map}
        initialCamera={{
          latitude: location.latitude,
          longitude: location.longitude,
          zoom: 15,
          tilt: 0,
          bearing: 0,
        }}
        isShowLocationButton={true}
        isShowCompass={true}
        isShowScaleBar={true}
        isShowZoomControls={Platform.OS === 'android'}
        isNightModeEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.whiteGradient.w5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
  },
});