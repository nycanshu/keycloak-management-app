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

const UserDetails: React.FC<UserDetailsProps> = ({ data }) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const { organization, client, clientRoles, user } = data;

  const handleAssignRole = async () => {
    const rolesToAssign = clientRoles.roles
      .filter((role) => selectedRoles.includes(role.id))
      .map((role) => ({ id: role.id, name: role.name }));
  
    try {
      const response = await axios.post("/api/user/assign-client-role", {
        body: {
        userId: user.id,
        clientUUID: client.clientUUID,
        roles: rolesToAssign,
        }
      });
  
      console.log("response:", response.data);
      toast({
        title: "Roles assigned successfully",
        description: "Roles assigned successfully",
        variant: "default",
      });
    } catch (err) {
      console.error("Error assigning roles:", err);
    }
  };
  

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
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
                variant={selectedRoles.includes(role.id) ? "default" : "secondary"}
                className="text-xs cursor-pointer"
                onClick={() => toggleRole(role.id)}
              >
                {role.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Assign Roles</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full max-w-lg justify-start">
                {selectedRoles.length > 0 ? `${selectedRoles.length} role(s) selected` : "Select roles to assign"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full max-w-lg">
              <Command>
                <CommandList>
                  <CommandGroup>
                    {clientRoles.roles.map((role) => (
                      <CommandItem
                        key={role.id}
                        onSelect={() => toggleRole(role.id)}
                        className="flex items-center justify-between"
                      >
                        <span>{role.name}</span>
                        {selectedRoles.includes(role.id) && <Check className="w-4 h-4 text-green-600" />}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button
            onClick={handleAssignRole}
            disabled={selectedRoles.length === 0}
            className="w-full max-w-lg bg-green-600 text-white hover:bg-green-700"
          >
            Assign Selected Roles
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
