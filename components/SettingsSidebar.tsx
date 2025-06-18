import { BRAND_COLOR, Colors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BaseSidebar from './BaseSidebar';

interface SettingsSidebarProps {
  visible: boolean;
  onClose: () => void;
}

interface SettingItem {
  id: string;
  label: string;
  checked: boolean;
}

const SETTINGS_STORAGE_KEY = '@smart_road_reflector_settings';

// 기본 설정값
const DEFAULT_SETTINGS: SettingItem[] = [
  { id: 'vibration', label: '진동', checked: true },
  { id: 'voiceDescription', label: '음성 설명', checked: true },
  { id: 'reducedVisualEffects', label: '강조된 시각효과', checked: true },
  { id: 'startWithOthers', label: '다른 어플과 같이 시작', checked: true },
];

export default function SettingsSidebar({ visible, onClose }: SettingsSidebarProps) {
  const [settings, setSettings] = useState<SettingItem[]>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트가 마운트될 때 저장된 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  // 저장된 설정 불러오기
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings !== null) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 설정 저장하기
  const saveSettings = async (newSettings: SettingItem[]) => {
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('설정 저장 실패:', error);
    }
  };

  const toggleSetting = (id: string) => {
    const newSettings = settings.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    
    setSettings(newSettings);
    saveSettings(newSettings); // 변경된 설정 즉시 저장
    
    console.log(`${id} 설정 변경`);
    // TODO: 실제 설정 변경 로직 구현 (진동 on/off 등)
  };

  return (
    <BaseSidebar
      visible={visible}
      onClose={onClose}
      title="환경설정"
      direction="left"
    >
      <View style={styles.container}>
        {!isLoading && settings.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.settingItem}
            onPress={() => toggleSetting(item.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.settingLabel}>{item.label}</Text>
            <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
              {item.checked && (
                <Image
                  source={require('@/assets/images/icon_check.png')}
                  style={styles.checkIcon}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </BaseSidebar>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.whiteGradient.w3,
  },
  settingLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.black,
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.neutral.gray30,
    backgroundColor: Colors.neutral.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: BRAND_COLOR,
    borderColor: BRAND_COLOR,
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.neutral.white,
  },
});