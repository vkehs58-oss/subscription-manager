import type { Service, MySubscription } from '../types'

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
  const displayPrice = (p: { price: number; yearlyPrice?: number }) => p.yearlyPrice ?? p.price
  const cheapest = svc.plans.filter(p => displayPrice(p) > 0).sort((a, b) => displayPrice(a) - displayPrice(b))[0]
  const subbed = svc.plans.some(p => isSubscribed(svc.id, p.name))
  const iconBg = ICON_COLORS[categoryColor] || '#F2F4F6'

  return (
    <div className={`bg-white rounded-2xl transition-shadow ${isOpen ? 'shadow-md ring-1 ring-toss-blue/20' : 'shadow-sm'}`}>
      {/* 서비스 헤더 */}
      <button
        onClick={onToggleOpen}
        className="w-full px-4 py-4 flex items-center gap-3.5 text-left transition-colors active:bg-toss-gray-50 rounded-2xl"
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-[15px] font-extrabold shrink-0 text-toss-gray-700"
          style={{ background: iconBg }}
        >
          {svc.name.charAt(0)}
        </div>
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
          {cheapest ? `${fmtPrice(displayPrice(cheapest), cur)}~` : '무료'}
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
              return (
                <button
                  key={plan.name}
                  onClick={() => onTogglePlan({
                    serviceId: svc.id,
                    planName: plan.name,
                    price: plan.price,
                    currency: plan.currency || cur,
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
                      <span className={`text-[15px] font-extrabold ${
                        displayPrice(plan) === 0 ? 'text-toss-green' : 'text-toss-gray-900'
                      }`}>
                        {fmtPrice(displayPrice(plan), plan.currency || cur)}
                      </span>
                      {active ? (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-toss-blue text-white whitespace-nowrap">
                          ✓ 구독중
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-toss-gray-100 text-toss-gray-600 whitespace-nowrap">
                          + 추가
                        </span>
                      )}
                    </div>
                  </div>
                  {plan.features.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 ml-[30px]">
                      {plan.features.map((f, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-toss-gray-100 text-toss-gray-500">
                          {f}
                        </span>
                      ))}
                    </div>
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
