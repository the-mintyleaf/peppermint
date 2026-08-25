import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Destinations",
  description:
    "Study destinations Grandway Education supports — entry requirements, costs and visa routes for each country.",
};

export default function DestinationsPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero">
        <p className="eyebrow">Choose your direction</p>
        <h1>
          Study somewhere
          <br />
          <em>that feels right.</em>
        </h1>
        <p>
          Every destination offers a different kind of opportunity. Discover the
          one that suits your aspirations, lifestyle and future plans.
        </p>
      </section>
      <section className="destination-index section-shell">
        {destinations.map((destination, index) => (
          <Link
            href={`/destinations/${destination.slug}`}
            className="destination-index-card"
            key={destination.slug}
          >
            <div
              className="index-card-photo"
              style={{ backgroundImage: `url(${destination.image})` }}
            />
            <div className="index-card-content">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h2>{destination.name}</h2>
              <p>{destination.summary}</p>
              <b>
                Explore destination <i>↗</i>
              </b>
            </div>
          </Link>
        ))}
      </section>
      <section className="contact-band">
        <div>
          <p className="eyebrow">Not sure yet?</p>
          <h2>Let’s find the right fit.</h2>
        </div>
        <Link className="button button--dark" href="/contact">
          Talk to a counsellor <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
