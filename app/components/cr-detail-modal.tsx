"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, Edit, Calendar, AlertTriangle, Plus, Trash2, Save, ChevronDown, ChevronUp } from "lucide-react"
import { CREditModal } from "./cr-edit-modal"
import { mockUsers, type ChangeRequest, type Task } from "../lib/mock-data"
import { useToast } from "@/hooks/use-toast"

interface CRDetailModalProps {
  cr: ChangeRequest
  onClose: () => void
  onUpdate: (cr: ChangeRequest) => void
  onDelete: (crId: string) => void
}

export function CRDetailModal({ cr, onClose, onUpdate, onDelete }: CRDetailModalProps) {
  const [currentCR, setCurrentCR] = useState<ChangeRequest>(cr)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newTask, setNewTask] = useState({ description: "", assignedTo: "" })
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false)
  const { toast } = useToast()

  const completedTasks = currentCR.tasks.filter((task) => task.status === "completed").length
  const totalTasks = currentCR.tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

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

  const isDueSoon = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 3 && diffDays >= 0
  }

  const isOverdue = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    return due < now
  }

  const handleTaskStatusChange = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = currentCR.tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task))

    const updatedCR = {
      ...currentCR,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    }

    setCurrentCR(updatedCR)

    toast({
      title: "Task Updated",
      description: `Task marked as ${newStatus.replace("-", " ")}`,
    })
  }

  const addTask = () => {
    if (newTask.description && newTask.assignedTo) {
      const task: Task = {
        id: `task-${Date.now()}`,
        description: newTask.description,
        status: "not-started",
        assignedTo: mockUsers.find((u) => u.id === newTask.assignedTo) || currentCR.assignedDevelopers[0],
      }

      const updatedCR = {
        ...currentCR,
        tasks: [...currentCR.tasks, task],
        updatedAt: new Date().toISOString(),
      }

      setCurrentCR(updatedCR)
      setNewTask({ description: "", assignedTo: "" })

      toast({
        title: "Task Added",
        description: "New task has been added to the CR",
      })
    }
  }

  const deleteTask = (taskId: string) => {
    const updatedTasks = currentCR.tasks.filter((task) => task.id !== taskId)
    const updatedCR = {
      ...currentCR,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    }

    setCurrentCR(updatedCR)

    toast({
      title: "Task Deleted",
      description: "Task has been removed from the CR",
    })
  }

  const saveChanges = () => {
    onUpdate(currentCR)
    toast({
      title: "Changes Saved",
      description: "All changes have been saved successfully",
    })
  }

  const handleEdit = (updatedCR: ChangeRequest) => {
    setCurrentCR(updatedCR)
    setShowEditModal(false)
    toast({
      title: "CR Updated",
      description: "Change request has been updated successfully",
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this change request?")) {
      onDelete(currentCR.id)
      toast({
        title: "CR Deleted",
        description: "Change request has been deleted",
      })
    }
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <DialogTitle className="text-xl">{currentCR.title}</DialogTitle>
                <Badge className={getStatusBadgeColor(currentCR.status)}>{currentCR.status.replace("-", " ")}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowEditModal(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit CR
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Metadata Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium">
                    Description
                    {isDescriptionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {currentCR.description || "No description provided"}
                    </p>
                  </CollapsibleContent>
                </Collapsible>

                <div>
                  <h4 className="text-sm font-medium mb-2">Assigned Developers</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentCR.assignedDevelopers.map((dev) => (
                      <div key={dev.id} className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={dev.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {dev.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dev.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium">Due Date:</span>
                  <span
                    className={`text-sm ${isOverdue(currentCR.dueDate) ? "text-red-600 font-medium" : isDueSoon(currentCR.dueDate) ? "text-yellow-600 font-medium" : "text-gray-600"}`}
                  >
                    {new Date(currentCR.dueDate).toLocaleDateString()}
                  </span>
                  {(isOverdue(currentCR.dueDate) || isDueSoon(currentCR.dueDate)) && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-lg font-bold">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <p className="text-xs text-gray-500 mt-1">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Tasks</h3>
                <Button size="sm" onClick={addTask} disabled={!newTask.description || !newTask.assignedTo}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>

              {/* Add new task form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <Input
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Assign to developer" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentCR.assignedDevelopers.map((dev) => (
                      <SelectItem key={dev.id} value={dev.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-4 h-4">
                            <AvatarImage src={dev.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {dev.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          {dev.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Task table - Desktop */}
              <div className="hidden md:block">
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-4 font-medium">Status</th>
                        <th className="text-left p-4 font-medium">Task Description</th>
                        <th className="text-left p-4 font-medium">Assigned Developer</th>
                        <th className="text-left p-4 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentCR.tasks.map((task) => (
                        <tr key={task.id} className="border-t">
                          <td className="p-4">
                            <Select
                              value={task.status}
                              onValueChange={(value: Task["status"]) => handleTaskStatusChange(task.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="not-started">Not Started</SelectItem>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">{task.description}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {task.assignedTo.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{task.assignedTo.name}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteTask(task.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Task cards - Mobile */}
              <div className="md:hidden space-y-3">
                {currentCR.tasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <p className="font-medium flex-1">{task.description}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={task.assignedTo.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {task.assignedTo.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{task.assignedTo.name}</span>
                    </div>

                    <Select
                      value={task.status}
                      onValueChange={(value: Task["status"]) => handleTaskStatusChange(task.id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="not-started">Not Started</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {currentCR.tasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks added yet. Add your first task above.</p>
                </div>
              )}
            </div>
          </div>

          {/* Floating Save Button */}
          <div className="fixed bottom-6 right-6">
            <Button onClick={saveChanges} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showEditModal && <CREditModal cr={currentCR} onClose={() => setShowEditModal(false)} onSubmit={handleEdit} />}
    </>
  )
}
