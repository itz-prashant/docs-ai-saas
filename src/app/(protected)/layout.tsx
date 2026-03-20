import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "./(dashboard)/_components/Sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <div className="flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Right Content */}
      <div className="flex-1 h-screen overflow-y-auto">
        {children}
      </div>
    </div>
}