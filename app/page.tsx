"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Plus, Calendar, AlertTriangle } from "lucide-react"

interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface Task {
  id: string;
  description: string;
  status: "not-started" | "in-progress" | "completed";
  assigned_to: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  owner: User;
  assignedDevelopers: User[];
  due_date: string;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://f967cd42-26d5-422d-8deb-ff6c58b64622-00-7f8ivc75mdzv.pike.replit.dev'
  : 'https://f967cd42-26d5-422d-8deb-ff6c58b64622-00-7f8ivc75mdzv.pike.replit.dev'

export default function Dashboard() {
  const [crs, setCRs] = useState<ChangeRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Test API connection first
      const healthResponse = await fetch(`${API_BASE_URL}/health`)
      if (!healthResponse.ok) {
        throw new Error('Backend server is not responding')
      }

      // Fetch users and CRs
      const [usersResponse, crsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users`),
        fetch(`${API_BASE_URL}/api/crs`)
      ])

      if (!usersResponse.ok || !crsResponse.ok) {
        throw new Error('Failed to fetch data from API')
      }

      const usersData = await usersResponse.json()
      const crsData = await crsResponse.json()

      setUsers(usersData.data || [])
      setCRs(crsData.data || [])

    } catch (err) {
      console.error('Error loading data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const filteredCRs = crs.filter(cr => {
    if (filters.status && cr.status !== filters.status) return false
    if (filters.search && !cr.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800"
      case "in-progress": return "bg-blue-100 text-blue-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "blocked": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Connection Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
            Retry Connection
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Change Request Dashboard</h1>
            <p className="text-gray-600">Total CRs: {crs.length} | Users: {users.length}</p>
          </div>
          <Button onClick={loadData} className="bg-blue-600 hover:bg-blue-700">
            Refresh Data
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search CRs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({ status: "", search: "" })}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{crs.length}</div>
              <div className="text-sm text-gray-600">Total CRs</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{crs.filter(cr => cr.status === 'pending').length}</div>
              <div className="text-sm text-gray-600">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{crs.filter(cr => cr.status === 'in-progress').length}</div>
              <div className="text-sm text-gray-600">In Progress</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{crs.filter(cr => cr.status === 'completed').length}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </CardContent>
          </Card>
        </div>

        {/* CR Cards */}
        {filteredCRs.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests Found</h3>
            <p className="text-gray-500">No CRs match your current filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCRs.map((cr) => {
              const tasks = cr.tasks || []
              const completedTasks = tasks.filter(task => task.status === "completed").length
              const totalTasks = tasks.length
              const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <Card key={cr.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {cr.title}
                      </CardTitle>
                      <Badge className={getStatusColor(cr.status)}>
                        {cr.status.replace("-", " ")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={cr.owner?.avatar} />
                        <AvatarFallback>
                          {cr.owner?.name?.substring(0, 2) || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{cr.owner?.name || "Unknown"}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 line-clamp-2">{cr.description}</p>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {completedTasks}/{totalTasks} tasks completed
                        </span>
                      </div>

                      {cr.due_date && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className={isOverdue(cr.due_date) ? "text-red-600 font-medium" : "text-gray-600"}>
                            Due {new Date(cr.due_date).toLocaleDateString()}
                          </span>
                          {isOverdue(cr.due_date) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                        </div>
                      )}

                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600">Assigned:</span>
                        {(cr.assignedDevelopers || []).slice(0, 3).map((dev, index) => (
                          <Avatar key={dev.id} className="w-6 h-6">
                            <AvatarImage src={dev.avatar} />
                            <AvatarFallback className="text-xs">
                              {dev.name?.substring(0, 2) || "??"}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {(cr.assignedDevelopers || []).length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{(cr.assignedDevelopers || []).length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}