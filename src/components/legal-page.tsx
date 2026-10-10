import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";

export type LegalSection = { heading: string; paragraphs: string[] };

/**
 * Shared layout for the Privacy and Terms pages: hero + readable text column.
 * Keeping it in one component means both pages always look the same.
 */
export function LegalPage({
  eyebrow,
  title,
  subtitle,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <SiteShell>
      <PageHero
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        image="/images/about-hero.jpg"
      />
      <article className="mx-auto max-w-3xl px-5 py-16 lg:px-8">
        <p className="text-xs font-semibold tracking-nav text-subtle uppercase">
          Last updated: {updated}
        </p>
        <div className="mt-8 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-serif text-2xl text-ink">{section.heading}</h2>
              {section.paragraphs.map((text) => (
                <p key={text} className="mt-3 text-sm leading-relaxed text-muted">
                  {text}
                </p>
              ))}
            </section>
          ))}
        </div>
      </article>
    </SiteShell>
  );
}
