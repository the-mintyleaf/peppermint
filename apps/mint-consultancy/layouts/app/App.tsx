import { configThemeMantine } from "@/config/theme";
import { AppWrapper, mantineHtmlProps } from "@zetsel/ui";

const colorSchemeScript = `try{var c=window.localStorage.getItem("mantine-color-scheme-value");var s=c==="light"||c==="dark"||c==="auto"?c:"light";var d=s!=="auto"?s:window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-mantine-color-scheme",d);}catch(e){}`;

export function LayoutApp({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        {/* Next.js 16 / React 19: <script> inside components is never executed client-side.
            <template> with dangerouslySetInnerHTML is the correct way to inject inline scripts. */}
        <template
          data-mantine-script
          dangerouslySetInnerHTML={{ __html: colorSchemeScript }}
        />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Stack+Sans+Headline:wght@200..700&family=Stack+Sans+Notch:wght@200..700&family=Stack+Sans+Text:wght@200..700&display=swap"
          rel="stylesheet"
        ></link>
      </head>
      <body
        style={{
          background: "#08120E",
        }}
      >
        <AppWrapper theme={configThemeMantine} withQuery>
          {children}
        </AppWrapper>
      </body>
    </html>
  );
}
