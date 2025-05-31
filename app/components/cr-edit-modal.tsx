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
import { X, Calendar } from "lucide-react"
interface User {
  id: string;
  name: string;
  avatar: string;
  email: string;
}

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in-progress" | "completed" | "blocked";
  owner: User;
  assignedDevelopers: User[];
  due_date: string;
  tasks: any[];
  created_at: string;
  updated_at: string;
}

interface CREditModalProps {
  cr: ChangeRequest
  onClose: () => void
  onSubmit: (cr: ChangeRequest) => void
  users?: User[]
}

export function CREditModal({ cr, onClose, onSubmit, users = [] }: CREditModalProps) {
  const [formData, setFormData] = useState({
    title: cr.title,
    description: cr.description,
    dueDate: cr.due_date,
    status: cr.status,
    assignedDevelopers: cr.assignedDevelopers.map((dev) => dev.id),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.dueDate || formData.assignedDevelopers.length === 0) {
      return
    }

    const assignedDevs = users.filter((user) => formData.assignedDevelopers.includes(user.id))

    const updatedCR: ChangeRequest = {
      ...cr,
      title: formData.title,
      description: formData.description,
      status: formData.status as ChangeRequest["status"],
      assignedDevelopers: assignedDevs,
      due_date: formData.dueDate,
      updated_at: new Date().toISOString(),
    }

    onSubmit(updatedCR)
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Change Request</DialogTitle>
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
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Update CR
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
