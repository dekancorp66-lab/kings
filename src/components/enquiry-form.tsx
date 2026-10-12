import { useState } from "react";
import { toast } from "sonner";
import { submitInquiry } from "@/lib/api";
import { useVehicles } from "@/lib/vehicles";
import { Button } from "./ui/button";
import { Input, Label, Select, Textarea } from "./ui/input";
import { useI18n } from "@/lib/i18n";

export function EnquiryForm({ defaultVehicle = "" }: { defaultVehicle?: string }) {
  const [pending, setPending] = useState(false);
  const { t } = useI18n();
  const vehicles = useVehicles();

  return (
    <form
      className="grid gap-4 md:grid-cols-2"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const data = new FormData(form);
        const payload = {
          firstName: String(data.get("firstName") ?? "").trim(),
          lastName: String(data.get("lastName") ?? "").trim(),
          email: String(data.get("email") ?? "").trim(),
          phone: String(data.get("phone") ?? "").trim(),
          vehicle: String(data.get("vehicle") ?? "").trim(),
          message: String(data.get("message") ?? "").trim(),
          // Honeypot (hidden from humans, see the input below). Bots fill it, the server drops them.
          website: String(data.get("website") ?? ""),
        };
        if (payload.message.length < 8) {
          toast.error(t("form.tooShort"));
          return;
        }
        setPending(true);
        try {
          await submitInquiry(payload);
          form.reset();
          toast.success(t("form.thanks"));
        } catch (error) {
          toast.error(error instanceof Error ? error.message : t("form.failed"));
        } finally {
          setPending(false);
        }
      }}
    >
      <div>
        <Label htmlFor="firstName">{t("form.firstName")}</Label>
        <Input id="firstName" name="firstName" required maxLength={60} autoComplete="given-name" />
      </div>
      <div>
        <Label htmlFor="lastName">{t("form.lastName")}</Label>
        <Input id="lastName" name="lastName" required maxLength={60} autoComplete="family-name" />
      </div>
      <div>
        <Label htmlFor="email">{t("form.email")}</Label>
        <Input id="email" name="email" type="email" required maxLength={120} autoComplete="email" />
      </div>
      <div>
        <Label htmlFor="phone">{t("form.phone")}</Label>
        <Input id="phone" name="phone" required maxLength={32} autoComplete="tel" />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="vehicle">{t("form.vehicle")}</Label>
        <Select id="vehicle" name="vehicle" defaultValue={defaultVehicle}>
          <option value="">{t("form.general")}</option>
          {vehicles.map((item) => (
            <option key={item.id} value={`${item.year} ${item.name} ${item.trim}`}>
              {item.year} {item.name} {item.trim}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="message">{t("form.message")}</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={8}
          maxLength={2000}
          placeholder={t("form.placeholder")}
        />
      </div>
      {/* Honeypot: off-screen and skipped by keyboard/screen readers, so only bots touch it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Leave this field empty</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="md:col-span-2">
        <Button type="submit" disabled={pending} className="min-w-40">
          {pending ? t("form.sending") : t("form.send")}
        </Button>
      </div>
    </form>
  );
}
