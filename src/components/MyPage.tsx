import { useState, useRef, useCallback } from 'react'
import type { MySubscription, Category } from '../types'
import { navigation } from '../lib/platform'

interface Props {
  mySubscriptions: MySubscription[]
  categories: Category[]
  onRemove: (serviceId: string, planName: string) => void
  onUpdate: (subs: MySubscription[]) => void
}

const USD_KRW = Number(import.meta.env.VITE_USD_KRW) || 1370

function toKRW(p: number, c?: string) { return c === 'USD' ? p * USD_KRW : p }
function fmt(p: number, c?: string) {
  if (p === 0) return '무료'
  return c === 'USD' ? `$${p}` : `${p.toLocaleString()}원`
}

// #1 서비스 도메인 매핑 (MyPage 구독 목록 아이콘용)
const SERVICE_DOMAINS: Record<string, string> = {
  'netflix': 'netflix.com',
  'youtube-premium': 'youtube.com',
  'spotify': 'spotify.com',
  'chatgpt-plus': 'openai.com',
  'coupang-rocket-wow': 'coupang.com',
  'claude': 'anthropic.com',
  'disney-plus': 'disneyplus.com',
  'apple-music': 'apple.com',
  'naver-plus': 'naver.com',
  'kakao-t': 'kakao.com',
  'wavve': 'wavve.com',
  'tving': 'tving.com',
  'millie': 'millie.co.kr',
  'melon': 'melon.com',
  'webtoon': 'webtoon.com',
}

function SubLogo({ serviceId, name, bg }: { serviceId: string; name: string; bg?: string }) {
  const [failed, setFailed] = useState(false)
  const domain = SERVICE_DOMAINS[serviceId]

  if (domain && !failed) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
        style={{ background: bg || '#f2f4f6' }}
      >
        <img
          src={`https://logo.clearbit.com/${domain}`}
          alt={name}
          className="w-6 h-6 object-contain"
          onError={() => setFailed(true)}
        />
      </div>
    )
  }

  return (
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-extrabold shrink-0 text-toss-gray-700"
      style={{ background: bg || '#f2f4f6' }}
    >
      {name.charAt(0)}
    </div>
  )
}

