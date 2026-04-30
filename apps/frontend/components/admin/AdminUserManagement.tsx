"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  AdminUser,
} from "@/lib/api/admin-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Edit2, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: listUsers,
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsAddOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const filteredUsers = (users ?? []).filter(
    (u) =>
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      id: editingUser.id,
      data: {
        email: formData.get("email") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        role: formData.get("role") as string,
      },
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      password: (formData.get("password") as string) || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
        <h2 className="text-xl font-black tracking-tight">User Management</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 w-full md:w-[300px] rounded-full bg-muted/50 border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ✅ FIX 1: modal={false} on the Add Dialog */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen} modal={false}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 px-4 h-9"
              >
                <Plus className="h-3.5 w-3.5" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem]">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-firstName">First Name</Label>
                    <Input
                      id="add-firstName"
                      name="firstName"
                      placeholder="First Name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-lastName">Last Name</Label>
                    <Input
                      id="add-lastName"
                      name="lastName"
                      placeholder="Last Name"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-email">Email Address</Label>
                  <Input
                    id="add-email"
                    name="email"
                    type="email"
                    placeholder="Email Address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="add-password">Password</Label>
                  <Input
                    id="add-password"
                    name="password"
                    type="password"
                    placeholder="Password (Optional)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  {/* ✅ modal removed from Select */}
                  <Select name="role" defaultValue="USER">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="z-[200]">
                      <SelectGroup>
                        <SelectLabel>System Roles</SelectLabel>
                        <SelectItem value="USER">Standard User</SelectItem>
                        <SelectItem value="ADMIN">
                          System Administrator
                        </SelectItem>
                        <SelectItem value="SUPPORT">Support Agent</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create User"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground h-10">
                User
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground h-10">
                Role
              </TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground h-10">
                Joined
              </TableHead>
              <TableHead className="text-right font-bold text-xs uppercase tracking-wider text-muted-foreground h-10">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-muted-foreground"
                >
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors border-border"
                >
                  <TableCell className="py-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-foreground">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {user.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-black px-2 py-0 h-5 rounded-md",
                        user.role === "ADMIN"
                          ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200/50"
                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200/50",
                      )}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-[11px] font-bold py-3">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingUser(user)}
                        className="rounded-full hover:bg-muted"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this user?",
                            )
                          ) {
                            deleteMutation.mutate(user.id);
                          }
                        }}
                        className="rounded-full hover:bg-red-500/10 text-red-500 dark:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ✅ FIX 2: modal={false} on the Edit Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        modal={false}
      >
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    placeholder="First Name"
                    defaultValue={editingUser.firstName}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    placeholder="Last Name"
                    defaultValue={editingUser.lastName}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Email Address"
                  defaultValue={editingUser.email}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                {/* ✅ modal removed from Select */}
                <Select name="role" defaultValue={editingUser.role}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent className="z-[200]">
                    <SelectGroup>
                      <SelectLabel>System Roles</SelectLabel>
                      <SelectItem value="USER">Standard User</SelectItem>
                      <SelectItem value="ADMIN">
                        System Administrator
                      </SelectItem>
                      <SelectItem value="SUPPORT">Support Agent</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary text-primary-foreground"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Update User"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
