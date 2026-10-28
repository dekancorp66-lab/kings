import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteShell } from "@/components/layout/site-shell";
import { PageHero } from "@/components/page-hero";
import { Input, Label, Select } from "@/components/ui/input";
import { business, primaryPhone, telUrl, whatsappUrl } from "@/config/business";
import { branches } from "@/config/branches";
import {
  copy,
  depositFor,
  depositPercent,
  documents,
  lenders,
  loanFor,
  type Kind,
  type Lender,
} from "@/config/financing";
import { useI18n } from "@/lib/i18n";
import { pageHead } from "@/lib/seo";
import { getSiteOrigin } from "@/lib/site";
import { formatPrice } from "@/lib/utils";
import { useVehicles } from "@/lib/vehicles";

export const Route = createFileRoute("/financing")({
  // /financing?price=95000000&car=2011 Subaru Forester  (sent from a car's page)
  validateSearch: (search: Record<string, unknown>) => ({
    price: Number(search.price) > 0 ? Number(search.price) : undefined,
    car: typeof search.car === "string" ? search.car.slice(0, 120) : undefined,
  }),
  loader: () => getSiteOrigin(),
  head: ({ loaderData: origin = "" }) =>
    pageHead({
      origin,
      title: `Car loan options | ${business.name}`,
      description: `See how much deposit you need for a car loan and which documents to prepare. ${business.name}, ${business.city}.`,
      path: "/financing",
    }),
  component: FinancingPage,
});

const num = (value: string) => Number(value.replace(/[^\d]/g, "")) || 0;
const carTitle = (car: { year: number; name: string; trim?: string }) =>
  [car.year, car.name, car.trim].filter(Boolean).join(" ");

