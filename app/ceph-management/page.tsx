import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Plus, HardDrive, Activity } from "lucide-react"

const mockPools = [
  {
    id: 1,
    name: "rbd-pool",
    size: "500GB",
    used: "320GB",
    available: "180GB",
    status: "Healthy",
  },
  {
    id: 2,
    name: "cephfs-data",
    size: "10TB",
    used: "650GB",
    available: "350GB",
    status: "Healthy",
  },
  {
    id: 3,
    name: "backup-pool",
    size: "2TB",
    used: "1.2TB",
    available: "800GB",
    status: "Warning",
  },
]

export default function CephManagement() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">CEPH Management</h1>
          <p className="text-muted-foreground">Monitor and manage your CEPH storage cluster</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Pool
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.5TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.17TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <HardDrive className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1.33TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">OK</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Pools</CardTitle>
          <CardDescription>Monitor your CEPH storage pools and their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPools.map((pool) => (
              <div key={pool.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <Database className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{pool.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {pool.used} used of {pool.size} • {pool.available} available
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium">{pool.status}</p>
                    <div className="w-32 bg-muted rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full max-w-full ${pool.status === "Healthy" ? "bg-green-500" : "bg-yellow-500"}`}
                        style={{
                          width: `${(Number.parseInt(pool.used) / Number.parseInt(pool.size)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${pool.status === "Healthy" ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
