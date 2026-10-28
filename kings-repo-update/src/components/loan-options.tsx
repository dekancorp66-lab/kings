import { Link } from "@tanstack/react-router";
import { copy, depositFor, depositPercent, lenders, loanFor } from "@/config/financing";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

/** The "Loan options" card on a car's page: shows the deposit for each lender, worked out from the car's price. */
export function LoanOptions({ price, name }: { price: number; name: string }) {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 lg:px-8">
      <div className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
        <h2 className="font-serif text-2xl text-ink">{c.cardTitle}</h2>
        <p className="mt-1 text-sm text-muted">{c.cardIntro}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {lenders.map((lender) => (
            <div key={lender.id} className="rounded-xl bg-canvas p-4 ring-1 ring-line">
              <p className="text-micro font-semibold tracking-mark text-accent uppercase">{lender.name[lang]}</p>
              <p className="mt-3 text-xs text-muted">
                {c.deposit} ({depositPercent(lender)}%)
              </p>
              <p className="text-xl font-semibold text-ink tabular-nums">{formatPrice(depositFor(price, lender))}</p>
              <p className="mt-2 text-xs text-muted">
                {c.loan} ({lender.financePercent}%): {formatPrice(loanFor(price, lender))}
              </p>
              <p className="mt-1 text-xs text-muted">{c.upTo(lender.maxMonths)}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">{c.repayNote}</p>
        <p className="mt-1 text-xs text-muted">{c.estimateNote}</p>
        <Link
          to="/financing"
          search={{ price, car: name }}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-inverse hover:bg-accent-hover"
        >
          {c.cardCta}
        </Link>
      </div>
    </section>
  );
}
