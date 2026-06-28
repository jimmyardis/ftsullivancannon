interface Props {
  onBack: () => void;
}

const HISTORY = [
  {
    title: 'The Battle of Sullivan\'s Island',
    body: `On June 28, 1776 — just six days before the Declaration of Independence — a British fleet of nine warships attempted to seize Charleston, South Carolina by attacking the unfinished Fort Sullivan on Sullivan's Island. The outcome would become one of the most celebrated American victories of the Revolutionary War.`,
  },
  {
    title: 'The Palmetto Log Miracle',
    body: `The fort was constructed from the spongy wood of the sabal palmetto tree. Rather than shattering under British cannon fire, the soft palmetto logs simply absorbed the iron balls — swallowing shot after shot without cracking apart. This unique property turned what seemed like a vulnerability into an extraordinary defensive advantage.`,
  },
  {
    title: 'Colonel William Moultrie',
    body: `With fewer than 500 men and limited ammunition, Colonel Moultrie held the fort against a fleet of over 2,800 British sailors and soldiers. His calm, methodical defense — rationing every shot, aiming for British rigging and gun decks — inflicted devastating casualties on the Royal Navy while the fort held firm.`,
  },
  {
    title: 'Sergeant Jasper and the Flag',
    body: `During the bombardment, a British shot cut down the fort's flag. Sergeant William Jasper leaped onto the outside of the fort under heavy fire, retrieved the flag, lashed it to a cannon sponge staff, and replanted it on the parapet. The sight of the flag rising again electrified the defenders and became one of the most iconic moments of the battle.`,
  },
  {
    title: 'The British Retreat',
    body: `After nine hours of fierce combat, British commander Sir Peter Parker's flagship HMS Bristol was so badly damaged she nearly sank. Parker himself was wounded. With his fleet shattered and the fort still standing, he ordered a withdrawal. The British would not attempt another southern invasion for three years.`,
  },
  {
    title: 'Fort Moultrie',
    body: `In honor of the victory, the South Carolina legislature renamed the fort Fort Moultrie. The palmetto tree and the crescent symbol from the fort's flag became permanent symbols of South Carolina, still appearing on the state flag today. The battle proved that American forces could defeat the Royal Navy in direct combat.`,
  },
];

export default function HistoricalScreen({ onBack }: Props) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center py-10 overflow-y-auto"
      style={{ background: 'radial-gradient(ellipse at top, #1a1208 0%, #060402 100%)', fontFamily: 'Georgia, serif' }}
    >
      <div className="w-full max-w-2xl mx-4">
        <h1 className="text-4xl font-bold text-center text-amber-300 mb-1">Historical Background</h1>
        <p className="text-amber-600/60 text-center text-sm mb-2 tracking-widest">The Battle of Sullivan's Island · June 28, 1776</p>
        <div className="text-center mb-8">
          <span className="text-amber-700/50 text-xl">✦</span>
        </div>

        <div className="space-y-6">
          {HISTORY.map(({ title, body }) => (
            <div key={title} className="border-l-2 border-amber-700/50 pl-5">
              <h2 className="text-xl font-bold text-amber-300 mb-2">{title}</h2>
              <p className="text-amber-200/75 leading-relaxed text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 p-4 border border-amber-700/30 bg-amber-900/10 text-center">
          <p className="text-amber-400/70 italic text-sm">
            "The fort was not only defensible but was defended with great spirit and ability."
          </p>
          <p className="text-amber-600/50 text-xs mt-1">— General Charles Lee, Continental Army</p>
        </div>

        <div className="mt-8 text-center">
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
