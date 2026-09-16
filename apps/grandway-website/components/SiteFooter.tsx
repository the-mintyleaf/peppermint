import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <section className="footer-map" aria-labelledby="footer-map-heading">
        <div className="footer-map-intro">
          <span className="footer-label">Find us</span>
          <h2 id="footer-map-heading">Grand Way Education, Bagbazar.</h2>
          <p>
            We are a short walk from Bagbazar Chowk in Kathmandu. Drop in during
            office hours, or book a session and we will keep the time free.
          </p>
          <a
            className="text-link"
            href="https://www.google.com/maps/search/?api=1&query=Grand+Way+Education+Pvt.+Ltd"
            target="_blank"
            rel="noreferrer"
          >
            Open in Google Maps <span>→</span>
          </a>
        </div>
        <div className="footer-map-frame">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14129.496946221489!2d85.2996128871582!3d27.70572929999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x353db5de5891d39%3A0xef8bbf00df05571d!2sGrand%20Way%20Education%20Pvt.%20Ltd!5e0!3m2!1sen!2snp!4v1789578641514!5m2!1sen!2snp"
            title="Grand Way Education office location on Google Maps"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </section>
      <div className="footer-grid">
        <div className="footer-intro">
          <div className="footer-brand">
            <Image src="/img/grandway_icon.png" alt="" width={44} height={44} />
            <span className="brand-name">Grandway Education</span>
          </div>
          <p>Thoughtful guidance for students ready to take their next step.</p>
        </div>

        <address className="footer-contact">
          <div>
            <span className="footer-label">Office</span>
            <p>
              Bagbazar,
              <br />
              Kathmandu, Nepal
            </p>
          </div>
          <div>
            <span className="footer-label">Contact</span>
            <a href="tel:+97715927205">01-5927205</a>
          </div>
          <div>
            <span className="footer-label">Email</span>
            <a href="mailto:info@grandwayeducation.com">
              info@grandwayeducation.com
            </a>
          </div>
        </address>

        <nav className="footer-nav" aria-label="Footer">
          <span className="footer-label">Explore</span>
          <div className="footer-links">
            <Link href="/destinations">Destinations</Link>
            <Link href="/classes">Classes</Link>
            <Link href="/services">Services</Link>
            <Link href="/partnership-certificates">Partnerships</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </nav>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Grandway Education</span>
        <span>Bagbazar, Kathmandu, Nepal</span>
      </div>
    </footer>
  );
}
