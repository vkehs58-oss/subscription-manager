/**
 * 플랫폼 추상화 레이어
 *
 * 웹 브라우저와 Toss WebView 환경의 차이를 추상화합니다.
 * 각 기능은 환경을 자동 감지하여 적절한 구현을 사용합니다.
 */

// ─── 환경 감지 ───────────────────────────────────────────

export type PlatformType = 'toss' | 'web'

declare global {
  interface Window {
    TossApp?: {
      share?: (data: { title?: string; text?: string; url?: string }) => void
      getLocation?: () => Promise<{ latitude: number; longitude: number }>
      back?: () => void
      close?: () => void
      setItem?: (key: string, value: string) => void
      getItem?: (key: string) => string | null
      removeItem?: (key: string) => void
    }
  }
}

export function getPlatform(): PlatformType {
  if (typeof window !== 'undefined' && window.TossApp) {
    return 'toss'
  }
  return 'web'
}

export const isToss = () => getPlatform() === 'toss'
export const isWeb = () => getPlatform() === 'web'

// ─── 스토리지 ────────────────────────────────────────────

export const storage = {
  get(key: string): string | null {
    if (isToss() && window.TossApp?.getItem) {
      return window.TossApp.getItem(key)
    }
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key: string, value: string): void {
    if (isToss() && window.TossApp?.setItem) {
      window.TossApp.setItem(key, value)
      return
    }
    try {
      localStorage.setItem(key, value)
    } catch {
      // storage full or unavailable
    }
  },

  remove(key: string): void {
    if (isToss() && window.TossApp?.removeItem) {
      window.TossApp.removeItem(key)
      return
    }
    try {
      localStorage.removeItem(key)
    } catch {
      // ignore
    }
  },
}

// ─── 공유 기능 ───────────────────────────────────────────

export interface ShareData {
  title?: string
  text?: string
  url?: string
}

const TOSS_DEEPLINK = 'supertoss://miniapp/my-sub-tracker'

export async function share(data: ShareData): Promise<boolean> {
  // Toss WebView 공유 — 딥링크 URL 사용
  if (isToss() && window.TossApp?.share) {
    window.TossApp.share({
      ...data,
      url: TOSS_DEEPLINK,
    })
    return true
  }

  // Web Share API (모바일 브라우저)
  if (navigator.share) {
    try {
      await navigator.share(data)
      return true
    } catch (e) {
      // 사용자가 취소한 경우
      if ((e as Error).name === 'AbortError') return false
    }
  }

  // 폴백: 클립보드 복사
  const text = data.url || data.text || ''
  if (text) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  return false
}

// ─── 위치 정보 ───────────────────────────────────────────

export interface LocationResult {
  latitude: number
  longitude: number
}

export async function getLocation(): Promise<LocationResult> {
  // Toss WebView 위치
  if (isToss() && window.TossApp?.getLocation) {
    return window.TossApp.getLocation()
  }

  // Web Geolocation API
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      }),
      (err) => reject(new Error(`Geolocation error: ${err.message}`)),
      { enableHighAccuracy: false, timeout: 10000 }
    )
  })
}

// ─── 네비게이션 ──────────────────────────────────────────

export const navigation = {
  /** 뒤로 가기 */
  back(): void {
    if (isToss() && window.TossApp?.back) {
      window.TossApp.back()
      return
    }
    window.history.back()
  },

  /** 앱/탭 닫기 */
  close(): void {
    if (isToss() && window.TossApp?.close) {
      window.TossApp.close()
      return
    }
    window.close()
  },

  /** 외부 URL 열기 (토스 WebView에서는 인앱브라우저로 오픈) */
  openExternal(url: string): void {
    if (isToss()) {
      // 토스 WebView에서는 location.href로 이동하여 인앱브라우저로 열기
      window.location.href = url
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  },
}

// ─── 햅틱 피드백 ─────────────────────────────────────────

export function haptic(type: 'light' | 'medium' | 'heavy' = 'light'): void {
  // Web Vibration API (Android)
  if (navigator.vibrate) {
    const duration = type === 'heavy' ? 50 : type === 'medium' ? 30 : 10
    navigator.vibrate(duration)
  }
  // iOS/Toss에서는 네이티브 브릿지가 필요할 수 있음
}

// ─── 유틸리티 ────────────────────────────────────────────

/** 안전한 영역(노치 등) 감지 */
export function getSafeAreaInsets() {
  const style = getComputedStyle(document.documentElement)
  return {
    top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0', 10),
    bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0', 10),
    left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0', 10),
    right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0', 10),
  }
}