// 카테고리 색상
const CAT_COLORS: Record<string, string> = {
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

export default function MyPage({ mySubscriptions, categories, onRemove, onUpdate }: Props) {
  const [yearly, setYearly] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [revealedId, setRevealedId] = useState<string | null>(null)
  // #2 confirmReset state
  const [confirmReset, setConfirmReset] = useState(false)
  // #8 커스텀 구독 폼
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customDay, setCustomDay] = useState('')
  // #6 스와이프 힌트
  const swipeHintShown = typeof localStorage !== 'undefined'
    ? localStorage.getItem('swipeHintShown') === '1'
    : true

  const touchRef = useRef<{ startX: number; startY: number; key: string } | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent, key: string) => {
    touchRef.current = { startX: e.touches[0].clientX, startY: e.touches[0].clientY, key }
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchRef.current) return
    const diffX = touchRef.current.startX - e.changedTouches[0].clientX
    const diffY = Math.abs(touchRef.current.startY - e.changedTouches[0].clientY)
    if (diffY > 30) { touchRef.current = null; return }
    if (diffX > 60) {
      // 스와이프 힌트 저장
      if (!swipeHintShown) {
        localStorage.setItem('swipeHintShown', '1')
      }
      setRevealedId(touchRef.current.key)
    } else if (diffX < -30) {
      setRevealedId(null)
    }
    touchRef.current = null
  }, [swipeHintShown])

  // #8 커스텀 구독 추가
  const handleAddCustom = () => {
    const price = parseInt(customPrice.replace(/,/g, ''), 10)
    if (!customName.trim() || isNaN(price) || price <= 0) return
    const newSub: MySubscription = {
      serviceId: `custom-${Date.now()}`,
      planName: '월간',
      price,
      isCustom: true,
      customName: customName.trim(),
      paymentDay: customDay ? parseInt(customDay, 10) : undefined,
    }
    onUpdate([...mySubscriptions, newSub])
    setCustomName('')
    setCustomPrice('')
    setCustomDay('')
    setShowCustomForm(false)
  }

  if (mySubscriptions.length === 0 && !showCustomForm) {
    return (
      <div
        className="flex flex-col items-center justify-center pt-28 px-6"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
      >
        <div className="w-20 h-20 rounded-full bg-toss-gray-100 flex items-center justify-center text-[36px] mb-5">
          💳
        </div>
        <div className="text-[18px] font-bold text-toss-gray-900 mb-2">
          구독 중인 서비스가 없어요
        </div>
        <div className="text-[14px] text-center leading-relaxed text-toss-gray-500 mb-6">
          둘러보기에서 사용 중인 서비스를<br />탭해서 추가해보세요
        </div>
        {/* #8 빈 상태에서도 직접 추가하기 */}
        <button
          onClick={() => setShowCustomForm(true)}
          className="w-full max-w-xs py-3.5 rounded-2xl border-2 border-dashed border-toss-gray-300 text-[14px] font-semibold text-toss-gray-500 flex items-center justify-center gap-2"
        >
          <span className="text-lg">+</span> 직접 추가하기
        </button>
        {showCustomForm && (
          <CustomForm
            name={customName} setName={setCustomName}
            price={customPrice} setPrice={setCustomPrice}
            day={customDay} setDay={setCustomDay}
            onAdd={handleAddCustom}
            onCancel={() => setShowCustomForm(false)}
          />
        )}
      </div>
    )
  }

  const monthlyTotal = mySubscriptions.reduce((s, sub) => s + toKRW(sub.price, sub.currency), 0)
  const yearlyTotal = mySubscriptions.reduce((s, sub) => {
    const monthly = toKRW(sub.price, sub.currency)
    return s + (sub.yearlyPrice ? sub.yearlyPrice : monthly * 12)
  }, 0)

  // 카테고리별 그룹화
  const grouped: { cat: Category; items: { sub: MySubscription; name: string; catId: string }[] }[] = []
  // 커스텀 구독용 가상 카테고리
  const customItems: { sub: MySubscription; name: string; catId: string }[] = []

  for (const sub of mySubscriptions) {
    if (sub.isCustom) {
      customItems.push({ sub, name: sub.customName || sub.serviceId, catId: 'custom' })
      continue
    }
    for (const cat of categories) {
      const svc = cat.services.find(s => s.id === sub.serviceId)
      if (svc) {
        let g = grouped.find(x => x.cat.id === cat.id)
        if (!g) { g = { cat, items: [] }; grouped.push(g) }
        g.items.push({ sub, name: svc.name, catId: cat.id })
        break
      }
    }
  }

  // #7 이번달 결제 예정 (오늘 이후 결제일 순, 최대 3개)
  const today = new Date().getDate()
  const upcomingPayments = mySubscriptions
    .filter(sub => sub.paymentDay !== undefined)
    .map(sub => {
      const name = sub.isCustom
        ? (sub.customName || sub.serviceId)
        : categories.flatMap(c => c.services).find(s => s.id === sub.serviceId)?.name || sub.serviceId
      return { sub, name }
    })
    .filter(({ sub }) => sub.paymentDay! >= today)
    .sort((a, b) => a.sub.paymentDay! - b.sub.paymentDay!)
    .slice(0, 3)

  // #9 카테고리별 지출 계산
  const catSpending: { id: string; icon: string; name: string; amount: number }[] = []
  for (const g of grouped) {
    const amount = g.items.reduce((s, { sub }) => s + toKRW(sub.price, sub.currency), 0)
    if (amount > 0) catSpending.push({ id: g.cat.id, icon: g.cat.icon, name: g.cat.name, amount })
  }
  if (customItems.length > 0) {
    const amount = customItems.reduce((s, { sub }) => s + toKRW(sub.price, sub.currency), 0)
    if (amount > 0) catSpending.push({ id: 'custom', icon: '✏️', name: '직접 추가', amount })
  }
  const maxCatAmount = Math.max(...catSpending.map(c => c.amount), 1)

  const updateSub = (serviceId: string, planName: string, patch: Partial<MySubscription>) => {
    onUpdate(mySubscriptions.map(s =>
      s.serviceId === serviceId && s.planName === planName ? { ...s, ...patch } : s
    ))
  }

  // 카드 렌더링 함수
  const renderItem = (
    { sub, name, catId }: { sub: MySubscription; name: string; catId: string },
    index: number,
    isFirst: boolean
  ) => {
    const key = `${sub.serviceId}-${sub.planName}`
    const isEditing = editingId === key
    const isRevealed = revealedId === key
    const cancelUrl = sub.isCustom
      ? undefined
      : categories.flatMap(c => c.services).find(s => s.id === sub.serviceId)?.cancelUrl

    return (
      <div key={key} className="relative overflow-hidden">
        {index > 0 && <div className="mx-4 h-px bg-toss-gray-100 relative z-10" />}
        {/* 삭제 버튼 */}
        <button
          onClick={() => { onRemove(sub.serviceId, sub.planName); setRevealedId(null) }}
          className="absolute right-0 top-0 bottom-0 w-20 bg-toss-red flex flex-col items-center justify-center gap-1 active:bg-red-600 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M5 7H15L14.2 16.3C14.1 17.3 13.2 18 12.2 18H7.8C6.8 18 5.9 17.3 5.8 16.3L5 7Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.5 7H16.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 3H12C12.6 3 13 3.4 13 4V7H7V4C7 3.4 7.4 3 8 3Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[11px] font-bold text-white">삭제</span>
        </button>

        {/* 메인 컨텐츠 */}
        <div
          className="relative bg-white transition-transform duration-200 ease-out"
          style={{ transform: isRevealed ? 'translateX(-80px)' : 'translateX(0)' }}
          onTouchStart={e => handleTouchStart(e, key)}
          onTouchEnd={handleTouchEnd}
        >
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3.5">
              {sub.isCustom ? (
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-extrabold shrink-0 text-toss-gray-700 bg-toss-gray-100">
                  {name.charAt(0)}
                </div>
              ) : (
                <SubLogo
                  serviceId={sub.serviceId}
                  name={name}
                  bg={CAT_COLORS[catId] || '#f2f4f6'}
                />
              )}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => { setEditingId(isEditing ? null : key); setRevealedId(null) }}
              >
                <div className="flex items-center gap-1.5">
                  <div className="text-[15px] font-bold text-toss-gray-900">{name}</div>
                  {sub.isCustom && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-toss-gray-100 text-toss-gray-500">직접추가</span>
                  )}
                </div>
                <div className="text-[12px] mt-0.5 text-toss-gray-500 flex items-center gap-1.5">
                  <span>{sub.planName}</span>
                  {sub.paymentDay && (
                    <>
                      <span className="text-toss-gray-300">·</span>
                      <span>매월 {sub.paymentDay}일</span>
                    </>
                  )}
                </div>
                {sub.memo && (
                  <div className="text-[11px] mt-1 text-toss-gray-400">{sub.memo}</div>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[15px] font-extrabold text-toss-gray-900">
                  {yearly && sub.yearlyPrice
                    ? `${sub.yearlyPrice.toLocaleString()}원`
                    : fmt(sub.price, sub.currency)}
                </span>
                {!yearly && sub.currency === 'USD' && (
                  <div className="text-[11px] text-toss-gray-400">약 {toKRW(sub.price, sub.currency).toLocaleString()}원</div>
                )}
                {yearly && sub.yearlyPrice && (
                  <div className="text-[11px] text-toss-gray-400">월 {fmt(sub.price, sub.currency)}</div>
                )}
                {yearly && !sub.yearlyPrice && (
                  <div className="text-[11px] text-toss-gray-400">
                    연 {(toKRW(sub.price, sub.currency) * 12).toLocaleString()}원
                  </div>
                )}
              </div>
            </div>

            {/* #6 스와이프 힌트 - 첫 번째 카드, 미표시 상태일 때 */}
            {isFirst && !swipeHintShown && (
              <div className="mt-2 flex items-center gap-1 text-[11px] text-toss-gray-400 animate-fade-slide">
                <span>←</span>
                <span>스와이프해서 삭제</span>
              </div>
            )}

            {/* 결제일/메모/해지 편집 */}
            {isEditing && (
              <div className="animate-fade-slide mt-3 pt-3 border-t border-toss-gray-100 flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-semibold text-toss-gray-500 w-14 shrink-0">결제일</label>
                  <select
                    value={sub.paymentDay || ''}
                    onChange={e => updateSub(sub.serviceId, sub.planName, {
                      paymentDay: e.target.value ? Number(e.target.value) : undefined
                    })}
                    className="flex-1 h-8 px-3 rounded-lg bg-toss-gray-50 text-[13px] text-toss-gray-900 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue"
                  >
                    <option value="">선택 안 함</option>
                    {Array.from({ length: 31 }, (_, i) => (
                      <option key={i + 1} value={i + 1}>매월 {i + 1}일</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[12px] font-semibold text-toss-gray-500 w-14 shrink-0">메모</label>
                  <input
                    type="text"
                    value={sub.memo || ''}
                    onChange={e => updateSub(sub.serviceId, sub.planName, { memo: e.target.value || undefined })}
                    placeholder="예: 가족 공유 계정"
                    className="flex-1 h-8 px-3 rounded-lg bg-toss-gray-50 text-[13px] text-toss-gray-900 placeholder:text-toss-gray-400 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue"
                  />
                </div>
                {/* #14 해지 링크 - cancelUrl 있을 때만 */}
                {cancelUrl && (
                  <button
                    type="button"
                    onClick={() => navigation.openExternal(cancelUrl)}
                    className="flex items-center gap-1.5 text-[12px] font-semibold text-red-400 hover:text-red-500 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                      <path d="M10 4v8M10 15v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    해지 페이지 열기
                    <span className="text-[10px]">→</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="pb-8"
      style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
    >
      {/* #7 이번달 결제 예정 섹션 */}
      {upcomingPayments.length > 0 && (
        <div className="mx-4 mt-5 rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <span className="text-[13px] font-bold text-toss-gray-700">📅 이번달 결제 예정</span>
          </div>
          {upcomingPayments.map(({ sub, name }, i) => (
            <div key={`upcoming-${sub.serviceId}-${sub.planName}`}>
              {i > 0 && <div className="mx-4 h-px bg-toss-gray-100" />}
              <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SubLogo serviceId={sub.serviceId} name={name} />
                  <div>
                    <div className="text-[14px] font-semibold text-toss-gray-900">{name}</div>
                    <div className="text-[12px] text-toss-gray-400">매월 {sub.paymentDay}일</div>
                  </div>
                </div>
                <span className="text-[14px] font-extrabold text-toss-gray-900">
                  {fmt(sub.price, sub.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 총 구독료 카드 */}
      <div className="mx-4 mt-5 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-toss-blue to-toss-blue-dark shadow-lg">
        <div className="relative z-10">
          <div className="inline-flex bg-white/15 rounded-full p-0.5 mb-3">
            <button
              onClick={() => setYearly(false)}
              className={`text-[12px] font-bold px-4 py-1.5 rounded-full transition-all ${
                !yearly ? 'bg-white text-toss-blue shadow-sm' : 'text-white/60'
              }`}
            >월간</button>
            <button
              onClick={() => setYearly(true)}
              className={`text-[12px] font-bold px-4 py-1.5 rounded-full transition-all ${
                yearly ? 'bg-white text-toss-blue shadow-sm' : 'text-white/60'
              }`}
            >연간</button>
          </div>
          <div className="text-[13px] font-semibold text-white/60">
            {yearly ? '연간 구독료' : '월 구독료'}
          </div>
          <div className="text-[36px] font-extrabold text-white mt-1 tracking-[-1px]">
            {(yearly ? yearlyTotal : monthlyTotal).toLocaleString()}<span className="text-[20px] ml-0.5">원</span>
          </div>
          <div className="flex gap-8 mt-5 pt-4 border-t border-white/15">
            <div>
              <div className="text-[12px] font-medium text-white/45">
                {yearly ? '월간 환산' : '연간 예상'}
              </div>
              <div className="text-[16px] font-bold text-white mt-0.5">
                {(yearly ? monthlyTotal : yearlyTotal).toLocaleString()}원
              </div>
            </div>
            <div>
              <div className="text-[12px] font-medium text-white/45">구독 수</div>
              <div className="text-[16px] font-bold text-white mt-0.5">{mySubscriptions.length}개</div>
            </div>
          </div>
        </div>
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/[0.06]" />
        <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/[0.04]" />
      </div>

      {/* #9 카테고리별 지출 차트 */}
      {catSpending.length > 0 && (
        <div className="mx-4 mt-3 rounded-2xl bg-white shadow-sm p-4">
          <p className="text-[13px] font-bold text-toss-gray-700 mb-3">카테고리별 지출</p>
          <div className="flex flex-col gap-2.5">
            {catSpending.sort((a, b) => b.amount - a.amount).map(c => (
              <div key={c.id} className="flex items-center gap-2.5">
                <span className="text-[14px] w-6 text-center">{c.icon}</span>
                <span className="text-[12px] text-toss-gray-600 w-16 shrink-0 truncate">{c.name}</span>
                <div className="flex-1 h-2 bg-toss-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-toss-blue rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((c.amount / maxCatAmount) * 100)}%` }}
                  />
                </div>
                <span className="text-[12px] font-bold text-toss-gray-800 w-16 text-right shrink-0">
                  {c.amount.toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 구독 목록 */}
      {grouped.map(({ cat, items }) => (
        <div key={cat.id} className="mt-5">
          <div className="px-5 mb-2">
            <span className="text-[13px] font-bold text-toss-gray-500">
              {cat.icon} {cat.name}
            </span>
          </div>
          <div className="mx-4 rounded-2xl overflow-hidden bg-white shadow-sm">
            {items.map(({ sub, name, catId }, i) =>
              renderItem({ sub, name, catId }, i, i === 0 && grouped[0].cat.id === cat.id)
            )}
          </div>
        </div>
      ))}

      {/* 커스텀 구독 그룹 */}
      {customItems.length > 0 && (
        <div className="mt-5">
          <div className="px-5 mb-2">
            <span className="text-[13px] font-bold text-toss-gray-500">✏️ 직접 추가</span>
          </div>
          <div className="mx-4 rounded-2xl overflow-hidden bg-white shadow-sm">
            {customItems.map(({ sub, name, catId }, i) =>
              renderItem({ sub, name, catId }, i, false)
            )}
          </div>
        </div>
      )}

      {/* #8 직접 추가하기 버튼 */}
      <div className="mx-4 mt-4">
        {!showCustomForm ? (
          <button
            onClick={() => setShowCustomForm(true)}
            className="w-full py-4 rounded-2xl border-2 border-dashed border-toss-gray-300 text-[14px] font-semibold text-toss-gray-500 flex items-center justify-center gap-2 transition-colors active:bg-toss-gray-50"
          >
            <span className="text-lg">+</span> 직접 추가하기
          </button>
        ) : (
          <CustomForm
            name={customName} setName={setCustomName}
            price={customPrice} setPrice={setCustomPrice}
            day={customDay} setDay={setCustomDay}
            onAdd={handleAddCustom}
            onCancel={() => setShowCustomForm(false)}
          />
        )}
      </div>

      {/* #2 초기화 버튼 - confirmReset 인라인 UI */}
      <div className="mt-6 flex justify-center">
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-[12px] text-toss-gray-400 underline decoration-toss-gray-300"
          >
            구독 목록 초기화
          </button>
        ) : (
          <div className="flex flex-col items-center gap-2 animate-fade-slide">
            <span className="text-[13px] font-semibold text-toss-gray-700">구독 목록을 모두 초기화할까요?</span>
            <div className="flex gap-2">
              <button
                onClick={() => { onUpdate([]); setConfirmReset(false) }}
                className="px-4 py-2 rounded-xl bg-toss-red text-white text-[13px] font-bold"
              >
                초기화
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 rounded-xl bg-toss-gray-100 text-toss-gray-700 text-[13px] font-bold"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// #8 커스텀 구독 추가 폼 컴포넌트
function CustomForm({
  name, setName,
  price, setPrice,
  day, setDay,
  onAdd, onCancel,
}: {
  name: string; setName: (v: string) => void
  price: string; setPrice: (v: string) => void
  day: string; setDay: (v: string) => void
  onAdd: () => void
  onCancel: () => void
}) {
  return (
    <div className="rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-3 animate-fade-slide">
      <p className="text-[14px] font-bold text-toss-gray-900">직접 추가하기</p>
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-semibold text-toss-gray-500 w-16 shrink-0">서비스명</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 라프텔"
          className="flex-1 h-9 px-3 rounded-lg bg-toss-gray-50 text-[13px] text-toss-gray-900 placeholder:text-toss-gray-400 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-semibold text-toss-gray-500 w-16 shrink-0">월 요금</label>
        <div className="flex-1 flex items-center gap-1">
          <input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="예: 9900"
            className="flex-1 h-9 px-3 rounded-lg bg-toss-gray-50 text-[13px] text-toss-gray-900 placeholder:text-toss-gray-400 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue"
          />
          <span className="text-[13px] text-toss-gray-500">원</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-[12px] font-semibold text-toss-gray-500 w-16 shrink-0">결제일</label>
        <select
          value={day}
          onChange={e => setDay(e.target.value)}
          className="flex-1 h-9 px-3 rounded-lg bg-toss-gray-50 text-[13px] text-toss-gray-900 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue"
        >
          <option value="">선택 안 함</option>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 1} value={i + 1}>매월 {i + 1}일</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 pt-1">
        <button
          onClick={onAdd}
          disabled={!name.trim() || !price}
          className="flex-1 py-2.5 rounded-xl bg-toss-blue text-white text-[14px] font-bold disabled:opacity-40"
        >
          추가
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl bg-toss-gray-100 text-toss-gray-700 text-[14px] font-bold"
        >
          취소
        </button>
      </div>
    </div>
  )
}
