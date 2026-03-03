import { useState, useRef, useCallback } from 'react'
import type { MySubscription, Category } from '../types'

interface Props {
  mySubscriptions: MySubscription[]
  categories: Category[]
  onRemove: (serviceId: string, planName: string) => void
  onUpdate: (subs: MySubscription[]) => void
}

const USD_KRW = 1370

function toKRW(p: number, c?: string) { return c === 'USD' ? p * USD_KRW : p }
function fmt(p: number, c?: string) {
  if (p === 0) return '무료'
  return c === 'USD' ? `$${p}` : `${p.toLocaleString()}원`
}

export default function MyPage({ mySubscriptions, categories, onRemove, onUpdate }: Props) {
  const [yearly, setYearly] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [revealedId, setRevealedId] = useState<string | null>(null)
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
      setRevealedId(touchRef.current.key)
    } else if (diffX < -30) {
      setRevealedId(null)
    }
    touchRef.current = null
  }, [])

  if (mySubscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-28 px-6">
        <div className="w-20 h-20 rounded-full bg-toss-gray-100 flex items-center justify-center text-[36px] mb-5">
          💳
        </div>
        <div className="text-[18px] font-bold text-toss-gray-900 mb-2">
          구독 중인 서비스가 없어요
        </div>
        <div className="text-[14px] text-center leading-relaxed text-toss-gray-500">
          둘러보기에서 사용 중인 서비스를<br />탭해서 추가해보세요
        </div>
      </div>
    )
  }

  const monthlyTotal = mySubscriptions.reduce((s, sub) => s + toKRW(sub.price, sub.currency), 0)
  const yearlyTotal = mySubscriptions.reduce((s, sub) => {
    const monthly = toKRW(sub.price, sub.currency)
    return s + (sub.yearlyPrice ? sub.yearlyPrice : monthly * 12)
  }, 0)

  const grouped: { cat: Category; items: { sub: MySubscription; name: string }[] }[] = []
  for (const sub of mySubscriptions) {
    for (const cat of categories) {
      const svc = cat.services.find(s => s.id === sub.serviceId)
      if (svc) {
        let g = grouped.find(x => x.cat.id === cat.id)
        if (!g) { g = { cat, items: [] }; grouped.push(g) }
        g.items.push({ sub, name: svc.name })
        break
      }
    }
  }

  const updateSub = (serviceId: string, planName: string, patch: Partial<MySubscription>) => {
    onUpdate(mySubscriptions.map(s =>
      s.serviceId === serviceId && s.planName === planName ? { ...s, ...patch } : s
    ))
  }

  return (
    <div className="pb-8">
      {/* 총 구독료 */}
      <div className="mx-4 mt-5 rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-toss-blue to-toss-blue-dark shadow-lg">
        <div className="relative z-10">
          {/* 월간/연간 토글 */}
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

      {/* 구독 목록 */}
      {grouped.map(({ cat, items }) => (
        <div key={cat.id} className="mt-5">
          <div className="px-5 mb-2">
            <span className="text-[13px] font-bold text-toss-gray-500">
              {cat.icon} {cat.name}
            </span>
          </div>
          <div className="mx-4 rounded-2xl overflow-hidden bg-white shadow-sm">
            {items.map(({ sub, name }, i) => {

              const key = `${sub.serviceId}-${sub.planName}`
              const isEditing = editingId === key
              const isRevealed = revealedId === key
              return (
                <div key={key} className="relative overflow-hidden">
                  {i > 0 && <div className="mx-4 h-px bg-toss-gray-100 relative z-10" />}
                  {/* 삭제 버튼 (뒤에 숨겨짐) */}
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
                  {/* 메인 컨텐츠 (스와이프로 이동) */}
                  <div
                    className="relative bg-white transition-transform duration-200 ease-out"
                    style={{ transform: isRevealed ? 'translateX(-80px)' : 'translateX(0)' }}
                    onTouchStart={e => handleTouchStart(e, key)}
                    onTouchEnd={handleTouchEnd}
                  >
                    <div className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[14px] font-extrabold shrink-0 text-toss-gray-700 bg-toss-gray-100">
                          {name.charAt(0)}
                        </div>
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => { setEditingId(isEditing ? null : key); setRevealedId(null) }}
                        >
                          <div className="text-[15px] font-bold text-toss-gray-900">{name}</div>
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

                      {/* 결제일/메모 편집 */}
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
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* 초기화 버튼 */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => {
            if (window.confirm('구독 목록을 모두 초기화할까요?')) {
              onUpdate([])
            }
          }}
          className="text-[12px] text-toss-gray-400 underline decoration-toss-gray-300"
        >
          구독 목록 초기화
        </button>
      </div>
    </div>
  )
}
