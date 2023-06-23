import bcrypt from "bcrypt";
import {
  createCookieSessionStorage,
  redirect,
} from "@remix-run/node";

import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({
  username,
  password,
}: LoginForm) {
  const user = await db.user.findUnique({
    where: { username },
  });
  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  if (!isCorrectPassword) {
    return null;
  }

  return { id: user.id, username };
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession(
  userId: string,
  redirectTo: string
) {
  const session = await storage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

async function getUserSession(request: Request){
  return storage.getSession(request.headers.get("Cookie"))
}

export async function getUserId(request: Request){
  const session = await getUserSession(request)
  const userId =  session.get("userId")
  if(typeof userId !== 'string') return null 
  return userId
} 

export async function requireUserId(
  request: Request, 
  redirectTo: string = new URL(request.url).pathname
){
  console.log(redirectTo)
  const userId = await getUserId(request)
  if(!userId || typeof userId !== 'string') {
  
    let url = new URLSearchParams([
      ["redirectTo", redirectTo]
    ])
    throw redirect(`/login?${url}`)
  }
  return userId
}

export async function getUser(request: Request){
  const userId = await getUserId(request)
  if(!userId) return null
  return db.user.findFirst({where: {id: userId}})
}

export async function logout(request: Request){
  const session =  await getUserSession(request)
  return redirect (`/jokes`, {
    headers: {
      "Set-Cookie": await storage.destroySession(session)
    }
  })
}

export async function register({username, password}: LoginForm){
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {username, passwordHash}
  });
  return {id: user.id, username}
}