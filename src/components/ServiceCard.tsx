import { useState } from 'react'
import type { Service, MySubscription } from '../types'
import { navigation } from '../lib/platform'

interface Props {
  service: Service
  categoryIcon: string
  categoryColor: string
  isOpen: boolean
  onToggleOpen: () => void
  onTogglePlan: (sub: MySubscription) => void
  isSubscribed: (serviceId: string, planName: string) => boolean
}

function fmtPrice(p: number, currency?: string): string {
  if (p === 0) return '무료'
  if (currency === 'USD') return `$${p}`
  return `${p.toLocaleString()}원`
}

const ICON_COLORS: Record<string, string> = {
  delivery: '#FFF3E0',
  ott: '#E3F2FD',
  music: '#FCE4EC',
  cloud: '#E0F7FA',
  ebook: '#F3E5F5',
  gaming: '#E8F5E9',
  finance: '#E8F3FF',
  social: '#FFF8E1',
  ai: '#EDE7F6',
}

// Simple Icons CDN 슬러그 (글로벌 서비스 — MIT 라이선스)
// https://simpleicons.org 에서 슬러그 확인 가능
const SIMPLE_ICONS: Record<string, string> = {
  'netflix':          'netflix',
  'spotify':          'spotify',
  'youtube-premium':  'youtube',
  'disney-plus':      'disneyplus',
  'apple-music':      'applemusic',
  'icloud':           'icloud',
  'google-one':       'google',
  'ms365':            'microsoft365',
  'xbox-gamepass':    'xbox',
  'nintendo-online':  'nintendo',
  'ps-plus':          'playstation',
  'chatgpt':          'openai',
  'claude':           'anthropic',
  'gemini':           'googlegemini',
  'perplexity':       'perplexity',
  'xai':              'x',
}

// 한국/브랜드 서비스 컬러 이니셜 (저작권 없음, 브랜드 컬러로 즉시 인식)
const BRAND_COLORS: Record<string, { bg: string; text: string }> = {
  'naver-plus':     { bg: '#03C75A', text: '#fff' },
  'coupang-wow':    { bg: '#FF6000', text: '#fff' },
  'yogipass-x':     { bg: '#FC4D2A', text: '#fff' },
  'baemin-club':    { bg: '#2AC1BC', text: '#fff' },
  'tving':          { bg: '#FF153C', text: '#fff' },
  'wavve':          { bg: '#007DFF', text: '#fff' },
  'watcha':         { bg: '#FF0558', text: '#fff' },
  'melon':          { bg: '#00CD3C', text: '#000' },
  'kakao-emoticon': { bg: '#FEE500', text: '#3A1D1D' },
  'toss-prime':     { bg: '#0064FF', text: '#fff' },
  'kia-flex':       { bg: '#BB162B', text: '#fff' },
}

interface LogoIconProps {
  serviceId: string
  serviceName: string
  bg: string
}

function LogoIcon({ serviceId, serviceName, bg }: LogoIconProps) {
  const [iconFailed, setIconFailed] = useState(false)

  const simpleIconSlug = SIMPLE_ICONS[serviceId]
  const brandColor = BRAND_COLORS[serviceId]

  // 1순위: Simple Icons CDN (글로벌 서비스, SVG 벡터 품질)
  if (simpleIconSlug && !iconFailed) {
    return (
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: bg }}
      >
        <img
          src={`https://cdn.simpleicons.org/${simpleIconSlug}`}
          alt={serviceName}
          className="w-7 h-7 object-contain"
          onError={() => setIconFailed(true)}
        />
      </div>
    )
  }

  // 2순위: 브랜드 컬러 이니셜 (한국 서비스 — 브랜드 컬러 배경으로 즉시 인식)
  if (brandColor) {
    return (
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-[18px] font-black shrink-0"
        style={{ background: brandColor.bg, color: brandColor.text }}
      >
        {serviceName.charAt(0)}
      </div>
    )
  }

  // 3순위: 기본 이니셜 폴백
  return (
    <div
      className="w-11 h-11 rounded-2xl flex items-center justify-center text-[15px] font-extrabold shrink-0 text-toss-gray-700"
      style={{ background: bg }}
    >
      {serviceName.charAt(0)}
    </div>
  )
}

