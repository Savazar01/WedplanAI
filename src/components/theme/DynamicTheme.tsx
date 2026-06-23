import * as React from "react";

interface DynamicThemeProps {
  wedding: {
    themeFont?: string | null;
    themePrimary?: string | null;
    themeSecondary?: string | null;
    themeBackground?: string | null;
    themeDarkPrimary?: string | null;
    themeDarkSecondary?: string | null;
    themeDarkBackground?: string | null;
    showcaseFont?: string | null;
    showcaseTitleFont?: string | null;
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

  // Dark Theme defaults
  const themeDarkPrimary = wedding?.themeDarkPrimary || "#808bc6";
  const themeDarkSecondary = wedding?.themeDarkSecondary || "#9fa7d6";
  const themeDarkBackground = wedding?.themeDarkBackground || "#0b0f19";

  const sanitized = font?.replace(/[^a-zA-Z0-9\s-]/g, "") || defaultFont;
  const hasFont = !!font;

  const titleFont = isShowcase ? (wedding?.showcaseTitleFont || "Playfair Display") : null;
  const sanitizedTitle = titleFont?.replace(/[^a-zA-Z0-9\s-]/g, "") || "Playfair Display";
  const hasTitleFont = isShowcase && !!titleFont;

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
      {hasTitleFont && (
        <link
          href={"https://fonts.googleapis.com/css2?family=" + encodeURIComponent(sanitizedTitle) + "&display=swap"}
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
              --color-surface: #ffffff;
              --color-outline: #cbd5e1;
              --font-sans: "${sanitized}", var(--font-geist-sans), sans-serif;
              ${isShowcase ? `--font-title: "${sanitizedTitle}", Georgia, serif;` : ""}
            }
            .dark {
              --color-primary: ${themeDarkPrimary};
              --color-secondary: ${themeDarkSecondary};
              --color-background: ${themeDarkBackground};
              --color-surface: #171d2f;
              --color-outline: #242f47;
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
