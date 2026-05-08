import { redirect } from "next/navigation";

export default function Home() {
  // Site ilk açıldığında doğrudan giriş sayfasına yönlendirir
  redirect("/auth/login");
}