export default function ServiceCard({
  service: svc,
  categoryIcon,
  categoryColor,
  isOpen,
  onToggleOpen,
  onTogglePlan,
  isSubscribed,
}: Props) {
  const cur = svc.currency
  // #4 displayPrice 항상 월간(price) 기준
  const cheapest = svc.plans.filter(p => p.price > 0).sort((a, b) => a.price - b.price)[0]
  const subbed = svc.plans.some(p => isSubscribed(svc.id, p.name))
  const iconBg = ICON_COLORS[categoryColor] || '#F2F4F6'

  return (
    <div className={`bg-white rounded-2xl transition-shadow ${isOpen ? 'shadow-md ring-1 ring-toss-blue/20' : 'shadow-sm'}`}>
      {/* 서비스 헤더 */}
      <button
        onClick={onToggleOpen}
        className="w-full px-4 py-4 flex items-center gap-3.5 text-left transition-colors active:bg-toss-gray-50 rounded-2xl"
      >
        <LogoIcon serviceId={svc.id} serviceName={svc.name} bg={iconBg} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-toss-gray-900">{svc.name}</span>
            {subbed && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-toss-blue-light text-toss-blue">
                구독중
              </span>
            )}
          </div>
          <div className="text-[12px] mt-0.5 text-toss-gray-500">
            {svc.provider} · {svc.plans.length}개 요금제
          </div>
        </div>
        <span className="text-[14px] font-extrabold shrink-0 text-toss-blue">
          {cheapest ? `${fmtPrice(cheapest.price, cur)}~` : '무료'}
        </span>
        <svg
          className="shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : '' }}
          width="16" height="16" viewBox="0 0 20 20" fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 요금제 펼침 */}
      {isOpen && (
        <div className="animate-fade-slide px-4 pb-4">
          <div className="border-t border-toss-gray-100 pt-3 flex flex-col gap-2">
            {svc.plans.map(plan => {
              const active = isSubscribed(svc.id, plan.name)
              const planCur = plan.currency || cur
              // #12 연간 절약 뱃지
              const yearlySaving = plan.yearlyPrice && plan.price * 12 > plan.yearlyPrice
                ? plan.price * 12 - plan.yearlyPrice
                : 0
              return (
                <button
                  key={plan.name}
                  onClick={() => onTogglePlan({
                    serviceId: svc.id,
                    planName: plan.name,
                    price: plan.price,
                    currency: planCur,
                    yearlyPrice: plan.yearlyPrice,
                  })}
                  className={`w-full rounded-xl px-4 py-3 transition-all active:scale-[0.98] text-left ${
                    active
                      ? 'bg-toss-blue-light ring-2 ring-toss-blue'
                      : 'bg-toss-gray-50 ring-1 ring-toss-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <span className="text-[14px] font-semibold text-toss-gray-900">{plan.name}</span>
                      {plan.note && (
                        <p className="text-[11px] text-toss-gray-400 mt-0.5">{plan.note}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* #4 항상 월간 price 표시 */}
                      <span className={`text-[15px] font-extrabold ${
                        plan.price === 0 ? 'text-toss-green' : 'text-toss-gray-900'
                      }`}>
                        {fmtPrice(plan.price, planCur)}
                      </span>
                      {active ? (
                        <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-toss-blue text-white whitespace-nowrap border border-gray-100">
                          ✓ 구독중
                        </span>
                      ) : (
                        <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg bg-toss-gray-100 text-toss-gray-600 whitespace-nowrap border border-gray-100">
                          + 추가
                        </span>
                      )}
                    </div>
                  </div>
                  {/* #11 기능 태그 */}
                  {plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {plan.features.map((f, i) => (
                        <span
                          key={i}
                          className="text-[12px] px-2.5 py-1 rounded-lg bg-toss-gray-100 text-toss-gray-500 border border-gray-100"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* #12 연간 절약 뱃지 */}
                  {yearlySaving > 0 && (
                    <div className="mt-1.5">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-green-50 text-green-600">
                        연간 결제 시 {yearlySaving.toLocaleString()}원 절약
                      </span>
                    </div>
                  )}
                  {/* #14 해지 링크 (구독중일 때 카드 내 표시) */}
                  {active && svc.cancelUrl && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigation.openExternal(svc.cancelUrl!)
                      }}
                      className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-red-400 hover:text-red-500 transition-colors"
                    >
                      해지 페이지 열기 →
                    </button>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
