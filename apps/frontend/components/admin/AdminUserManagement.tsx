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
import { AdminDataTable, ConfirmDialog } from "./AdminDataTable";
import { PullToRefresh } from "@/components/ui/pull-to-refresh";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Edit2, Trash2, Plus, Search, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type RowEdit = Partial<AdminUser>;

export function AdminUserManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [addForm, setAddForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "USER",
  });

  const isAddFormValid =
    addForm.firstName.trim() !== "" &&
    addForm.lastName.trim() !== "" &&
    addForm.email.trim() !== "" &&
    addForm.password.trim() !== "" &&
    addForm.phone.trim() !== "";
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [rowEdits, setRowEdits] = useState<Record<string, RowEdit>>({});
  const [confirmDelete, setConfirmDelete] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    message: "",
    onConfirm: () => {},
  });

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["admin-users", page, limit, searchTerm],
    queryFn: () => listUsers(limit, page, searchTerm),
  });

  const handleRefresh = async () => {
    await refetch();
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setPage(1);
  };

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setIsAddOpen(false);
      setShowPassword(false);
      setAddForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "USER",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdminUser> }) =>
      updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setRowEdits({});
      setCheckedIds(new Set());
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setCheckedIds(new Set());
    },
  });

  const handleCheck = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleCheckAll = () => {
    if (checkedIds.size === (users?.length ?? 0)) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(users?.map((u) => u.id) ?? []));
    }
  };

  const setField = (id: string, field: keyof AdminUser, value: string) => {
    setRowEdits((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? {}), [field]: value },
    }));
  };

  const handleBulkUpdate = () => {
    const ids = checkedIds.size > 0 ? [...checkedIds] : Object.keys(rowEdits);
    ids.forEach((id) => {
      const edit = rowEdits[id];
      if (edit && Object.keys(edit).length > 0) {
        updateMutation.mutate({ id, data: edit });
      }
    });
  };

  const handleBulkDelete = () => {
    const ids = [...checkedIds];
    if (ids.length === 0) return;
    setConfirmDelete({
      isOpen: true,
      message: `Are you sure you want to delete ${ids.length} user(s)?`,
      onConfirm: () => ids.forEach((id) => deleteMutation.mutate(id)),
    });
  };

  const handleSingleDelete = (id: string) => {
    setConfirmDelete({
      isOpen: true,
      message: "Are you sure you want to delete this user?",
      onConfirm: () => deleteMutation.mutate(id),
    });
  };

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
        phone: formData.get("phone") as string,
      },
    });
  };

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createMutation.mutate({
      name: `${formData.get("firstName")} ${formData.get("lastName")}`,
      email: formData.get("email") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      role: formData.get("role") as string,
      phone: formData.get("phone") as string,
      password: (formData.get("password") as string) || undefined,
    } as any);
  };

  const isBusy =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    createMutation.isPending;

  const tableActions = (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-9 w-full md:w-[200px] rounded-full bg-muted/50 border-border h-9 text-xs"
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      <Button
        size="sm"
        className="rounded-2xl h-9 px-4 shadow-sm text-xs"
        onClick={handleBulkUpdate}
        disabled={isBusy || Object.keys(rowEdits).length === 0}
      >
        {updateMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Update"
        )}
      </Button>

      <Button
        size="sm"
        variant="destructive"
        className="rounded-2xl h-9 px-4 shadow-sm text-xs"
        onClick={handleBulkDelete}
        disabled={isBusy || checkedIds.size === 0}
      >
        {deleteMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          "Delete"
        )}
      </Button>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setShowPassword(false);
            setAddForm({
              firstName: "",
              lastName: "",
              email: "",
              password: "",
              phone: "",
              role: "USER",
            });
          }
        }}
        modal={false}
      >
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="rounded-2xl h-9 px-4 gap-1 shadow-sm text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter text-primary uppercase">
              Add New User
            </DialogTitle>
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
                  value={addForm.firstName}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Last Name</Label>
                <Input
                  id="add-lastName"
                  name="lastName"
                  placeholder="Last Name"
                  required
                  value={addForm.lastName}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
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
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-password">Password</Label>
                <div className="relative">
                  <Input
                    id="add-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    required
                    value={addForm.password}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-phone">Mobile Number</Label>
                <Input
                  id="add-phone"
                  name="phone"
                  placeholder="+123..."
                  required
                  value={addForm.phone}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                name="role"
                value={addForm.role}
                onValueChange={(val) =>
                  setAddForm((prev) => ({ ...prev, role: val }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="z-[200]">
                  <SelectGroup>
                    <SelectLabel>System Roles</SelectLabel>
                    <SelectItem value="USER">Standard User</SelectItem>
                    <SelectItem value="ADMIN">System Administrator</SelectItem>
                    <SelectItem value="SUPPORT">Support Agent</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!isAddFormValid || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create User"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );

  const hasRows = Boolean(users && users.length > 0);
  const showPagination = page > 1 || (users?.length ?? 0) >= limit;

  return (
    <>
      <PullToRefresh onRefresh={handleRefresh}>
        <AdminDataTable
        title="User Management"
        subtitle="Manage system users and access levels"
        totalCount={users?.length ?? 0}
        totalLabel="Users on page"
        isLoading={isLoading}
        headers={[
          "First Name",
          "Last Name",
          "Email",
          "Role",
          "Mobile",
          "Joined",
          "Actions",
        ]}
        actions={tableActions}
        onCheckAll={handleCheckAll}
        isAllChecked={
          checkedIds.size === (users?.length ?? 0) && (users?.length ?? 0) > 0
        }
        hasRows={hasRows}
        emptyMessage="No users found matching your search."
        pagination={
          showPagination
            ? {
                page,
                totalPages: (users?.length ?? 0) < limit ? page : page + 1,
                onPageChange: setPage,
              }
            : undefined
        }
      >
        {users?.map((user) => {
          const edit = rowEdits[user.id] ?? {};
          const val = (k: keyof AdminUser): string => {
            const valFromEdit = edit[k];
            if (valFromEdit !== undefined && valFromEdit !== null) {
              return String(valFromEdit);
            }
            const valFromUser = user[k];
            if (valFromUser !== undefined && valFromUser !== null) {
              return String(valFromUser);
            }
            return "";
          };

          return (
            <tr
              key={user.id}
              className={cn(
                "border-t border-border/60 transition-colors",
                checkedIds.has(user.id) ? "bg-primary/5" : "hover:bg-muted/30",
              )}
            >
              <td className="px-2 py-1.5 text-center">
                <Checkbox
                  checked={checkedIds.has(user.id)}
                  onCheckedChange={() => handleCheck(user.id)}
                  variant="ios"
                  className="mx-auto"
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-28 text-xs px-1.5 rounded-lg"
                  value={val("firstName")}
                  onChange={(e) =>
                    setField(user.id, "firstName", e.target.value)
                  }
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-28 text-xs px-1.5 rounded-lg"
                  value={val("lastName")}
                  onChange={(e) =>
                    setField(user.id, "lastName", e.target.value)
                  }
                />
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-48 text-xs px-1.5 rounded-lg"
                  value={val("email")}
                  onChange={(e) => setField(user.id, "email", e.target.value)}
                />
              </td>
              <td className="px-1 py-1.5">
                <Select
                  value={val("role")}
                  onValueChange={(v) => setField(user.id, "role", v)}
                >
                  <SelectTrigger className="h-7 w-28 text-xs rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER" className="text-xs">
                      USER
                    </SelectItem>
                    <SelectItem value="ADMIN" className="text-xs">
                      ADMIN
                    </SelectItem>
                    <SelectItem value="SUPPORT" className="text-xs">
                      SUPPORT
                    </SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-1 py-1.5">
                <Input
                  className="h-7 w-32 text-xs px-1.5 rounded-lg"
                  value={val("phone") || ""}
                  onChange={(e) => setField(user.id, "phone", e.target.value)}
                />
              </td>
              <td className="px-2 py-1.5 text-muted-foreground text-xs font-bold">
                {new Date(user.createdAt).toLocaleDateString()}
              </td>
              <td className="px-2 py-1.5 text-center">
                <button
                  onClick={() => handleSingleDelete(user.id)}
                  className="text-destructive hover:text-destructive/80 disabled:opacity-40"
                  disabled={isBusy}
                  title="Delete user"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          );
        })}
      </AdminDataTable>
    </PullToRefresh>

      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
        modal={false}
      >
        <DialogContent className="rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tighter text-primary uppercase">
              Edit User
            </DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="edit-phone">Mobile Number</Label>
                  <Input
                    id="edit-phone"
                    name="phone"
                    placeholder="Mobile Number"
                    defaultValue={editingUser.phone}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
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
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
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

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onOpenChange={(open) =>
          setConfirmDelete((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={confirmDelete.onConfirm}
        message={confirmDelete.message}
      />
    </>
  );
}
