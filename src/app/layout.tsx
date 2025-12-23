
export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{}>;
}) {

  // The `suppressHydrationWarning` attribute in <body> is used to prevent hydration errors caused by Sentry Overlay,
  // which dynamically adds a `style` attribute to the body tag.

  return (
    <html lang="en">
      <body suppressHydrationWarning>
          {props.children}

      </body>
    </html>
  );
}
