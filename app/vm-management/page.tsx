import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Server, Plus, Power, Settings } from "lucide-react"

const mockVMs = [
  {
    id: 1,
    name: "web-server-01",
    status: "Running",
    cpu: "2 vCPU",
    memory: "4GB RAM",
    storage: "50GB SSD",
  },
  {
    id: 2,
    name: "database-01",
    status: "Running",
    cpu: "4 vCPU",
    memory: "8GB RAM",
    storage: "100GB SSD",
  },
  {
    id: 3,
    name: "backup-server",
    status: "Stopped",
    cpu: "1 vCPU",
    memory: "2GB RAM",
    storage: "200GB HDD",
  },
]

export default function VMManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">VM Management</h1>
          <p className="text-muted-foreground">Manage your virtual machines and resources</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create VM
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total VMs</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVMs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Power className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVMs.filter((vm) => vm.status === "Running").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stopped</CardTitle>
            <Power className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockVMs.filter((vm) => vm.status === "Stopped").length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Virtual Machines</CardTitle>
          <CardDescription>Manage and monitor your virtual machine instances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockVMs.map((vm) => (
              <div key={vm.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Server className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{vm.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vm.cpu} • {vm.memory} • {vm.storage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{vm.status}</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${vm.status === "Running" ? "bg-green-500" : "bg-red-500"}`} />
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
