import { BRAND_COLOR, Colors } from '@/constants/Colors';
import { apiService } from '@/services/api';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
  const [isSaving, setIsSaving] = useState(false);

  // 컴포넌트가 보일 때 설정 불러오기
  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  // API에서 설정 불러오기
  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const apiSettings = await apiService.getSettings();
      
      // API 설정을 UI 형식으로 변환
      const updatedSettings = DEFAULT_SETTINGS.map(item => ({
        ...item,
        checked: apiSettings[item.id as keyof typeof apiSettings] ?? item.checked
      }));
      
      setSettings(updatedSettings);
    } catch (error) {
      console.error('설정 불러오기 실패:', error);
      // 오류 시 기본값 사용
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSetting = async (id: string) => {
    // 즉시 UI 업데이트 (낙관적 업데이트)
    const newSettings = settings.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setSettings(newSettings);
    
    // API로 설정 저장
    setIsSaving(true);
    try {
      // UI 형식을 API 형식으로 변환
      const apiSettings = {
        vibration: newSettings.find(s => s.id === 'vibration')?.checked ?? true,
        voiceDescription: newSettings.find(s => s.id === 'voiceDescription')?.checked ?? true,
        reducedVisualEffects: newSettings.find(s => s.id === 'reducedVisualEffects')?.checked ?? true,
        startWithOthers: newSettings.find(s => s.id === 'startWithOthers')?.checked ?? true,
      };
      
      const result = await apiService.updateSettings(apiSettings);
      
      if (!result.success) {
        // 저장 실패 시 이전 상태로 복원
        setSettings(settings);
        console.error('설정 저장 실패');
      } else {
        console.log(`${id} 설정 변경 완료`);
      }
    } catch (error) {
      console.error('설정 저장 오류:', error);
      // 오류 시 이전 상태로 복원
      setSettings(settings);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseSidebar
      visible={visible}
      onClose={onClose}
      title="환경설정"
      direction="left"
    >
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BRAND_COLOR} />
            <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
          </View>
        ) : (
          <>
            {settings.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.settingItem}
                onPress={() => toggleSetting(item.id)}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <Text style={styles.settingLabel}>{item.label}</Text>
                <View style={[
                  styles.checkbox, 
                  item.checked && styles.checkboxChecked,
                  isSaving && styles.checkboxDisabled
                ]}>
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
            
            {isSaving && (
              <View style={styles.savingContainer}>
                <ActivityIndicator size="small" color={BRAND_COLOR} />
                <Text style={styles.savingText}>저장 중...</Text>
              </View>
            )}
          </>
        )}
      </View>
    </BaseSidebar>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.gray50,
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
  checkboxDisabled: {
    opacity: 0.6,
  },
  checkIcon: {
    width: 16,
    height: 16,
    tintColor: Colors.neutral.white,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  savingText: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: BRAND_COLOR,
  },
});