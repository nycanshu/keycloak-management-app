"use client";
import { useToast } from "@/hooks/use-toast";
import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import UserDetails from "@/components/user-details";

export default function CreateUserPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExists, setIsExists] = useState<boolean | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const [userResponse, setUserResponse] = useState<any>(null);

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleCheckUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) return setError("Email is required");
    if (!validateEmail(email)) return setError("Enter a valid email");

    setLoading(true);
    try {
      const res = await fetch("/api/user/is-exists", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        setIsExists(true);
        toast({
          title: "User already exists",
          description: data.message,
          variant: "destructive",
        });
      } else {
        setIsExists(false);
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast({
        title: "Network Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!firstName || !lastName || !password) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/user", {
        method: "POST",
        body: JSON.stringify({ email, firstName, lastName, password }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: data.message });
        setUserResponse(data); // save user details to show component
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setError(null);
        setIsExists(null);
        setIsOwner(data.user.isOwner);
      } else {
        setError(data.message || "Failed to create user");
        toast({
          title: "Error",
          description: data.message || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast({
        title: "Network Error",
        description: "Could not connect to server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      userResponse &&
      userResponse.organization &&
      userResponse.organization.isEmailSent
    ) {
      toast({
        title: "Organization exists, User Invited Successfully",
        description: "An invitation email has been sent to the user.",
        variant: "default",
      });
    }
  }, [userResponse, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      {userResponse && !isOwner ? (
        <UserDetails data={userResponse} />
      ) : (
        <div className="bg-card p-8 rounded-2xl shadow-md w-full max-w-sm space-y-6">
          {isExists === null || isExists === true ? (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground">
                Enter email to continue
              </h1>
              <form onSubmit={handleCheckUser} className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm text-muted-foreground"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="example@domain.com"
                    className={`px-4 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                      error ? "border-red-500" : "border-input"
                    }`}
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                      setIsExists(null);
                    }}
                    disabled={loading}
                  />
                  {error && (
                    <span className="text-red-500 text-xs">{error}</span>
                  )}
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-60"
                  disabled={loading || isExists === true}
                >
                  {loading
                    ? "Checking..."
                    : isExists === true
                    ? "User Exists"
                    : "Continue"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-center text-foreground">
                Add a New User
              </h1>
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-muted-foreground">Email</label>
                  <input
                    type="email"
                    className="px-4 py-2 border rounded-md bg-muted text-foreground border-input"
                    value={email}
                    disabled
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-muted-foreground">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="px-4 py-2 border rounded-md bg-background text-foreground border-input"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-2">
                  <label className="text-sm text-muted-foreground">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="px-4 py-2 border rounded-md bg-background text-foreground border-input"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col space-y-1">
                  <label className="text-sm text-muted-foreground flex items-center gap-1">
                    Password
                    <Info className="w-4 h-4" />
                  </label>
                  <input
                    type="password"
                    className="px-4 py-2 border rounded-md bg-background text-foreground border-input"
                    placeholder="Temporary password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {error && <span className="text-red-500 text-xs">{error}</span>}
                <button
                  className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition disabled:opacity-60"
                  onClick={handleCreateUser}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
