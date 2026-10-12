export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  image: string;
  compact?: boolean;
}) {
  return (
    <section className={`relative isolate overflow-hidden bg-navy ${compact ? "border-b-2 border-accent/50" : ""}`}>
      <img
        src={image}
        alt=""
        className="absolute inset-0 size-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-linear-to-r from-navy via-navy/80 to-navy/40" />
      <div
        className={`relative mx-auto flex max-w-4xl flex-col items-center justify-center px-5 text-center ${
          compact ? "min-h-[9rem] py-7" : "min-h-[22rem] py-20"
        }`}
      >
        {eyebrow ? (
          <p className="text-[0.7rem] font-semibold tracking-[0.28em] text-inverse/70 uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`font-serif text-inverse ${
            compact ? "mt-1 text-3xl md:text-4xl" : "mt-3 text-4xl md:text-6xl"
          }`}
        >
          {title}
        </h1>
        <p
          className={`max-w-2xl text-sm leading-relaxed text-inverse/75 ${
            compact ? "mt-2" : "mt-4 md:text-base"
          }`}
        >
          {subtitle}
        </p>
      </div>
    </section>
  );
}
