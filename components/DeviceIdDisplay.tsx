// components/DeviceIdDisplay.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getOrCreateDeviceId } from '@/services/deviceId';

interface DeviceIdDisplayProps {
  position?: 'top' | 'bottom';
}

/**
 * Device ID를 화면에 표시하는 컴포넌트
 * Release APK에서 실제 Device ID 확인용
 */
export const DeviceIdDisplay: React.FC<DeviceIdDisplayProps> = ({ position = 'top' }) => {
  const [deviceId, setDeviceId] = useState<string>('로딩중...');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    loadDeviceId();
  }, []);

  const loadDeviceId = async () => {
    try {
      const id = await getOrCreateDeviceId();
      setDeviceId(id);
      console.log('📱 DeviceIdDisplay - Device ID:', id);
    } catch (error) {
      setDeviceId('오류');
      console.error('Device ID 로드 실패:', error);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const displayText = isExpanded ? deviceId : `Device ID: ${deviceId.substring(0, 15)}...`;

  return (
    <View style={[
      styles.container,
      position === 'bottom' ? styles.bottom : styles.top
    ]}>
      <TouchableOpacity onPress={toggleExpanded} style={styles.touchable}>
        <Text style={styles.label}>🆔 {displayText}</Text>
        {isExpanded && (
          <Text style={styles.instruction}>
            (터치하여 접기)
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 8,
    zIndex: 1000,
  },
  top: {
    top: 50,
  },
  bottom: {
    bottom: 50,
  },
  touchable: {
    padding: 12,
  },
  label: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  instruction: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default DeviceIdDisplay;