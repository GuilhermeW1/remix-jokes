import { Outlet, useLoaderData, Link, Form} from "@remix-run/react";
import type { LinksFunction , LoaderArgs, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import stylesUrl from '~/styles/jokes.css';
import { db } from "~/utils/db.server";
import type { Joke } from "@prisma/client";
import { getUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({request}: LoaderArgs) => {
  const user = await getUser(request)
  const jokesList = await db.joke.findMany({
    orderBy: { createdAt: "desc"},
    select: {id: true, name: true},
    take: 5,
  });
  return json({
    jokes: jokesList,
    user
  });
  // const jokes = await db.joke.findMany();
  // const data = { jokes }
  // return data
}

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: stylesUrl}]
}

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes"
            >
              <span className="logo">🤪</span>
              <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">
                  Logout
                </button>
              </Form>
            </div>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link to=".">Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokes.map((j: Joke) => (
                <li key={j.id}>
                  <Link prefetch="intent" to={j.id}>{j.name}</Link>
                </li>
              ))}
            </ul>
            <Link to="new" className="button">
              Add your own
            </Link>
          </div>
          <div className="jokes-outlet">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}