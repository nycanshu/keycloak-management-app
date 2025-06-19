"use client"
import { useToast } from "@/hooks/use-toast";
import React, { useState } from "react";

export default function CreateUserPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string) => {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setEmail("");
        setError(null);
      } else {
        setError(data.message || "An error occurred. Please try again.");
        toast({
          title: "Error",
          description: data.message || "An error occurred. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setError("Network error. Please try again later.");
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
            className={`px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${error ? 'border-red-500' : 'border-input'}`}
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
          />
          {error && (
            <span className="text-red-500 text-xs mt-1">{error}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
