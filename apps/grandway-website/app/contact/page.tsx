import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { destinations } from "@/data/destinations";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to a Grandway Education counsellor about your study abroad plans — no obligation, no cost to start.",
};

// Destination names read as "the UK" mid-sentence; a select option wants "The UK".
const optionLabel = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1);

export default function ContactPage() {
  return (
    <main>
      <SiteHeader />
      <section className="contact-page">
        <div>
          <p className="eyebrow">Begin with a conversation</p>
          <h1>
            Let’s talk about
            <br />
            <em>what’s next.</em>
          </h1>
          <p>
            Tell us a little about yourself and where you are hoping to study.
            We will be in touch to arrange your counselling session.
          </p>
          <address className="contact-details">
            <span>Bagbazar, Kathmandu, Nepal</span>
            <a href="tel:+97715927205">01-5927205</a>
            <a href="mailto:info@grandwayeducation.com">
              info@grandwayeducation.com
            </a>
          </address>
        </div>
        <form className="contact-form">
          <label>
            Full name
            <input required placeholder="Your name" />
          </label>
          <label>
            Email address
            <input required type="email" placeholder="you@example.com" />
          </label>
          <label>
            Destination you’re considering
            <select defaultValue="">
              <option value="" disabled>
                Select a destination
              </option>
              {destinations.map((destination) => (
                <option key={destination.slug}>
                  {optionLabel(destination.name)}
                </option>
              ))}
              <option>I’m still exploring</option>
            </select>
          </label>
          <label>
            Tell us a little about your plan
            <textarea placeholder="What would you like help with?" rows={4} />
          </label>
          <button className="button button--dark" type="submit">
            Send enquiry <span>↗</span>
          </button>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
