import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SplashScreen } from "@/components/ui/splash-screen";

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return <SplashScreen />;
}
