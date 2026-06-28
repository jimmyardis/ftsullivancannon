interface Props {
  volume: number;
  onVolumeChange: (v: number) => void;
  onBack: () => void;
}

const CONTROLS = [
  { key: 'Mouse', action: 'Aim cannon' },
  { key: 'Click / Space', action: 'Fire' },
  { key: 'Scroll', action: 'Adjust elevation' },
  { key: '1', action: 'Round Shot (long range, hull damage)' },
  { key: '2', action: 'Chain Shot (sail damage, slows ships)' },
  { key: '3', action: 'Grape Shot (crew damage, close range)' },
  { key: '4', action: 'Heated Shot (fire damage, unlocks Wave 4)' },
  { key: 'Q', action: 'Concentrated Volley (3 rapid shots)' },
  { key: 'W', action: 'Emergency Repairs (restore fort health)' },
  { key: 'E', action: 'Fast Load (halve reload time for 8s)' },
  { key: 'R', action: 'Hold Fire (enemy cannons go silent for 7s)' },
];

export default function SettingsScreen({ volume, onVolumeChange, onBack }: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center py-10 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at top, #1a1208 0%, #060402 100%)', fontFamily: 'Georgia, serif' }}
    >
      <div className="w-full max-w-xl mx-4">
        <h1 className="text-4xl font-bold text-center text-amber-300 mb-8">Settings</h1>

        {/* Volume */}
        <div className="border border-amber-700/40 bg-black/40 p-5 mb-5">
          <h2 className="text-lg font-bold text-amber-300 mb-4">Audio</h2>
          <div className="flex items-center gap-4">
            <span className="text-amber-400/70 text-sm w-20">Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={e => onVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-amber-300/80 text-sm w-10 text-right">{Math.round(volume * 100)}%</span>
          </div>
        </div>

        {/* Controls */}
        <div className="border border-amber-700/40 bg-black/40 p-5 mb-8">
          <h2 className="text-lg font-bold text-amber-300 mb-4">Controls</h2>
          <div className="space-y-2">
            {CONTROLS.map(({ key, action }) => (
              <div key={key} className="flex items-start gap-4 text-sm">
                <span className="px-2 py-0.5 bg-amber-900/50 border border-amber-700/50 text-amber-300 font-mono text-xs min-w-[72px] text-center flex-shrink-0">
                  {key}
                </span>
                <span className="text-amber-200/70">{action}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onBack}
            className="px-8 py-3 border border-amber-700/50 text-amber-300/80 bg-stone-900/70
              hover:bg-stone-800/80 hover:border-amber-500/70 transition-all"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
