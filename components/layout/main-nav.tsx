import { getSession } from "@/lib/auth";
import { MainNavClient } from "@/components/layout/main-nav-client";

export async function MainNav() {
  const session = await getSession();
  return <MainNavClient session={session ? { role: session.role, name: session.name, email: session.email } : null} />;
}
