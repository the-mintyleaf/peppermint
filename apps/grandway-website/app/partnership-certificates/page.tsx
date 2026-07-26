import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

const certificates = [
  {
    university: "University of Melbourne",
    country: "Australia",
    code: "GW-AU-01",
  },
  {
    university: "The University of Sydney",
    country: "Australia",
    code: "GW-AU-02",
  },
  { university: "Monash University", country: "Australia", code: "GW-AU-03" },
  { university: "University of Toronto", country: "Canada", code: "GW-CA-01" },
  {
    university: "University of British Columbia",
    country: "Canada",
    code: "GW-CA-02",
  },
  { university: "McGill University", country: "Canada", code: "GW-CA-03" },
  {
    university: "University of Oxford",
    country: "United Kingdom",
    code: "GW-UK-01",
  },
  {
    university: "University College London",
    country: "United Kingdom",
    code: "GW-UK-02",
  },
  {
    university: "King's College London",
    country: "United Kingdom",
    code: "GW-UK-03",
  },
  { university: "University of Malta", country: "Malta", code: "GW-MT-01" },
];

export default function PartnershipCertificatesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="page-hero certificate-hero">
        <p className="eyebrow">Grand Way Education</p>
        <h1>
          Our university
          <br />
          <em>partnerships.</em>
        </h1>
        <p>
          Explore the partnership certificates and institutional
          acknowledgements that support our student pathways.
        </p>
      </section>
      <section className="certificate-intro section-shell">
        <p className="eyebrow">A note on these documents</p>
        <div>
          <h2>
            Trusted connections,
            <br />
            made visible.
          </h2>
          <p>
            These certificate previews are presentation placeholders while our
            latest signed documents are prepared for upload. Contact our team if
            you would like to verify a specific relationship.
          </p>
        </div>
      </section>
      <section
        className="certificate-grid section-shell"
        aria-label="University partnership certificates"
      >
        {certificates.map((certificate) => (
          <article className="certificate-card" key={certificate.code}>
            <div className="certificate-paper">
              <span className="certificate-ribbon">Partnership</span>
              <div className="certificate-seal">GW</div>
              <p>
                Certificate of
                <br />
                <strong>Institutional Partnership</strong>
              </p>
              <i>
                This is to recognise the education pathway collaboration between
              </i>
              <h2>Grand Way Education</h2>
              <b>and</b>
              <h3>{certificate.university}</h3>
              <small>
                {certificate.code} · {certificate.country}
              </small>
            </div>
            <div className="certificate-meta">
              <div>
                <span>{certificate.country}</span>
                <h3>{certificate.university}</h3>
              </div>
              <span className="certificate-arrow" aria-hidden="true">
                ↗
              </span>
            </div>
          </article>
        ))}
      </section>
      <section className="contact-band">
        <div>
          <p className="eyebrow">Have a question?</p>
          <h2>We are happy to help.</h2>
        </div>
        <Link className="button button--dark" href="/contact">
          Contact our team <span>↗</span>
        </Link>
      </section>
      <SiteFooter />
    </main>
  );
}
