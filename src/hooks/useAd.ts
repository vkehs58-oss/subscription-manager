/**
 * 앱인토스 통합 광고 훅 (전면형/보상형)
 * - AD_GROUP_ID가 빈 문자열이면 완전 비활성화 (코드 실행 안 함)
 * - 사업자 등록 후 콘솔에서 발급받은 ID로 교체하면 활성화
 */
import { useState, useCallback } from 'react';

// 광고 그룹 ID — 빈 문자열 = 완전 비활성화
const AD_GROUP_ID = '';

export function useAd() {
  const [isAdLoaded] = useState(false);

  const showAd = useCallback(() => {
    // AD_GROUP_ID가 비어있으면 아무것도 안 함
  }, []);

  // AD_GROUP_ID가 없으면 모든 기능 비활성화
  return {
    isAdSupported: !!AD_GROUP_ID,
    isAdLoaded: AD_GROUP_ID ? isAdLoaded : false,
    showAd,
  };
}

/*
 * ===== 사업자 등록 후 활성화 방법 =====
 * 
 * 1. 앱인토스 콘솔에서 광고 그룹 ID 발급
 * 2. 위 AD_GROUP_ID에 발급받은 ID 입력
 * 3. 아래 주석 해제하여 실제 광고 코드 활성화
 * 
 * 테스트 시:
 *   전면형: AD_GROUP_ID = 'ait-ad-test-interstitial-id'
 *   보상형: AD_GROUP_ID = 'ait-ad-test-rewarded-id'
 *
 * 실제 광고 코드 (활성화 시 위 useAd 함수 교체):
 *
 * import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/web-framework';
 *
 * export function useAd() {
 *   const [isAdLoaded, setIsAdLoaded] = useState(false);
 *   const isAdSupported = loadFullScreenAd?.isSupported?.() ?? false;
 *
 *   useEffect(() => {
 *     if (!AD_GROUP_ID || !isAdSupported) return;
 *     const unreg = loadFullScreenAd({
 *       options: { adGroupId: AD_GROUP_ID },
 *       onEvent: (e) => { if (e.type === 'loaded') setIsAdLoaded(true); },
 *       onError: () => {},
 *     });
 *     return () => unreg?.();
 *   }, []);
 *
 *   const showAd = useCallback(() => {
 *     if (!isAdLoaded) return;
 *     showFullScreenAd({
 *       options: { adGroupId: AD_GROUP_ID },
 *       onEvent: (e) => {
 *         if (e.type === 'dismissed') {
 *           setIsAdLoaded(false);
 *           // 다음 광고 미리 로드
 *           loadFullScreenAd({ options: { adGroupId: AD_GROUP_ID },
 *             onEvent: (ev) => { if (ev.type === 'loaded') setIsAdLoaded(true); },
 *             onError: () => {} });
 *         }
 *       },
 *       onError: () => {},
 *     });
 *   }, [isAdLoaded]);
 *
 *   return { isAdSupported, isAdLoaded, showAd };
 * }
 */
