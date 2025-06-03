import { StyleSheet } from 'react-native';
import { BRAND_COLOR, Colors } from './Colors';

// 공통 스타일 정의
export const CommonStyles = StyleSheet.create({
  // 컨테이너
  container: {
    flex: 1,
    backgroundColor: Colors.whiteGradient.w5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  // 헤더 (뒤로가기 + 타이틀)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 40,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    tintColor: Colors.neutral.black,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Pretendard-Bold',
    color: Colors.neutral.black,
  },
  placeholder: {
    width: 40, // backButton과 같은 크기로 균형 맞추기
  },
  
  // 폼
  formContainer: {
    justifyContent: 'flex-start',
    gap: 16,
    paddingHorizontal: 12,
    marginTop: 20,
  },
  
  // 입력 필드
  input: {
    height: 52,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    color: Colors.neutral.black,
    // 그림자 효과
    shadowColor: Colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  // 입력 필드 라벨
  inputLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  
  // 버튼
  buttonContainer: {
    marginTop: 40,
    paddingHorizontal: 12,
  },
  primaryButton: {
    height: 52,
    backgroundColor: BRAND_COLOR,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: Colors.neutral.white,
  },
});

export default CommonStyles;