import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { QuickAdd } from "@/components/curator/quick-add";
import { Button } from "@/components/ui/button";
import type { Vehicle } from "@/data/types";
import { curatorMe, fetchVehicles } from "@/lib/api";

export const Route = createFileRoute("/curator/quick-add")({
  component: QuickAddPage,
});

function QuickAddPage() {
  const [existing, setExisting] = useState<Vehicle[] | null>(null);
  const [added, setAdded] = useState<Vehicle | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    // Same rule as the rest of the Dealer desk: not signed in -> go to the login page.
    curatorMe()
      .then(() => fetchVehicles())
      .then(setExisting)
      .catch(() => window.location.assign("/curator/login"));
  }, []);

  if (!existing) return <main className="mx-auto max-w-5xl px-4 py-16 text-sm text-muted">Loading…</main>;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <a href="/curator" className="text-sm text-muted hover:text-ink">← Back to Dealer desk</a>
      {added ? (
        <div className="mt-8 rounded-2xl bg-surface p-6 shadow-card md:p-8">
          <h2 className="font-serif text-2xl text-ink">
            {added.year} {added.name} added
          </h2>
          <p className="mt-2 text-sm text-muted">It is now in the inventory.</p>
          <div className="mt-6 flex gap-3">
            <Button
              type="button"
              onClick={() => {
                setAdded(null);
                setRound((n) => n + 1);
              }}
            >
              Add another
            </Button>
            <Button type="button" variant="outline" onClick={() => window.location.assign("/curator")}>
              Back to Dealer desk
            </Button>
          </div>
        </div>
      ) : (
        <QuickAdd
          key={round}
          existing={existing}
          onCreated={setAdded}
          onCancel={() => window.location.assign("/curator")}
        />
      )}
    </main>
  );
}
