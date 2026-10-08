import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { business, telUrl, whatsappUrl } from "@/config/business";

export function Footer() {
  return (
    <footer className="bg-navy text-inverse">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-1">
          <p className="text-micro font-semibold tracking-mark uppercase">{business.name}</p>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-inverse/65">
            {business.tagline}. Message or call us any time, we are open 24 hours, 7 days a week.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-nav text-inverse/50 uppercase">Inventory</p>
          <ul className="mt-4 space-y-2.5 text-sm text-inverse/80">
            <li>
              <Link to="/inventory" className="hover:text-inverse">
                All vehicles
              </Link>
            </li>
            <li>
              <Link to="/inventory" search={{ body: "Sedan" }} className="hover:text-inverse">
                Sedans
              </Link>
            </li>
            <li>
              <Link to="/inventory" search={{ body: "Coupe" }} className="hover:text-inverse">
                Coupes
              </Link>
            </li>
            <li>
              <Link to="/inventory" search={{ body: "SUV" }} className="hover:text-inverse">
                SUVs
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-nav text-inverse/50 uppercase">Services</p>
          <ul className="mt-4 space-y-2.5 text-sm text-inverse/80">
            <li>
              <Link to="/services" className="hover:text-inverse">
                Vehicle sales
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-inverse">
                Sourcing
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-inverse">
                Inspection
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-inverse">
                About us
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-nav text-inverse/50 uppercase">Contact us</p>
          <ul className="mt-4 space-y-2.5 text-sm text-inverse/80">
            {business.phones.map((phone) => (
              <li key={phone.intl}>
                <a href={telUrl(phone)} className="hover:text-inverse">
                  {phone.display}
                </a>
              </li>
            ))}
            <li>
              <a href={`mailto:${business.email}`} className="break-all hover:text-inverse">
                {business.email}
              </a>
            </li>
            <li className="text-inverse/65">
              {business.city}, {business.country}
            </li>
            <li className="text-inverse/65">{business.hours.join(", ")}</li>
          </ul>
          <a
            href={whatsappUrl(
              business.phones[0],
              `Hello ${business.name}, I would like to ask about a car.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:brightness-95"
          >
            <MessageCircle className="size-4" /> Chat on WhatsApp
          </a>
        </div>
      </div>
      <div className="border-t border-inverse/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs text-inverse/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p>
            © {new Date().getFullYear()} {business.name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link to="/contact" className="hover:text-inverse">
              Privacy
            </Link>
            <Link to="/contact" className="hover:text-inverse">
              Terms of service
            </Link>
            <Link to="/curator/login" className="hover:text-inverse">
              Curator
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
