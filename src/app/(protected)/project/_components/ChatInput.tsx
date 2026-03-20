"use client";

import { useMessageStore } from "@/store/messageStore";
import { useState } from "react";

export default function ChatInput({
  projectId,
}: {
  projectId: string;
}) {
  const [message, setMessage] = useState("");
  const { addMessage } = useMessageStore();

  const handleSend = async () => {
    if (!message) return;

    const tempMessage = {
    id: Date.now().toString(),
    content: message,
    role: "user",
  };

  // instant UI update
  addMessage(tempMessage);

    try {
      const res = await fetch("/api/message", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          content: message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      setMessage("");
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="border-t p-4 flex gap-4">
      <input
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        placeholder="Ask something..."
        className="border w-full px-5 py-4 text-white focus-none"
      />
      <button
        onClick={handleSend}
        className="cursor-pointer border px-5"
      >
        Send
      </button>
    </div>
  );
}