function FinancingPage() {
  const { lang } = useI18n();
  const c = copy[lang];
  const search = Route.useSearch();
  const vehicles = useVehicles().filter((item) => item.status !== "sold");

  const [price, setPrice] = useState(search.price ?? 0);
  const [carName, setCarName] = useState(search.car ?? "");
  const [myDeposit, setMyDeposit] = useState("");
  const [kind, setKind] = useState<Kind>("employee");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const list = documents[kind][lang];
  const doneCount = list.filter((_, index) => done[`${kind}-${index}`]).length;
  const mine = num(myDeposit);

  const message = [
    `${business.name}: ${c.waEnd}`,
    carName ? `${c.waCar}: ${carName}` : "",
    price ? `${c.waPrice}: ${formatPrice(price)}` : "",
    mine ? `${c.waDeposit}: ${formatPrice(mine)}` : "",
    `${c.waKind}: ${kind === "employee" ? c.employee : c.business}`,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <SiteShell>
      <PageHero
        eyebrow={c.heroEyebrow}
        title={c.heroTitle}
        subtitle={c.heroSubtitle}
        image="/images/services-hero.jpg"
        compact
      />
      <div className="mx-auto max-w-6xl space-y-8 px-5 py-10 lg:px-8">
        {/* 1. Price */}
        <section className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
          <h2 className="font-serif text-2xl text-ink">{c.step1}</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="car">{c.pickCar}</Label>
              <Select
                id="car"
                value={vehicles.find((item) => carTitle(item) === carName)?.id ?? ""}
                onChange={(event) => {
                  const chosen = vehicles.find((item) => item.id === event.target.value);
                  if (chosen) {
                    setPrice(chosen.price);
                    setCarName(carTitle(chosen));
                  } else {
                    setCarName("");
                  }
                }}
              >
                <option value="">{c.noCar}</option>
                {vehicles.map((item) => (
                  <option key={item.id} value={item.id}>
                    {carTitle(item)} - {formatPrice(item.price)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="price">{c.priceLabel}</Label>
              <Input
                id="price"
                inputMode="numeric"
                value={price ? new Intl.NumberFormat("en-US").format(price) : ""}
                placeholder="95,000,000"
                onChange={(event) => {
                  setPrice(num(event.target.value));
                  setCarName("");
                }}
              />
            </div>
          </div>
          <input
            type="range"
            aria-label={c.priceLabel}
            min={10_000_000}
            max={Math.max(300_000_000, price)}
            step={500_000}
            value={price || 10_000_000}
            onChange={(event) => {
              setPrice(Number(event.target.value));
              setCarName("");
            }}
            className="mt-6 w-full accent-[var(--color-accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-muted">
            <span>10M</span>
            <span>150M</span>
            <span>300M</span>
          </div>
        </section>

        {/* 2. Deposit per lender */}
        <section className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
          <h2 className="font-serif text-2xl text-ink">{c.step2}</h2>
          <div className="mt-5 max-w-md">
            <Label htmlFor="mine">{c.myDeposit}</Label>
            <Input
              id="mine"
              inputMode="numeric"
              value={mine ? new Intl.NumberFormat("en-US").format(mine) : ""}
              placeholder="30,000,000"
              onChange={(event) => setMyDeposit(event.target.value)}
            />
            <p className="mt-1 text-xs text-muted">{c.myDepositHelp}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {lenders.map((lender) => (
              <LenderCard key={lender.id} lender={lender} price={price} mine={mine} />
            ))}
          </div>
          <p className="mt-4 text-xs text-muted">{c.repayNote}</p>
          <p className="mt-1 text-xs text-muted">{c.estimateNote}</p>
        </section>

        {/* 3. Documents */}
        <section className="rounded-2xl bg-surface p-6 shadow-card md:p-8">
          <h2 className="font-serif text-2xl text-ink">{c.step3}</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            {(["employee", "business"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                aria-pressed={kind === option}
                className={`rounded-full px-5 py-2 text-sm font-medium ring-1 ${
                  kind === option ? "bg-navy text-inverse ring-navy" : "bg-surface text-ink ring-line hover:bg-canvas"
                }`}
              >
                {option === "employee" ? c.employee : c.business}
              </button>
            ))}
          </div>
          {kind === "business" ? <p className="mt-3 text-sm text-muted">{c.businessHelp}</p> : null}
          <p className="mt-4 text-xs font-semibold text-accent">{c.ready(doneCount, list.length)}</p>
          <ul className="mt-3 grid gap-2 md:grid-cols-2">
            {list.map((item, index) => {
              const key = `${kind}-${index}`;
              return (
                <li key={key}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 text-sm text-ink hover:bg-canvas">
                    <input
                      type="checkbox"
                      checked={Boolean(done[key])}
                      onChange={(event) => setDone((prev) => ({ ...prev, [key]: event.target.checked }))}
                      className="mt-0.5 size-4 shrink-0 accent-[var(--color-accent)]"
                    />
                    <span className={done[key] ? "text-muted line-through" : ""}>{item}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 4. Talk to us */}
        <section className="rounded-2xl bg-navy p-6 text-inverse shadow-card md:p-8">
          <h2 className="font-serif text-2xl">{c.step4}</h2>
          <p className="mt-2 text-sm text-inverse/80">{c.sendIntro}</p>
          <a
            href={whatsappUrl(primaryPhone, message)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-inverse hover:bg-accent-hover"
          >
            {c.sendButton}
          </a>
        </section>
      </div>
    </SiteShell>
  );
}

function LenderCard({ lender, price, mine }: { lender: Lender; price: number; mine: number }) {
  const { lang } = useI18n();
  const c = copy[lang];
  const deposit = depositFor(price, lender);
  const interestUnit = lender.interestPer === "month" ? c.perMonth : lender.interestPer === "year" ? c.perYear : "";
  const fit = price > 0 && mine > 0 ? (mine >= deposit ? "ok" : "short") : null;

  return (
    <div className="rounded-xl bg-canvas p-5 ring-1 ring-line">
      <p className="text-micro font-semibold tracking-mark text-accent uppercase">{lender.name[lang]}</p>
      <p className="mt-3 text-xs text-muted">
        {c.deposit} ({depositPercent(lender)}%)
      </p>
      <p className="text-2xl font-semibold text-ink tabular-nums">{price ? formatPrice(deposit) : "-"}</p>
      <p className="mt-2 text-sm text-muted">
        {c.loan} ({lender.financePercent}%): {price ? formatPrice(loanFor(price, lender)) : "-"}
      </p>
      <p className="mt-1 text-sm text-muted">{c.upTo(lender.maxMonths)}</p>
      {lender.interest ? (
        <p className="mt-1 text-sm text-muted">
          {c.interest}: {lender.interest} {interestUnit}
        </p>
      ) : null}
      <p className="mt-1 text-sm text-muted">
        {c.insurance}: {lender.insurance === "customer" ? c.insuranceCustomer : c.insuranceLender}
      </p>
      {lender.branches?.length ? (
        <p className="mt-1 text-sm text-muted">
          {c.meetAt}:{" "}
          {lender.branches
            .map((id) => branches.find((b) => b.id === id)?.city)
            .filter(Boolean)
            .join(", ")}
        </p>
      ) : null}
      {fit ? (
        <p className={`mt-3 text-sm font-semibold ${fit === "ok" ? "text-green-700" : "text-amber-700"}`}>
          {fit === "ok" ? c.enough : c.short(formatPrice(deposit - mine))}
        </p>
      ) : null}
      {lender.phone ? (
        <a href={telUrl(lender.phone)} className="mt-3 inline-block text-sm font-medium text-accent underline">
          {c.callLender}: {lender.phone.display}
        </a>
      ) : null}
    </div>
  );
}
