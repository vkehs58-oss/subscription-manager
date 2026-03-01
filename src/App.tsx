import { useState } from 'react'
import data from '../subscriptions.json'
import type { SubscriptionData, MySubscription } from './types'
import Header from './components/Header'
import CategorySection from './components/CategorySection'
import ServiceCard from './components/ServiceCard'
import MyPage from './components/MyPage'

const subscriptionData = data as SubscriptionData

type Tab = 'browse' | 'my'

function App() {
  const [tab, setTab] = useState<Tab>('browse')
  const [openCats, setOpenCats] = useState<Set<string>>(new Set())
  const [openSvc, setOpenSvc] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mySubscriptions, setMySubscriptions] = useState<MySubscription[]>(() => {
    const saved = localStorage.getItem('mySubscriptions')
    return saved ? JSON.parse(saved) : []
  })

  const save = (subs: MySubscription[]) => {
    setMySubscriptions(subs)
    localStorage.setItem('mySubscriptions', JSON.stringify(subs))
  }

  const toggle = (sub: MySubscription) => {
    const exists = mySubscriptions.find(
      s => s.serviceId === sub.serviceId && s.planName === sub.planName
    )
    if (exists) {
      save(mySubscriptions.filter(s => !(s.serviceId === sub.serviceId && s.planName === sub.planName)))
    } else {
      save([...mySubscriptions, sub])
    }
  }

  const isSubscribed = (serviceId: string, planName: string) =>
    mySubscriptions.some(s => s.serviceId === serviceId && s.planName === planName)

  const toggleCat = (id: string) => {
    setOpenCats(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
    setOpenSvc(null)
  }

  const q = search.trim().toLowerCase()
  const searchResults = q
    ? subscriptionData.categories.flatMap(cat =>
        cat.services
          .filter(svc => svc.name.toLowerCase().includes(q) || svc.provider.toLowerCase().includes(q))
          .map(svc => ({ ...svc, category: cat }))
      )
    : []

  return (
    <div className="min-h-screen bg-toss-gray-100">
      <div className="max-w-lg mx-auto">
        <Header myCount={mySubscriptions.length} tab={tab} setTab={setTab} />

        {tab === 'browse' ? (
          <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
            {/* 검색바 */}
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-toss-gray-400" width="16" height="16" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setOpenSvc(null) }}
                placeholder="서비스명으로 검색"
                className="w-full h-10 pl-10 pr-9 rounded-xl bg-white text-[14px] text-toss-gray-900 placeholder:text-toss-gray-400 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue transition-shadow"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-toss-gray-300 flex items-center justify-center"
                >
                  <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                    <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

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
                    onTogglePlan={toggle}
                    isSubscribed={isSubscribed}
                  />
                ))
              ) : (
                <div className="text-center py-12 text-[14px] text-toss-gray-400">
                  검색 결과가 없어요
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
                  onTogglePlan={toggle}
                  isSubscribed={isSubscribed}
                />
              ))
            )}
          </div>
        ) : (
          <MyPage
            mySubscriptions={mySubscriptions}
            categories={subscriptionData.categories}
            onRemove={(sid, pn) => save(mySubscriptions.filter(s => !(s.serviceId === sid && s.planName === pn)))}
            onUpdate={save}
          />
        )}

        <div className="text-center pt-2 pb-6 px-4">
          <p className="text-[11px] text-toss-gray-400 leading-relaxed">
            * 요금은 2026년 2월 기준이며 변동될 수 있습니다.
            <br />
            * USD 환산 기준: 1달러 = 1,370원
          </p>
        </div>

        <div className="mx-4 mb-10 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-full bg-toss-blue/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                <rect x="2" y="4" width="16" height="12" rx="2" stroke="#3182F6" strokeWidth="1.5"/>
                <path d="M2 7L10 12L18 7" stroke="#3182F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[14px] font-bold text-toss-gray-900">추가 요청</span>
          </div>
          <p className="text-[13px] text-toss-gray-600 leading-relaxed">
            추가되었으면 좋겠는 구독 서비스나 멤버십이 있다면
            <br />아래 이메일로 알려주세요. 확인 후 추가해 드릴게요!
          </p>
          <a
            href="mailto:vkehs58@gmail.com"
            className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-toss-blue"
          >
            📧 vkehs58@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
