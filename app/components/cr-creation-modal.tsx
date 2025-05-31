"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus, X, Calendar } from "lucide-react"
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
  assignedTo: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  owner: User;
  assignedDevelopers: User[];
  dueDate: string;
  tasks: Task[];
}

interface CRCreationModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (cr: any) => void
  users: User[]
}

export function CRCreationModal({ open, onClose, onSubmit, users }: CRCreationModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    assignedDevelopers: [] as string[],
    tasks: [] as { description: string; assignedTo: string }[],
  })

  const [newTask, setNewTask] = useState({
    description: "",
    assignedTo: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.dueDate || formData.assignedDevelopers.length === 0) {
      return
    }

    const cr = {
      title: formData.title,
      description: formData.description,
      assignedDevelopers: formData.assignedDevelopers,
      dueDate: formData.dueDate,
      tasks: formData.tasks,
    }

    onSubmit(cr)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      assignedDevelopers: [],
      tasks: [],
    })
    setNewTask({ description: "", assignedTo: "" })
  }

  const addDeveloper = (developerId: string) => {
    if (!formData.assignedDevelopers.includes(developerId)) {
      setFormData((prev) => ({
        ...prev,
        assignedDevelopers: [...prev.assignedDevelopers, developerId],
      }))
    }
  }

  const removeDeveloper = (developerId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedDevelopers: prev.assignedDevelopers.filter((id) => id !== developerId),
    }))
  }

  const addTask = () => {
    if (newTask.description && newTask.assignedTo) {
      setFormData((prev) => ({
        ...prev,
        tasks: [...prev.tasks, { description: newTask.description, assignedTo: newTask.assignedTo }],
      }))
      setNewTask({ description: "", assignedTo: "" })
    }
  }

  const removeTask = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }))
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Change Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">CR Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter change request title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the change request"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <div className="relative">
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                required
              />
              <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assigned Developers *</Label>
            <Select onValueChange={addDeveloper}>
              <SelectTrigger>
                <SelectValue placeholder="Select developers" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id} disabled={formData.assignedDevelopers.includes(user.id)}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {user.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {user.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.assignedDevelopers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.assignedDevelopers.map((devId) => {
                  const dev = users.find((u) => u.id === devId)
                  return dev ? (
                    <Badge key={devId} variant="secondary" className="flex items-center gap-1">
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
                      <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeDeveloper(devId)} />
                    </Badge>
                  ) : null
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label>Tasks</Label>

            {/* Add new task */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(value) => setNewTask((prev) => ({ ...prev, assignedTo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.assignedDevelopers.map((devId) => {
                        const dev = users.find((u) => u.id === devId)
                        return dev ? (
                          <SelectItem key={devId} value={devId}>
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
                        ) : null
                      })}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addTask} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Task list */}
            {formData.tasks.length > 0 && (
              <div className="space-y-2">
                {formData.tasks.map((task, index) => {
                  const assignedDev = users.find((u) => u.id === task.assignedTo)
                  return (
                    <div key={index} className="flex items-center gap-2 p-3 border rounded-lg bg-white">
                      <div className="flex-1">
                        <span className="text-sm">{task.description}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {assignedDev && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarImage src={assignedDev.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {assignedDev.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-gray-600">{assignedDev.name}</span>
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTask(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Create CR
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}