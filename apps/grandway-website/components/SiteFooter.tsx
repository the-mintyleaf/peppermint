import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
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
