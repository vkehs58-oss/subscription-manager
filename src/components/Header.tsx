interface Props {
  myCount: number
  tab: 'browse' | 'my'
  setTab: (t: 'browse' | 'my') => void
}

export default function Header({ myCount, tab, setTab }: Props) {
  return (
    <div className="bg-white sticky top-0 z-20">
      <div className="px-5 pt-10 pb-4 flex items-center gap-3.5">
        <img
          src="/logo.png"
          alt="내 구독 얼마"
          className="w-14 h-14 rounded-2xl shadow-sm"
        />
        <div>
          <h1 className="text-[22px] font-extrabold tracking-[-0.5px] text-toss-gray-900">
            내 구독 얼마
          </h1>
          <p className="text-[12px] text-toss-gray-500 mt-0.5">구독 서비스 한눈에 비교하고 관리하세요</p>
        </div>
      </div>

      <div className="px-5 pb-4">
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
    </div>
  )
}
