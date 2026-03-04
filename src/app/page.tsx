import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-2xl text-center">
        <div className="inline-block px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 rounded-full border border-cyan-500/20 mb-8">
          Partner Portal V3
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
            Community Tax
          </span>
          <br />
          Partner Program
        </h1>
        <p className="text-lg text-zinc-400 mb-10 max-w-lg mx-auto">
          Refer clients with IRS tax debt. Earn $1,500-$4,000 per resolved case. Track referrals, earnings, and payouts in real-time.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Partner Login
          </Link>
          <Link
            href="/auth"
            className="px-6 py-3 border border-zinc-700 text-zinc-300 font-semibold rounded-lg hover:bg-zinc-800/50 transition-colors"
          >
            Apply Now
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">$2.3B</div>
            <div className="text-xs text-zinc-500 mt-1">Tax Debt Resolved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">120K+</div>
            <div className="text-xs text-zinc-500 mt-1">Clients Served</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-cyan-400">15+</div>
            <div className="text-xs text-zinc-500 mt-1">Years in Business</div>
          </div>
        </div>
      </div>
    </div>
  )
}
