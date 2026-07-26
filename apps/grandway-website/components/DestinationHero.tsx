"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { destinations } from "@/data/destinations";

export function DestinationHero() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % destinations.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, []);
  const place = destinations[active];
  return (
    <section className="destination-hero">
      {destinations.map((destination, index) => (
        <div
          key={destination.slug}
          className={`hero-photo ${index === active ? "hero-photo--active" : ""}`}
          style={{ backgroundImage: `url(${destination.image})` }}
        />
      ))}
      <div className="hero-shade" />
      <div className="hero-content">
        <p className="eyebrow eyebrow--light">{place.eyebrow}</p>
        <h1>
          Study in <em>{place.name}</em>.
        </h1>
        <p className="hero-copy">{place.summary}</p>
        <Link
          href={`/destinations/${place.slug}`}
          className="button button--light"
        >
          Explore {place.name} <span>↗</span>
        </Link>
      </div>
      <div className="hero-controls" aria-label="Choose a destination">
        {destinations.map((destination, index) => (
          <button
            key={destination.slug}
            className={index === active ? "is-active" : ""}
            onClick={() => setActive(index)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span> {destination.name}
          </button>
        ))}
      </div>
    </section>
  );
}
