"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";
import { useState } from "react";


type Props = {
  type: "login" | "register";
};

export default function AuthForm({ type }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    console.log(type, { email, password });
  };

  return (
    <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow">
      <h1 className="text-2xl font-semibold mb-6 capitalize text-black">
        {type}
      </h1>

      <div className="space-y-4 mb-4">
        <Input
          placeholder="Email"
          value={email}
          onChange={setEmail}
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={setPassword}
        />
      </div>

      <Link href={`${type === "login" ? "/register" : "/login"}`} className="text-black underline cursor-pointer">{`${type === "login" ? "Register" : "Login"}`}</Link>

      <div className="mt-6">
        <Button onClick={handleSubmit}>
          {type === "login" ? "Login" : "Register"}
        </Button>
      </div>
    </div>
  );
}