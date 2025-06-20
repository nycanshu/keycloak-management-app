"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Users, Mail, Calendar } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function UserManagement() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizations() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/organizations");
        if (!res.ok) throw new Error("Failed to fetch organizations");
        const data = await res.json();
        setOrganizations(data || []);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchOrganizations();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage Keycloak users and their permissions
          </p>
        </div>
        <Button onClick={() => router.push("/user-management/create-user")}>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Organizations
            </CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter((org) => org.enabled === true).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization List</CardTitle>
          <CardDescription>
            A list of all organizations in your Keycloak instance
          </CardDescription>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div>Loading organizations...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="flex flex-col gap-2">
              {organizations.map((organization: any) => (
                <Link
                  href={{
                    pathname: `/user-management/organizations/${organization.id}`,
                    query: {
                      name: organization.name,
                      enabled: organization.enabled as boolean,
                    },
                  }}
                  key={organization.id || organization.name}
                >
                  <div
                    key={organization.id || organization.name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{organization.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Domains:{" "}
                          {organization.domains &&
                          organization.domains.length > 0
                            ? organization.domains
                                .map((d: any) => d.name)
                                .join(", ")
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span
                        className={`text-xs font-semibold ${
                          organization.enabled
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {organization.enabled ? "Active" : "Inactive"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Created: N/A
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
