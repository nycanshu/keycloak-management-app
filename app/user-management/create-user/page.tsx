"use client"
import React, { useState } from "react";

export default function CreateUserPage() {

    const [email, setEmail] = useState("")

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        console.log(email)
        fetch("/api/user", {
            method: "POST",
            body: JSON.stringify({ email })
        }).then(res => res.json()).then(data => {
            console.log(data)
        })
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={handleSubmit} className="bg-card p-8 rounded-2xl shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold text-center text-foreground">Create User</h1>

        <div className="flex flex-col space-y-2">
          <label htmlFor="email" className="text-sm text-muted-foreground">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            placeholder="example@domain.com"
            className="px-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
