import { LiveReload, Outlet, Links } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

import globalStyleUrl from '~/styles/global.css';
import globalMediumUrl from '~/styles/global-medium.css';
import globalLargeUrl from '~/styles/global-large.css';

export const links: LinksFunction = () => {
  return [
    {
      rel: 'stylesheet',
      href: globalStyleUrl,
    },
    {
      rel: 'stylesheet',
      href: globalMediumUrl,
      media: 'print, (min-width: 640px)'
    },
    {
      rel: 'stylesheet',
      href: globalLargeUrl,
      media: 'screen and (min-width: 1024px)',
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>Remix: So great, it's funny!</title>
        <Links />
      </head>
      <body>
        <Outlet/>
        <LiveReload />
      </body>
    </html>
  );
}
