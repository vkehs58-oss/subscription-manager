import type { Category, MySubscription } from '../types'
import ServiceCard from './ServiceCard'

interface Props {
  category: Category
  isOpen: boolean
  onToggle: () => void
  openSvc: string | null
  onToggleSvc: (id: string) => void
  onTogglePlan: (sub: MySubscription) => void
  isSubscribed: (serviceId: string, planName: string) => boolean
}

export default function CategorySection({
  category: cat,
  isOpen,
  onToggle,
  openSvc,
  onToggleSvc,
  onTogglePlan,
  isSubscribed,
}: Props) {
  const subbedCount = cat.services.reduce(
    (n, svc) => n + (svc.plans.some(p => isSubscribed(svc.id, p.name)) ? 1 : 0),
    0,
  )

  return (
    <div>
      {/* 카테고리 헤더 */}
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-3 text-left bg-white rounded-2xl shadow-sm active:bg-toss-gray-50 transition-colors"
      >
        <span className="text-[22px]">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-toss-gray-900">{cat.name}</span>
            <span className="text-[12px] text-toss-gray-400">{cat.services.length}개</span>
            {subbedCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-toss-blue-light text-toss-blue">
                {subbedCount}개 구독중
              </span>
            )}
          </div>
        </div>
        <svg
          className="shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : '' }}
          width="16" height="16" viewBox="0 0 20 20" fill="none"
        >
          <path d="M5 7.5L10 12.5L15 7.5" stroke="#B0B8C1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 서비스 목록 */}
      {isOpen && (
        <div className="animate-fade-slide flex flex-col gap-2.5 mt-2.5 ml-3">
          {cat.services.map(svc => (
            <ServiceCard
              key={svc.id}
              service={svc}
              categoryIcon={cat.icon}
              categoryColor={cat.id}
              isOpen={openSvc === svc.id}
              onToggleOpen={() => onToggleSvc(svc.id)}
              onTogglePlan={onTogglePlan}
              isSubscribed={isSubscribed}
            />
          ))}
        </div>
      )}
    </div>
  )
}
