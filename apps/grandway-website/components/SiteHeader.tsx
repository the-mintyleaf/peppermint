"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "/destinations", label: "Destinations" },
  { href: "/services", label: "Our services" },
  { href: "/about", label: "About us" },
];

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={`site-header ${transparent ? "site-header--transparent" : ""}`}
    >
      <Link className="brand" href="/" onClick={() => setOpen(false)}>
        <Image
          src="/img/grandway_icon.png"
          alt=""
          width={46}
          height={46}
          priority
        />
        <span className="brand-name">Grandway Education</span>
      </Link>
      <button
        className="nav-toggle"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        <span />
        <span />
      </button>
      <nav className={open ? "nav nav--open" : "nav"}>
        {nav.map((item) => (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
          </Link>
        ))}
        <Link
          className="nav-cta"
          href="/contact"
          onClick={() => setOpen(false)}
        >
          Book counselling <span>↗</span>
        </Link>
      </nav>
    </header>
  );
}
