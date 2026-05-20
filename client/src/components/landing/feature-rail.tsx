const features = [
  ['No sterile lobby', 'Jump from preview to stranger roulette without a corporate waiting-room vibe.'],
  ['Signal-first chrome', 'The room UI keeps your call, status, and next action visible at a glance.'],
  ['Soft chaos', 'Textured cards, animated accents, and a little nightclub energy without losing clarity.'],
];

export function FeatureRail() {
  return (
    <section className="grid gap-3 py-10 md:grid-cols-3">
      {features.map(([title, body], index) => (
        <article
          className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl"
          key={title}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <div className="mb-5 h-1.5 w-14 rounded-full bg-acid" />
          <h2 className="font-serif text-3xl italic leading-none text-foam">{title}</h2>
          <p className="mt-4 text-sm leading-6 text-foam/58">{body}</p>
        </article>
      ))}
    </section>
  );
}
