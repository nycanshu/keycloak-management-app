"use client";

import { use, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const name = searchParams.get("name");
  const status = searchParams.get("enabled") === "true";

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/organization/${id}`);
        if (!res.ok) throw new Error("Failed to fetch members");
        const data = await res.json();
        console.log(data);
        setMembers(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchMembers();
  }, [id]);

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Organization: {name || id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between">
            <div>
              Status:{" "}
              {status === true ? (
                <Badge className="bg-green-500" variant="default">
                  Active
                </Badge>
              ) : (
                <Badge className="bg-red-500" variant="default">
                  Inactive
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-center">
              <Button
                onClick={() => router.push("/user-management/create-user")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading members...</div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : members.length === 0 ? (
            <div>No members found for this organization.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border">
                <thead>
                  <tr className="bg-muted">
                    <th className="px-4 py-2 text-left">Username</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Email Verified</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Membership Type</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((user) => (
                    <tr key={user.id} className="border-b">
                      <td className="px-4 py-2">{user.username}</td>
                      <td className="px-4 py-2">{user.email}</td>
                      <td className="px-4 py-2">
                        {user.emailVerified ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {user.enabled ? (
                          <Badge className="bg-green-500" variant="default">
                            Active
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500" variant="default">
                            Inactive
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {user.createdTimestamp
                          ? new Date(user.createdTimestamp).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {user.membershipType || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
