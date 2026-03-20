"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";


type Props = {
  type: "login" | "register";
};

export default function AuthForm({ type }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  
  const handleSubmit = async () => {
    if (!email || !password) return;

    try {
      if (type === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });
      }

      if (type === "login") {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: true,
          callbackUrl: "/",
        });

        if (res?.error) {
          alert("Invalid credentials");
          return;
        }
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
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