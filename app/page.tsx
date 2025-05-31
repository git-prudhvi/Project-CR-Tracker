"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Plus, Filter, Calendar, AlertTriangle } from "lucide-react"
import { CRCreationModal } from "./components/cr-creation-modal"
import { CRDetailModal } from "./components/cr-detail-modal"
import { mockUsers, type ChangeRequest } from "./lib/mock-data"
import { Skeleton } from "@/components/ui/skeleton"

// API functions
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-backend-url.vercel.app'
  : 'http://localhost:5000'

const fetchCRs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crs`)
    const data = await response.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching CRs:', error)
    return []
  }
}

const fetchUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users`)
    const data = await response.json()
    return data.success ? data.data : mockUsers
  } catch (error) {
    console.error('Error fetching users:', error)
    return mockUsers
  }
}

const createCR = async (crData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: crData.title,
        description: crData.description,
        owner_id: crData.owner.id,
        assigned_developers: crData.assignedDevelopers.map((dev: any) => dev.id),
        due_date: crData.dueDate,
        tasks: crData.tasks.map((task: any) => ({
          description: task.description,
          assigned_to: task.assignedTo.id
        }))
      }),
    })
    const data = await response.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error creating CR:', error)
    return null
  }
}

export default function Dashboard() {
  const [crs, setCRs] = useState<ChangeRequest[]>([])
  const [filteredCRs, setFilteredCRs] = useState<ChangeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedCR, setSelectedCR] = useState<ChangeRequest | null>(null)
  const [filters, setFilters] = useState({
    owner: "",
    status: "",
    search: "",
  })

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      const [crsData, usersData] = await Promise.all([
        fetchCRs(),
        fetchUsers()
      ])
      setCRs(crsData)
      setFilteredCRs(crsData)
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = crs

    if (filters.owner) {
      filtered = filtered.filter((cr) => cr.owner.id === filters.owner)
    }

    if (filters.status) {
      filtered = filtered.filter((cr) => cr.status === filters.status)
    }

    if (filters.search) {
      filtered = filtered.filter(
        (cr) =>
          cr.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          cr.description.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    setFilteredCRs(filtered)
  }, [filters, crs])

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "blocked":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays < 0
  }

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const handleCreateCR = async (newCR: Omit<ChangeRequest, "id" | "createdAt" | "updatedAt">) => {
    try {
      const crData = {
        title: newCR.title,
        description: newCR.description,
        owner_id: newCR.owner.id,
        assigned_developers: newCR.assignedDevelopers.map(dev => dev.id),
        due_date: newCR.dueDate,
        tasks: newCR.tasks.map(task => ({
          description: task.description,
          assigned_to: task.assignedTo.id
        }))
      }

      const response = await fetch(`${API_BASE_URL}/api/crs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(crData),
      })

      const data = await response.json()
      if (data.success) {
        await fetchCRs() // Refresh the list
        setShowCreateModal(false)
      } else {
        console.error("Error creating CR:", data.message)
      }
    } catch (error) {
      console.error("Error creating CR:", error)
    }
  }

  const handleUpdateCR = async (updatedCR: ChangeRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/crs/${updatedCR.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: updatedCR.status }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchCRs() // Refresh the list
      } else {
        console.error("Error updating CR:", data.message)
      }
    } catch (error) {
      console.error("Error updating CR:", error)
    }
  }

  const handleDeleteCR = async (crId: string) => {
    // Note: You'll need to implement a delete endpoint in your backend
    // For now, just close the modal
    setSelectedCR(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Change Request Tracker</h1>
            <p className="text-gray-600">Hello, John Doe!</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New CR
          </Button>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-700">Filters</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Search CRs..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
            <Select value={filters.owner} onValueChange={(value) => setFilters((prev) => ({ ...prev, owner: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All owners</SelectItem>
                {mockUsers.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setFilters({ owner: "", status: "", search: "" })}>
              Clear Filters
            </Button>
          </div>
        </div>

        {/* CR Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-6 w-full mb-4" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCRs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests Found</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first change request.</p>
            <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New CR
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCRs.map((cr) => {
              const completedTasks = cr.tasks.filter((task) => task.status === "completed").length
              const totalTasks = cr.tasks.length
              const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

              return (
                <Card
                  key={cr.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500"
                  onClick={() => setSelectedCR(cr)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-2">{cr.title}</CardTitle>
                      <Badge className={getStatusBadgeColor(cr.status)}>{cr.status.replace("-", " ")}</Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={cr.owner.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {cr.owner.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{cr.owner.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{progressPercentage}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {completedTasks}/{totalTasks} items completed
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span
                          className={`${isOverdue(cr.dueDate) ? "text-red-600 font-medium" : isDueSoon(cr.dueDate) ? "text-yellow-600 font-medium" : "text-gray-600"}`}
                        >
                          Due {new Date(cr.dueDate).toLocaleDateString()}
                        </span>
                        {(isOverdue(cr.dueDate) || isDueSoon(cr.dueDate)) && (
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
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

      {/* Modals */}
      <CRCreationModal open={showCreateModal} onClose={() => setShowCreateModal(false)} onSubmit={handleCreateCR} />

      {selectedCR && (
        <CRDetailModal
          cr={selectedCR}
          onClose={() => setSelectedCR(null)}
          onUpdate={handleUpdateCR}
          onDelete={handleDeleteCR}
        />
      )}
    </div>
  )
}