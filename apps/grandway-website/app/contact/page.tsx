import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

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
          <div className="contact-details">
            <span>Kathmandu, Nepal</span>
            <a href="mailto:hello@grandway.edu.np">hello@grandway.edu.np</a>
            <a href="tel:+977000000000">+977 00 000 0000</a>
          </div>
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
              <option>Australia</option>
              <option>Canada</option>
              <option>United Kingdom</option>
              <option>Malta</option>
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
