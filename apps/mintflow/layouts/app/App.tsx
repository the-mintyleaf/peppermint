import { configThemeMantine } from "@/config/theme";
import { AppWrapper, mantineHtmlProps } from "@peppermint/ui";
import "@/app/globals.css";

const colorSchemeScript = `try{var c=window.localStorage.getItem("mantine-color-scheme-value");var s=c==="light"||c==="dark"||c==="auto"?c:"light";var d=s!=="auto"?s:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",d);}catch(e){}`;

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <template
          data-mantine-script
          dangerouslySetInnerHTML={{ __html: colorSchemeScript }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          background: "var(--mantine-color-body)",
          color: "var(--mantine-color-text)",
        }}
      >
        <AppWrapper defaultColorScheme="light" theme={configThemeMantine} withQuery>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
