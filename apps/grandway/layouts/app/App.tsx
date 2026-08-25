import type { Metadata } from "next";

import { configThemeMantine } from "@/config/theme";
import { AppWrapper, mantineHtmlProps } from "@peppermint/ui";
import "@/app/globals.css";

/**
 * Re-exported by `app/layout.tsx` — Next.js only reads `metadata` from a file under
 * `app/`, and that file stays a re-export per the app-router rule in `CLAUDE.md`.
 *
 * `title.template` gives every route that sets its own `title` the " | Grandway
 * Education" suffix for free; `title.default` covers the routes that set none.
 */
export const metadata: Metadata = {
  title: {
    default: "Grandway Education | Management Portal",
    template: "%s | Grandway Education",
  },
  description:
    "Staff management portal for Grandway Education — applicants, leads, documents and institutions.",
  icons: { icon: "/img/grandway_icon.png" },
  robots: { index: false, follow: false },
};

const colorSchemeScript = `try{var c=window.localStorage.getItem("mantine-color-scheme-value");var s=c==="light"||c==="dark"||c==="auto"?c:"light";var d=s!=="auto"?s:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",d);}catch(e){}`;

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      style={{
        background:
          "linear-gradient(160deg, var(--mantine-color-dark-6) 0%, var(--mantine-color-dark-9) 100%)",
      }}
    >
      <head>
        <template
          data-mantine-script
          dangerouslySetInnerHTML={{ __html: colorSchemeScript }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: "none",
          color: "var(--mantine-color-text)",
        }}
      >
        <AppWrapper
          defaultColorScheme="light"
          theme={configThemeMantine}
          withQuery
        >
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
