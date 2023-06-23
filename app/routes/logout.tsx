import { redirect, type ActionArgs, type ActionFunction, type LoaderFunction } from "@remix-run/node";
import { logout } from "~/utils/session.server";

export const action: ActionFunction = ({request}: ActionArgs) => logout(request)

export const loader: LoaderFunction = () => redirect('/')