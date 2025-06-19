"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserFormDialog } from "@/components/user-form-dialog"
import { Plus, Users, Mail, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

// Mock user data
const mockOrganizations = [
  {
    id: 1,
    name: "Organization 1",
    createdAt: "2024-01-15",
    status: "Active",
  },  
  {
    id: 2,
    name: "Organization 2",
    createdAt: "2024-01-10",
    status: "Active",
  },
  {
    id: 3,
    name: "Organization 3",
    createdAt: "2024-01-05",
  },
]

export default function UserManagement() {

  const router = useRouter()

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage Keycloak users and their permissions</p>
        </div>
        <Button onClick={() => 
          router.push("/user-management/create-user")
        }>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrganizations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          {/*   <CardContent>
            <div className="text-2xl font-bold">{mockOrganizations.filter((user) => user.status === "Active").length}</div>
          </CardContent> */}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          {/*         <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent> */}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization List</CardTitle>
          <CardDescription>A list of all organizations in your Keycloak instance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockOrganizations.map((organization) => (
              <div key={organization.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{organization.name}</p>
                    <p className="text-sm text-muted-foreground">{organization.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">Created: {organization.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
