"use client";

import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import AddUrlModal from "./AddUrlModal";
import { usePathname, useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { projects, setProjects } = useProjectStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/project");
        const data = await res.json();

        if (!res.ok) {
          console.error(data.error);
          return;
        }

        setProjects(data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="h-screen w-[260px] border-r flex flex-col justify-between cursor-pointer p-4">
      {/* Top */}
      <div>
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-black border text-white py-2 rounded-lg"
        >
          + Add URL
        </button>

        {/* Projects list (future) */}
        <div className="mt-6 space-y-2 max-h-[400px] overflow-y-auto">
          {projects.map((project) => {
            const isActive = pathname?.includes(project.id);

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/project/${project.id}`)}
                className={`p-2 rounded-lg cursor-pointer 
        ${isActive ? "bg-neutral-800 text-white" : "hover:bg-neutral-600"}
      `}
              >
                {project.title}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full border py-2 rounded-lg cursor-pointer"
      >
        Logout
      </button>
      <AddUrlModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
