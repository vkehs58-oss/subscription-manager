import { useState, useEffect } from 'react'
import { useSubscriptions } from './hooks/useSubscriptions'
import Header from './components/Header'
import BrowsePage from './pages/BrowsePage'
import MyPage from './pages/MyPage'
import { isToss } from './lib/platform'

type Tab = 'browse' | 'my'

const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL || 'vkehs58@gmail.com'
const DATA_DATE = import.meta.env.VITE_DATA_DATE || '2026년 2월'

function App() {
  const [tab, setTab] = useState<Tab>('browse')

  // 토스 미니앱 뒤로가기 처리
  // 최초 화면(히스토리 없음)에서 뒤로가기 시 미니앱 종료
  useEffect(() => {
    if (!isToss()) return

    const handlePopState = () => {
      if (window.history.length <= 1) {
        window.TossApp?.close?.()
      }
    }

    // 초기 히스토리 엔트리 push (popstate 감지용)
    window.history.pushState(null, '', window.location.href)

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const [search, setSearch] = useState('')
  const { mySubscriptions, subscriptionData, toggle, remove, isSubscribed, update } = useSubscriptions()

  return (
    <div className="min-h-screen bg-toss-gray-100">
      <div className="max-w-lg mx-auto">
        <Header
          myCount={mySubscriptions.length}
          tab={tab}
          setTab={setTab}
          search={search}
          onSearchChange={setSearch}
        />

        {tab === 'browse' ? (
          <BrowsePage
            subscriptionData={subscriptionData}
            onTogglePlan={toggle}
            isSubscribed={isSubscribed}
            search={search}
            onSearchChange={setSearch}
          />
        ) : (
          <MyPage
            mySubscriptions={mySubscriptions}
            categories={subscriptionData.categories}
            onRemove={remove}
            onUpdate={update}
          />
        )}

        <div className="text-center pt-2 pb-6 px-4">
          <p className="text-[11px] text-toss-gray-400 leading-relaxed">
            * 요금은 {DATA_DATE} 기준이며 변동될 수 있습니다.
            <br />
            * USD 환산 기준: 1달러 = {import.meta.env.VITE_USD_KRW || '1,370'}원
          </p>
        </div>

        <div className="mx-4 mb-10 rounded-2xl bg-white p-5 shadow-sm pb-safe-extra">
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
            href={`mailto:${CONTACT_EMAIL}`}
            className="inline-flex items-center gap-1.5 mt-3 text-[13px] font-semibold text-toss-blue"
          >
            📧 {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
