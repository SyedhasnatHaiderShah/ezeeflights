"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  listAdminPackages, 
  createAdminPackage, 
  updateAdminPackage, 
  deleteAdminPackage,
  listAdminFlightDeals,
  createAdminFlightDeal,
  updateAdminFlightDeal,
  deleteAdminFlightDeal,
  AdminPackage 
} from "@/lib/api/admin-api";
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Image as ImageIcon,
  Globe,
  Plane,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import { cn } from "@/lib/utils";

export function AdminPackageManagement({ type }: { type: "package" | "flight_deal" }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<AdminPackage | null>(null);
  const [status, setStatus] = useState<string>("draft");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-packages", search, limit, page, type],
    queryFn: () => 
      type === "flight_deal" 
        ? listAdminFlightDeals({ destination: search, limit, page })
        : listAdminPackages({ destination: search, limit, page }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: Partial<AdminPackage>) => 
      type === "flight_deal" ? createAdminFlightDeal(payload) : createAdminPackage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: `${type === "package" ? "Package" : "Flight Deal"} created successfully`,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AdminPackage> }) =>
      type === "flight_deal" ? updateAdminFlightDeal(id, payload) : updateAdminPackage(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      setEditingPackage(null);
      toast({
        title: "Success",
        description: `${type === "package" ? "Package" : "Flight Deal"} updated successfully`,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => 
      type === "flight_deal" ? deleteAdminFlightDeal(id) : deleteAdminPackage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-packages"] });
      toast({
        title: "Success",
        description: `${type === "package" ? "Package" : "Flight Deal"} deleted successfully`,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload: Partial<AdminPackage> = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      destination: formData.get("destination") as string,
      country: formData.get("country") as string,
      durationDays: parseInt(formData.get("durationDays") as string),
      basePrice: parseFloat(formData.get("basePrice") as string),
      currency: "USD",
      type: type,
      thumbnailUrl: formData.get("thumbnailUrl") as string,
      originCity: formData.get("originCity") as string,
      airlineName: formData.get("airlineName") as string,
      isFlashSale: formData.get("isFlashSale") === "on",
      status: formData.get("status") as any || "draft",
      pricing: {
        adultPrice: parseFloat(formData.get("basePrice") as string),
        childPrice: Math.round(parseFloat(formData.get("basePrice") as string) * 0.8),
        infantPrice: Math.round(parseFloat(formData.get("basePrice") as string) * 0.4),
      },
      inclusions: [
        { type: "flight", description: "Economy Airfare" },
        { type: "hotel", description: "4-Star Hotel" }
      ],
      exclusions: ["Visa Fees", "Personal Expenses"]
    };

    if (editingPackage) {
      updateMutation.mutate({ id: editingPackage.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            placeholder="Search by destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border rounded-xl h-11"
          />
        </div>
        <div className="flex items-center gap-3">
          <Select value={limit.toString()} onValueChange={(val) => setLimit(parseInt(val))}>
            <SelectTrigger className="w-[140px] h-11 bg-card border-border rounded-xl font-bold">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 per page</SelectItem>
              <SelectItem value="20">20 per page</SelectItem>
              <SelectItem value="50">50 per page</SelectItem>
            </SelectContent>
          </Select>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-redmix hover:bg-red-600 text-white rounded-xl h-11 px-6 font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Add New {type === "package" ? "Package" : "Flight Deal"}
        </Button>
      </div>
    </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">{type === "package" ? "Package" : "Deal"}</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Destination</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Price</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10">Deals</TableHead>
              <TableHead className="font-bold text-xs uppercase tracking-wider text-foreground h-10 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse border-border">
                  <TableCell colSpan={6} className="py-3">
                    <div className="h-12 bg-muted rounded-lg w-full" />
                  </TableCell>
                </TableRow>
              ))
            ) : data?.data?.map((pkg) => (
              <TableRow key={pkg.id} className="hover:bg-muted/30 border-border transition-colors">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      {pkg.thumbnailUrl ? (
                        <img src={pkg.thumbnailUrl} alt={pkg.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground leading-tight">{pkg.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider mt-1">
                        {pkg.durationDays} Days · {pkg.airlineName || "Multiple Airlines"}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Globe size={14} className="text-muted-foreground" />
                      {pkg.destination}, {pkg.country}
                    </div>
                    {pkg.originCity && (
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold mt-1">
                        <Plane size={12} /> FROM {pkg.originCity.toUpperCase()}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <div className="font-bold text-foreground">
                    ${pkg.basePrice}
                    <span className="text-[10px] text-muted-foreground ml-1">USD</span>
                  </div>
                </TableCell>
                <TableCell className="py-3">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                      pkg.status === "published" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      pkg.status === "draft" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-50 text-slate-700 border-slate-200"
                    )}
                  >
                    {pkg.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-3">
                  {pkg.isFlashSale && (
                    <Badge className="bg-redmix/10 text-redmix border-redmix/20 rounded-full px-2 py-0.5 text-[9px] font-black uppercase italic">
                      Flash Sale
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPackage(pkg)}
                      className="h-8 w-8 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this package?")) {
                          deleteMutation.mutate(pkg.id);
                        }
                      }}
                      className="h-8 w-8 rounded-lg hover:bg-red-50 hover:text-redmix transition-colors"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isAddModalOpen || !!editingPackage} onOpenChange={(open) => {
        if (!open) {
          setIsAddModalOpen(false);
          setEditingPackage(null);
        }
      }}>
        <DialogContent className="max-w-2xl rounded-3xl p-0 overflow-hidden border-border bg-card shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-6 border-b border-border bg-muted/30">
              <DialogTitle className="text-xl font-bold tracking-tight">
                {editingPackage ? `Edit ${type === "package" ? "Package" : "Deal"}` : `Create New ${type === "package" ? "Package" : "Deal"}`}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 overflow-y-auto max-h-[60vh]">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Package Title</Label>
                <Input name="title" defaultValue={editingPackage?.title} placeholder="e.g. Paris Romantic Getaway" required className="bg-card rounded-xl h-11 border-border font-bold text-base" />
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Description</Label>
                <textarea 
                  name="description" 
                  defaultValue={editingPackage?.description}
                  required 
                  className="w-full min-h-[100px] bg-card rounded-xl border border-border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-redmix/20 transition-all"
                  placeholder="Tell traveler about this amazing experience..."
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 text-redmix">Destination City</Label>
                <Input name="destination" defaultValue={editingPackage?.destination} placeholder="e.g. Paris" required className="bg-card rounded-xl h-11 border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Country</Label>
                <Input name="country" defaultValue={editingPackage?.country} placeholder="e.g. France" required className="bg-card rounded-xl h-11 border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 text-redmix">Origin City (Optional)</Label>
                <Input name="originCity" defaultValue={editingPackage?.originCity || ""} placeholder="e.g. London" className="bg-card rounded-xl h-11 border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Airline Name (Optional)</Label>
                <Input name="airlineName" defaultValue={editingPackage?.airlineName || ""} placeholder="e.g. Air France" className="bg-card rounded-xl h-11 border-border" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Base Price (USD)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input name="basePrice" type="number" min="0" defaultValue={editingPackage?.basePrice} required className="pl-10 bg-card rounded-xl h-11 border-border" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Duration (Days)</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input name="durationDays" type="number" min="1" defaultValue={editingPackage?.durationDays} required className="pl-10 bg-card rounded-xl h-11 border-border" />
                </div>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Thumbnail Image URL</Label>
                <Input name="thumbnailUrl" defaultValue={editingPackage?.thumbnailUrl || ""} placeholder="https://unsplash.com/..." className="bg-card rounded-xl h-11 border-border" />
              </div>

              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
                <Checkbox 
                  name="isFlashSale" 
                  id="isFlashSale"
                  defaultChecked={editingPackage?.isFlashSale}
                />
                <Label htmlFor="isFlashSale" className="text-sm font-bold cursor-pointer flex flex-col">
                  Featured Flash Sale
                  <span className="text-[10px] text-muted-foreground font-normal">Show special badge & countdown</span>
                </Label>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Status</Label>
                <Select name="status" defaultValue={editingPackage?.status || "draft"} onValueChange={setStatus}>
                  <SelectTrigger className="w-full h-11 bg-card rounded-xl border-border font-bold">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <input type="hidden" name="status" value={status} />
              </div>
            </div>

            <DialogFooter className="p-6 border-t border-border bg-muted/10">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => { setIsAddModalOpen(false); setEditingPackage(null); }}
                className="rounded-xl h-11 px-6 border-border font-bold"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-redmix hover:bg-red-600 text-white rounded-xl h-11 px-8 font-black flex items-center gap-2 shadow-lg shadow-redmix/20"
              >
                {(createMutation.isPending || updateMutation.isPending) ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white" />
                ) : editingPackage ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Plus size={18} />
                )}
                {editingPackage ? "Save Changes" : "Create Package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
