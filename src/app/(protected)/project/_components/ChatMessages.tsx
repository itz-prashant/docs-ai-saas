"use client";

import { useMessageStore } from "@/store/messageStore";
import { useEffect, useState } from "react";

type Message = {
  id: string;
  content: string;
  role: string;
};

export default function ChatMessages({
  projectId,
}: {
  projectId: string;
}) {
  const { messages, setMessages, clearMessages } = useMessageStore();
  

  useEffect(() => {
    clearMessages();
      const fetchMessages = async () => {
    try {
      const res = await fetch(
        `/api/message?projectId=${projectId}`
      );
      const data = await res.json();

      if (!res.ok) {
        console.error(data.error);
        return;
      }

      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };
    fetchMessages();
  }, [projectId]);

  return (
    <div className="flex-1 p-6 space-y-4 overflow-y-auto max-w-4xl mx-auto w-full">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`max-w-xl p-3 rounded-lg ${
            msg.role === "user"
              ? "ml-auto bg-neutral-600 w-fit text-white"
              : "bg-white text-black"
          }`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
}