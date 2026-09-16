import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { classes } from "@/data/classes";

export const metadata: Metadata = {
  title: "Classes",
  description:
    "IELTS, PTE and Japanese language classes at Grandway Education in Bagbazar, Kathmandu — small batches, regular mock tests and honest feedback.",
};

const practicalities = [
  "Small batches so everyone gets speaking time",
  "Mock tests every week, marked and explained",
  "Morning, day and evening batches to fit around college",
  "Counselling and class planning under one roof",
];

export default function ClassesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero page-hero--classes">
        <p className="eyebrow">Prepare with us</p>
        <h1>
          Sit the test
          <br />
          <em>ready.</em>
        </h1>
        <p>
          IELTS, PTE and Japanese language classes at our Bagbazar office —
          taught in small batches by the same team that guides your application.
        </p>
      </section>
      <section className="class-list section-shell">
        {classes.map((testClass, index) => (
          <article className="class-card" key={testClass.slug}>
            <div className="class-card-head">
              <span>0{index + 1}</span>
              <div>
                <h2>{testClass.name}</h2>
                <p className="class-tagline">{testClass.tagline}</p>
              </div>
            </div>
            <div className="class-card-body">
              <p>{testClass.description}</p>
              <ul className="class-covers">
                {testClass.covers.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <dl className="class-meta">
                <div>
                  <dt>Length</dt>
                  <dd>{testClass.duration}</dd>
                </div>
                <div>
                  <dt>Batches</dt>
                  <dd>{testClass.schedule}</dd>
                </div>
              </dl>
            </div>
          </article>
        ))}
      </section>
      <section className="reason-section">
        <div>
          <p className="eyebrow eyebrow--light">How the classes run</p>
          <h2>
            Practice, then
            <br />
            practice again.
          </h2>
        </div>
        <ul>
          {practicalities.map((item, index) => (
            <li key={item}>
              <span>0{index + 1}</span>
              {item}
            </li>
          ))}
        </ul>
      </section>
      <section className="contact-band">
        <div>
          <p className="eyebrow">Next batch starting soon</p>
          <h2>Ask about a seat.</h2>
        </div>
        <Link className="button button--dark" href="/contact">
          Enquire about classes <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
