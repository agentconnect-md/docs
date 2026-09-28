// The console's brand lockup (packages/web marks.tsx): four-facet diamond, "Agent" + accented "Connect".
const FACETS = [
  { points: '24,5 43,24 24,24', fill: '#f2c64a' },
  { points: '43,24 24,43 24,24', fill: '#f4793a' },
  { points: '24,43 5,24 24,24', fill: '#7c3ca2' },
  { points: '5,24 24,5 24,24', fill: '#d83f96' }
]

export function Logo({ wordmarkClassName = '' }: { wordmarkClassName?: string }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg width={24} height={24} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        {FACETS.map((f) => (
          <polygon key={f.points} points={f.points} fill={f.fill} />
        ))}
      </svg>
      <span className={`text-[15px] font-semibold tracking-[-0.02em] ${wordmarkClassName}`}>
        Agent<span className="text-[#c62a78] dark:text-[#ef7eb4]">Connect</span>
      </span>
    </span>
  )
}
