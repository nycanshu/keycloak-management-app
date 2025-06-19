"use client";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const orgRes = await fetch(`/api/organization/${id}`);
        if (!orgRes.ok) throw new Error("Failed to fetch organization");
        const orgData = await orgRes.json();
        setOrganization(orgData);
        // Fetch members
        const membersRes = await fetch(`/api/organization/${id}/members`);
        if (!membersRes.ok) throw new Error("Failed to fetch members");
        const membersData = await membersRes.json();
        setMembers(membersData);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  return (
    <div className="p-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Organization: {organization?.name || id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground mb-2">
            Domains:{" "}
            {organization?.domains?.map((d: any) => d.name).join(", ") || "N/A"}
          </div>
          <div>
            Status:{" "}
            {organization?.enabled ? (
              <Badge variant="default">Active</Badge>
            ) : (
              <Badge variant="destructive">Inactive</Badge>
            )}
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
                        {user.enabled ? (
                          <Badge variant="default">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Inactive</Badge>
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
