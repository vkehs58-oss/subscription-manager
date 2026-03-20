import { useState } from 'react'
import type { SubscriptionData, MySubscription } from '../types'
import CategorySection from '../components/CategorySection'
import ServiceCard from '../components/ServiceCard'

interface Props {
  subscriptionData: SubscriptionData
  onTogglePlan: (sub: MySubscription) => void
  isSubscribed: (serviceId: string, planName: string) => boolean
  search: string
  onSearchChange: (v: string) => void
}

// #5 인기 서비스 목록
const POPULAR_SERVICES = [
  { id: 'netflix', label: '넷플릭스', emoji: '🎬' },
  { id: 'youtube-premium', label: '유튜브 프리미엄', emoji: '▶️' },
  { id: 'coupang-rocket-wow', label: '쿠팡 로켓와우', emoji: '📦' },
  { id: 'spotify', label: '스포티파이', emoji: '🎵' },
  { id: 'chatgpt-plus', label: 'ChatGPT Plus', emoji: '🤖' },
  { id: 'tving', label: '티빙', emoji: '📺' },
  { id: 'wavve', label: '웨이브', emoji: '🌊' },
]

export default function BrowsePage({
  subscriptionData,
  onTogglePlan,
  isSubscribed,
  search,
  onSearchChange,
}: Props) {
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [openSvc, setOpenSvc] = useState<string | null>(null)

  const toggleCat = (id: string) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setOpenSvc(null)
  }

  // #5 인기 서비스 탭 → 검색 + 카드 오픈
  const handlePopularTap = (serviceId: string) => {
    const found = subscriptionData.categories
      .flatMap(c => c.services)
      .find(s => s.id === serviceId)
    if (found) {
      onSearchChange(found.name)
      setOpenSvc(serviceId)
    }
  }

  const q = search.trim().toLowerCase()
  const searchResults = q
    ? subscriptionData.categories.flatMap(cat =>
        cat.services
          .filter(svc =>
            svc.name.toLowerCase().includes(q) || svc.provider.toLowerCase().includes(q)
          )
          .map(svc => ({ ...svc, category: cat }))
      )
    : []

  return (
    <div className="pt-3 pb-8 flex flex-col gap-3">
      {/* #5 인기 서비스 빠른 추가 - 검색 중이 아닐 때만 */}
      {!q && (
        <div className="px-4">
          <p className="text-[12px] font-bold text-toss-gray-500 mb-2">인기 서비스</p>
          <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
            {POPULAR_SERVICES.map(p => {
              const svc = subscriptionData.categories
                .flatMap(c => c.services)
                .find(s => s.id === p.id)
              const subbed = svc?.plans.some(pl => isSubscribed(p.id, pl.name))
              return (
                <button
                  key={p.id}
                  onClick={() => handlePopularTap(p.id)}
                  className={`flex-none flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all active:scale-95 ${
                    subbed
                      ? 'bg-toss-blue text-white shadow-sm'
                      : 'bg-white text-toss-gray-800 shadow-sm ring-1 ring-toss-gray-200'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span>{p.label}</span>
                  {subbed && <span className="text-[10px]">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 검색 결과 or 카테고리 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {q ? (
          searchResults.length > 0 ? (
            searchResults.map(({ category, ...svc }) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                categoryIcon={category.icon}
                categoryColor={category.id}
                isOpen={openSvc === svc.id}
                onToggleOpen={() => setOpenSvc(openSvc === svc.id ? null : svc.id)}
                onTogglePlan={onTogglePlan}
                isSubscribed={isSubscribed}
              />
            ))
          ) : (
            <div className="text-center py-12 flex flex-col items-center gap-3">
              <div className="text-[32px]">🔍</div>
              <div className="text-[14px] text-toss-gray-400">검색 결과가 없어요</div>
              <button
                onClick={() => onSearchChange('')}
                className="mt-1 text-[13px] font-semibold text-toss-blue"
              >
                검색 초기화
              </button>
            </div>
          )
        ) : (
          subscriptionData.categories.map(cat => (
            <CategorySection
              key={cat.id}
              category={cat}
              isOpen={openCats.has(cat.id)}
              onToggle={() => toggleCat(cat.id)}
              openSvc={openSvc}
              onToggleSvc={(id) => setOpenSvc(openSvc === id ? null : id)}
              onTogglePlan={onTogglePlan}
              isSubscribed={isSubscribed}
            />
          ))
        )}
      </div>
    </div>
  )
}
