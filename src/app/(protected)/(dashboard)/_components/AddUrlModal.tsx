"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/store/projectStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function AddUrlModal({ open, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const router = useRouter();
  const { addProject } = useProjectStore();

  const handleAdd = async () => {
  if (!title || !url) return;

  try {
    const res = await fetch("/api/project", {
      method: "POST",
      body: JSON.stringify({ title, url }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    onClose();

    addProject(data);
    router.push(`/project/${data.id}`);
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
};

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-6 rounded-xl">
        <h2 className="text-lg font-semibold mb-4 text-black">
          Add Documentation URL
        </h2>

        <div className="flex flex-col space-y-4">

          <Input
          type="text"
          placeholder="Enter Title"
          value={title}
          onChange={setTitle}
        />

          <Input
          type="text"
          placeholder="https://example.com/docs"
          value={url}
          onChange={setUrl}
        />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={handleAdd}>
            Add
          </Button>
        </div>
      </div>
    </div>
  );
}