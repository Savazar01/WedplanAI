import * as React from "react";

interface DynamicThemeProps {
  wedding: {
    themeFont?: string | null;
    themePrimary?: string | null;
    themeSecondary?: string | null;
    themeBackground?: string | null;
    showcaseFont?: string | null;
    showcasePrimary?: string | null;
    showcaseSecondary?: string | null;
    showcaseBackground?: string | null;
  } | null;
  mode?: "app" | "showcase";
}

export default function DynamicTheme({ wedding, mode = "app" }: DynamicThemeProps) {
  const isShowcase = mode === "showcase";
  const font = isShowcase ? wedding?.showcaseFont : wedding?.themeFont;
  const primary = isShowcase ? wedding?.showcasePrimary : wedding?.themePrimary;
  const secondary = isShowcase ? wedding?.showcaseSecondary : wedding?.themeSecondary;
  const background = isShowcase ? wedding?.showcaseBackground : wedding?.themeBackground;

  const defaultFont = isShowcase ? "Playfair Display" : "Geist";
  const defaultPrimary = isShowcase ? "#c484b0" : "#6771ab";
  const defaultSecondary = isShowcase ? "#e6b7d2" : "#8b93c5";
  const defaultBackground = isShowcase ? "#fffafb" : "#f8fafc";

  const sanitized = font?.replace(/[^a-zA-Z0-9\s-]/g, "") || defaultFont;
  const hasFont = !!font;

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {hasFont && (
        <link
          href={"https://fonts.googleapis.com/css2?family=" + encodeURIComponent(sanitized) + "&display=swap"}
          rel="stylesheet"
        />
      )}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --color-primary: ${primary || defaultPrimary};
              --color-secondary: ${secondary || defaultSecondary};
              --color-background: ${background || defaultBackground};
              --font-sans: "${sanitized}", var(--font-geist-sans), sans-serif;
            }
            body {
              font-family: var(--font-sans);
              background-color: var(--color-background);
            }
          `,
        }}
      />
    </>
  );
}
