import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Counselling, university applications, scholarship assistance, student visa guidance and pre-departure support from Grandway Education.",
};

const services = [
  {
    title: "Personal counselling",
    text: "Your ambitions, academic history and circumstances are the starting point. We listen carefully, then help you make choices you can feel good about.",
    details: [
      "Personal academic and career guidance",
      "Course and country exploration",
      "University shortlisting",
    ],
  },
  {
    title: "Scholarship assistance",
    text: "We help you identify suitable opportunities, assess eligibility and prepare considered scholarship applications that speak clearly to your strengths.",
    details: [
      "Scholarship research",
      "Eligibility assessment",
      "Essay and application support",
    ],
  },
  {
    title: "Student visa guidance",
    text: "From documents to interview preparation, we bring clarity to one of the most important stages of your journey.",
    details: [
      "Document preparation",
      "Application review",
      "Interview preparation",
    ],
  },
  {
    title: "Pre-departure support",
    text: "The journey is not over when your visa is granted. We help you prepare for the practical and personal side of a new beginning.",
    details: [
      "Travel and arrival planning",
      "Accommodation guidance",
      "Cultural and academic preparation",
    ],
  },
  {
    title: "Student health cover",
    text: "Understanding health cover should not be another source of stress. We help you consider the options available for your destination.",
    details: [
      "Health cover guidance",
      "Policy booking support",
      "Understanding your cover",
    ],
  },
];

export default function ServicesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero page-hero--services">
        <p className="eyebrow">With you, throughout</p>
        <h1>
          Good advice makes
          <br />
          <em>all the difference.</em>
        </h1>
        <p>
          Our support is personal, practical and built around the choices in
          front of you.
        </p>
      </section>
      <section className="services-detail section-shell">
        {services.map((service, index) => (
          <article key={service.title}>
            <div>
              <span>0{index + 1}</span>
              <h2>{service.title}</h2>
            </div>
            <div>
              <p>{service.text}</p>
              <ul>
                {service.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
      <section className="quote-panel">
        <p>
          “The right support turns a big decision into a series of clear,
          possible steps.”
        </p>
        <Link href="/contact" className="text-link text-link--light">
          Start a conversation <span>→</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
