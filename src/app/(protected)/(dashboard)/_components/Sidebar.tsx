"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";
import AddUrlModal from "./AddUrlModal";

export default function Sidebar() {
const [open, setOpen] = useState(false);
  return (
    <div className="h-screen w-[260px] border-r flex flex-col justify-between cursor-pointer p-4">
      
      {/* Top */}
      <div>
        <button onClick={() => setOpen(true)} className="w-full bg-black border text-white py-2 rounded-lg">
          + Add URL
        </button>

        {/* Projects list (future) */}
        <div className="mt-6 space-y-2">
          {/* Empty for now */}
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