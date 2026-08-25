import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { destinations, getDestination } from "@/data/destinations";

export function generateStaticParams() {
  return destinations.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) return { title: "Destination not found" };
  return {
    title: `Study in ${destination.name}`,
    description: destination.summary,
  };
}

export default async function DestinationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const destination = getDestination(slug);
  if (!destination) notFound();
  return (
    <main>
      <div
        className="destination-detail-hero"
        style={{ backgroundImage: `url(${destination.image})` }}
      >
        <div className="hero-shade" />
        <SiteHeader transparent />
        <div className="detail-hero-content">
          <p className="eyebrow eyebrow--light">{destination.eyebrow}</p>
          <h1>
            Study in
            <br />
            <em>{destination.name}</em>.
          </h1>
          <p>{destination.summary}</p>
        </div>
      </div>
      <section className="destination-intro section-shell">
        <p className="eyebrow">The opportunity</p>
        <div>
          <h2>
            A place to learn,
            <br />
            and to live.
          </h2>
          <p>{destination.introduction}</p>
          <Link className="text-link" href="/contact">
            Discuss your plan <span>→</span>
          </Link>
        </div>
      </section>
      <section className="reason-section">
        <div>
          <p className="eyebrow eyebrow--light">Why {destination.name}</p>
          <h2>
            See the bigger
            <br />
            picture.
          </h2>
        </div>
        <ul>
          {destination.reasons.map((reason, index) => (
            <li key={reason}>
              <span>0{index + 1}</span>
              {reason}
            </li>
          ))}
        </ul>
      </section>
      <section className="section-shell process-section">
        <p className="eyebrow">Your pathway</p>
        <div className="process-heading">
          <h2>
            A considered way
            <br />
            forward.
          </h2>
          <p>
            Every application is different. Here is the broad path we will
            navigate together.
          </p>
        </div>
        <div className="process-grid">
          {destination.steps.map((step, index) => (
            <article key={step.title}>
              <span>0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="documents-section section-shell">
        <div>
          <p className="eyebrow">What you’ll need</p>
          <h2>
            A well-prepared
            <br />
            application.
          </h2>
        </div>
        <div>
          <p>
            Requirements can change and are assessed individually. We’ll help
            you understand exactly what is needed for your course and
            application.
          </p>
          <ul>
            {destination.documents.map((document) => (
              <li key={document}>
                {document}
                <span>↗</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="opportunity-band">
        <p className="eyebrow eyebrow--light">Looking ahead</p>
        <h2>
          Life beyond
          <br />
          the classroom.
        </h2>
        <p>{destination.opportunities}</p>
        <Link href="/contact" className="button button--light">
          Plan your next step <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
