import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero">
        <p className="eyebrow">Our point of view</p>
        <h1>
          Make your move
          <br />
          <em>with people who care.</em>
        </h1>
        <p>
          Grand Way Education is here to make studying abroad feel achievable,
          informed and genuinely exciting.
        </p>
      </section>
      <section className="about-story">
        <div className="about-image" />
        <div>
          <p className="eyebrow">Our approach</p>
          <h2>We are in your corner.</h2>
          <p>
            There is no single right path to an international education. That is
            why we take time to understand the person behind the application:
            what matters to you, what you hope to build and what support will
            help you get there.
          </p>
          <p>
            Our team brings steady, practical guidance to each stage—from the
            first shortlist to your first day abroad.
          </p>
        </div>
      </section>
      <section className="values section-shell">
        <p className="eyebrow">What matters to us</p>
        <div>
          {[
            [
              "Care",
              "We take your goals seriously and give every decision the attention it deserves.",
            ],
            [
              "Clarity",
              "We make complicated processes easier to understand, one conversation at a time.",
            ],
            [
              "Momentum",
              "We help you move forward with a clear plan and confident next step.",
            ],
          ].map(([title, text], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="contact-band">
        <div>
          <p className="eyebrow">Your story starts here</p>
          <h2>Tell us where you want to go.</h2>
        </div>
        <Link className="button button--dark" href="/contact">
          Book counselling <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
