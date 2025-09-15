// components/DeviceIdDebug.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { getOrCreateDeviceId } from '@/services/deviceId';

/**
 * Device ID 디버깅용 컴포넌트
 * Release APK에서 Device ID 확인용
 */
export const DeviceIdDebug: React.FC = () => {
  const [deviceId, setDeviceId] = useState<string>('로딩 중...');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadDeviceId();
  }, []);

  const loadDeviceId = async () => {
    try {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      console.log('🔍 DeviceIdDebug - Device ID:', id);
    } catch (error) {
      setDeviceId('오류 발생');
      console.error('DeviceIdDebug 오류:', error);
    }
  };

  const showDeviceId = () => {
    Alert.alert(
      'Device ID 정보',
      `현재 Device ID:\n${deviceId}`,
      [
        { text: '복사', onPress: () => copyToClipboard() },
        { text: '닫기', style: 'cancel' }
      ]
    );
  };

  const copyToClipboard = () => {
    // 클립보드 복사 기능은 선택사항
    console.log('📋 Device ID 복사:', deviceId);
    Alert.alert('알림', 'Device ID가 콘솔에 출력되었습니다.');
  };

  if (!isVisible) {
    return (
      <TouchableOpacity
        style={styles.showButton}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.showButtonText}>🔍</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.hideButton} onPress={() => setIsVisible(false)}>
        <Text style={styles.hideButtonText}>✕</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.debugInfo} onPress={showDeviceId}>
        <Text style={styles.label}>Device ID (터치하여 확인)</Text>
        <Text style={styles.deviceId} numberOfLines={1}>
          {deviceId.substring(0, 20)}...
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  showButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  showButtonText: {
    color: 'white',
    fontSize: 16,
  },
  container: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1000,
    minWidth: 200,
  },
  hideButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    backgroundColor: 'red',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hideButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  debugInfo: {
    marginTop: 15,
  },
  label: {
    color: 'white',
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.8,
  },
  deviceId: {
    color: '#00ff00',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});