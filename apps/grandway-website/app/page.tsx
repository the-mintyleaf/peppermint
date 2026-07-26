import Link from "next/link";
import { DestinationHero } from "@/components/DestinationHero";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { destinations } from "@/data/destinations";

/* eslint-disable @next/next/no-img-element -- official domain favicons are temporary logo sources. */

const services = [
  [
    "01",
    "Counselling",
    "A clear starting point, shaped around your goals and circumstances.",
  ],
  [
    "02",
    "Application support",
    "Careful university selection and applications that feel considered.",
  ],
  [
    "03",
    "Visa guidance",
    "Practical document and interview preparation, one step at a time.",
  ],
  [
    "04",
    "Ready to go",
    "Pre-departure support for the life waiting on the other side.",
  ],
];

const universities = [
  {
    logoDomain: "unimelb.edu.au",
    name: "University of Melbourne",
    country: "Australia",
  },
  {
    logoDomain: "sydney.edu.au",
    name: "The University of Sydney",
    country: "Australia",
  },
  { logoDomain: "monash.edu", name: "Monash University", country: "Australia" },
  {
    logoDomain: "utoronto.ca",
    name: "University of Toronto",
    country: "Canada",
  },
  {
    logoDomain: "ubc.ca",
    name: "University of British Columbia",
    country: "Canada",
  },
  { logoDomain: "mcgill.ca", name: "McGill University", country: "Canada" },
  {
    logoDomain: "ox.ac.uk",
    name: "University of Oxford",
    country: "United Kingdom",
  },
  {
    logoDomain: "ucl.ac.uk",
    name: "University College London",
    country: "United Kingdom",
  },
  {
    logoDomain: "kcl.ac.uk",
    name: "King's College London",
    country: "United Kingdom",
  },
  { logoDomain: "um.edu.mt", name: "University of Malta", country: "Malta" },
];

export default function Home() {
  return (
    <main>
      <div className="hero-frame">
        <SiteHeader transparent />
        <DestinationHero />
      </div>
      <section className="intro section-shell">
        <p className="eyebrow">Grand Way Education</p>
        <div className="intro-grid">
          <h2>Your next chapter begins with a good conversation.</h2>
          <div>
            <p>
              Studying abroad is a big decision. We make it feel more manageable
              with honest advice, careful planning and a team that stays close
              throughout the journey.
            </p>
            <Link className="text-link" href="/about">
              Get to know Grand Way <span>→</span>
            </Link>
          </div>
        </div>
      </section>
      <section className="journey">
        <div className="journey-title">
          <p className="eyebrow">The journey, made clear</p>
          <h2>
            From possibility
            <br />
            to departure.
          </h2>
        </div>
        <div className="service-list">
          {services.map(([number, title, body]) => (
            <Link href="/services" className="service-row" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{body}</p>
              <b>↗</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="story-panel">
        <div className="story-image" />
        <div className="story-copy">
          <p className="eyebrow eyebrow--light">More than an application</p>
          <h2>
            We help you
            <br />
            feel ready.
          </h2>
          <p>
            From course choices to accommodation, health cover and the practical
            details of arriving somewhere new, our support goes well beyond the
            form.
          </p>
          <Link className="button button--light" href="/services">
            How we can help <span>↗</span>
          </Link>
        </div>
      </section>
      <section className="section-shell destinations-preview">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Find your place</p>
            <h2>
              Destinations with
              <br />
              room to grow.
            </h2>
          </div>
          <Link className="text-link" href="/destinations">
            See all destinations <span>→</span>
          </Link>
        </div>
        <div className="destination-cards">
          {destinations.map((destination) => (
            <Link
              className="destination-card"
              href={`/destinations/${destination.slug}`}
              key={destination.slug}
            >
              <div
                className="card-image"
                style={{ backgroundImage: `url(${destination.image})` }}
              />
              <div>
                <h3>{destination.name}</h3>
                <span>
                  Explore <b>↗</b>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="universities-section">
        <div className="section-shell universities-heading">
          <p className="eyebrow">A world of opportunity</p>
          <h2>
            Universities our
            <br />
            <em>students choose.</em>
          </h2>
          <div>
            <p>
              From globally recognised institutions to specialist colleges, we
              help students find a university that fits their next chapter.
            </p>
            <Link
              className="button button--light"
              href="/partnership-certificates"
            >
              Review certificates <span>↗</span>
            </Link>
          </div>
        </div>
        <div
          className="university-marquee"
          aria-label="Universities our students have gone to"
        >
          <div className="university-track">
            {[...universities, ...universities].map((university, index) => (
              <article
                className="university-logo"
                key={`${university.logoDomain}-${index}`}
                aria-hidden={index >= universities.length}
              >
                <div className="university-logo-image">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${university.logoDomain}&sz=128`}
                    alt={`${university.name} logo`}
                  />
                </div>
                <strong>{university.name}</strong>
                <small>{university.country}</small>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="contact-band">
        <div>
          <p className="eyebrow">Start with us</p>
          <h2>Where would you like to go?</h2>
        </div>
        <Link className="button button--dark" href="/contact">
          Book a counselling session <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
