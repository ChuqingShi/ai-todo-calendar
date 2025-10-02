import { redirect } from "next/navigation";

/**
 * Home Page
 * Redirects to /todos by default
 */
export default function Home() {
  redirect("/todos");
}
