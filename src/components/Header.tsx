interface Props {
  myCount: number
  tab: 'browse' | 'my'
  setTab: (t: 'browse' | 'my') => void
  search: string
  onSearchChange: (v: string) => void
}

export default function Header({ myCount, tab, setTab, search, onSearchChange }: Props) {
  return (
    <div className="bg-white sticky top-0 z-20 shadow-sm">
      {/* 헤더 로고 영역 - compact */}
      <div
        className="px-5 pb-3 flex items-center gap-3"
        style={{ paddingTop: 'max(40px, env(safe-area-inset-top))' }}
      >
        <img
          src="/logo.png"
          alt="내 구독 얼마"
          className="w-9 h-9 rounded-xl shadow-sm"
        />
        <div>
          <h1 className="text-[18px] font-extrabold tracking-[-0.5px] text-toss-gray-900">
            내 구독 얼마
          </h1>
        </div>
      </div>

      {/* 탭 전환 */}
      <div className="px-5 pb-3">
        <div className="flex bg-toss-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('browse')}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all ${
              tab === 'browse'
                ? 'bg-white text-toss-blue shadow-sm'
                : 'text-toss-gray-500'
            }`}
          >
            둘러보기
          </button>
          <button
            onClick={() => setTab('my')}
            className={`flex-1 py-2.5 rounded-lg text-[14px] font-bold transition-all flex items-center justify-center gap-1.5 ${
              tab === 'my'
                ? 'bg-white text-toss-blue shadow-sm'
                : 'text-toss-gray-500'
            }`}
          >
            내 구독
            {myCount > 0 && (
              <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-extrabold rounded-full ${
                tab === 'my' ? 'bg-toss-blue text-white' : 'bg-toss-gray-300 text-white'
              }`}>
                {myCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 검색바 - 둘러보기 탭에서만 표시 (sticky) */}
      {tab === 'browse' && (
        <div className="px-4 pb-3">
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-toss-gray-400"
              width="16" height="16" viewBox="0 0 20 20" fill="none"
            >
              <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
              <path d="M13.5 13.5L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              placeholder="서비스명으로 검색"
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-toss-gray-100 text-[14px] text-toss-gray-900 placeholder:text-toss-gray-400 outline-none ring-1 ring-toss-gray-200 focus:ring-toss-blue transition-shadow"
            />
            {search && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-toss-gray-300 flex items-center justify-center"
              >
                <svg width="8" height="8" viewBox="0 0 10 10" fill="none">
                  <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
