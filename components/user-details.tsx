"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { CheckCircle, UserCheck, Check } from "lucide-react";
import axios from "axios";
import { toast } from "./ui/use-toast";

interface UserDetailsProps {
  data: {
    organization: {
      id: string;
      name: string;
    };
    client: {
      clientUUID: string;
      clientId: string;
      name: string;
    };
    clientRoles: {
      clientId: string;
      roles: {
        name: string;
        id: string;
        description: string;
      }[];
    };
    user: {
      id: string;
      email: string;
      username: string;
      enabled: boolean;
      emailVerified: boolean;
    };
  };
}

type Role = {
  id: string;
  name: string;
  description: string;
}

const UserDetails: React.FC<UserDetailsProps> = ({ data }) => {
  console.log("data:", data);   
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const { organization, client, clientRoles, user } = data;

  console.log("clientRoles:", clientRoles.roles);

console.log("userId:", user.id);
console.log("clientUUID:", client.clientUUID);

  const roleToAssign: Role | undefined = clientRoles.roles.find((role) => role.id === selectedRole?.id);

  const handleAssignRole = async () => {
    if (!selectedRole) return;
    try {
      const response = await axios.post("/api/user/assign-client-role", {
        userId: user.id,
        clientUUID: client.clientUUID,
        roles: roleToAssign ? [roleToAssign] : [],
      });
      toast({
        title: "Role assigned successfully",
        description: `Role '${roleToAssign?.name}' assigned successfully!`,
        variant: "default",
      });
      window.location.reload();
    } catch (err) {
      console.error("Error assigning role:", err);
    }
  };
  

  return (
    <Card className="w-full max-w-3xl mx-auto mt-5 shadow-lg border border-muted-foreground/10">
      <CardHeader className="bg-primary bg-green-600 text-white rounded-t-xl p-6">
        <CardTitle className="text-2xl flex items-center gap-2">
          <UserCheck className="w-6 h-6" /> User Created Successfully
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">User Email</Label>
            <div className="text-base font-medium text-foreground bg-muted rounded-md px-3 py-2">
              {user.email}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Username</Label>
            <div className="text-base font-medium text-foreground bg-muted rounded-md px-3 py-2">
              {user.username}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Organization</Label>
            <div className="text-base font-medium text-foreground bg-muted rounded-md px-3 py-2">
              {organization.name} <span className="text-xs text-muted-foreground">({organization.id})</span>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Client</Label>
            <div className="text-base font-medium text-foreground bg-muted rounded-md px-3 py-2">
              {client.name} <span className="text-xs text-muted-foreground">({client.clientId})</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">Available Client Roles</Label>
          <div className="flex flex-wrap gap-2">
            {clientRoles.roles.map((role) => (
              <Badge
                key={role.id}
                variant={selectedRole?.id === role.id ? "default" : "secondary"}
                className={`text-xs cursor-pointer transition-all duration-150 ${selectedRole?.id === role.id ? "ring-2 ring-green-500" : ""}`}
                onClick={() => setSelectedRole(role)}
              >
                {role.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Assign Role</Label>
          <div className="flex flex-row items-center gap-3 w-full max-w-lg">
            <div className="flex-1 min-w-0" style={{ flexBasis: '70%' }}>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start truncate">
                    {selectedRole
                      ? clientRoles.roles.find((r) => r.id === selectedRole?.id)?.name
                      : "Select a role to assign"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full max-w-lg">
                  <Command>
                    <CommandList>
                      <CommandGroup>
                        {clientRoles.roles.map((role) => (
                          <CommandItem
                            key={role.id}
                            onSelect={() => setSelectedRole(role)}
                            className="flex items-center justify-between"
                          >
                            <span>{role.name}</span>
                            {selectedRole?.id === role.id && <Check className="w-4 h-4 text-green-600" />}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div style={{ flexBasis: '30%' }} className="flex-shrink-0">
              <Button
                onClick={handleAssignRole}
                disabled={!selectedRole}
                className="w-full bg-green-600 text-white hover:bg-green-700"
              >
                Assign
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
