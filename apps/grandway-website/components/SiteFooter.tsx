import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-brand">
        <Image src="/img/grandway_icon.png" alt="" width={44} height={44} />
        <span className="brand-name">Grandway Education</span>
      </div>
      <p>Thoughtful guidance for students ready to take their next step.</p>
      <div className="footer-links">
        <Link href="/destinations">Destinations</Link>
        <Link href="/services">Services</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Grand Way Education</span>
        <span>Kathmandu, Nepal</span>
      </div>
    </footer>
  );
}
