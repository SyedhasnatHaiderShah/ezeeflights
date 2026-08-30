"use client";

import { useQuery } from "@tanstack/react-query";
import { adminGetCrmUsers, adminGetCrmBookings } from "@/lib/api/admin-api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Users, FileText } from "lucide-react";

export function AdminCrmData() {
  const usersQuery = useQuery({
    queryKey: ["admin-crm-users"],
    queryFn: () => adminGetCrmUsers(10),
  });

  const bookingsQuery = useQuery({
    queryKey: ["admin-crm-bookings"],
    queryFn: () => adminGetCrmBookings(10),
  });

  return (
    <div className="space-y-8">
      {/* CRM Users Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
          <Users className="w-5 h-5 text-redmix" />
          <h2 className="font-semibold text-lg">Recent Users (tbl_users)</h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {usersQuery.isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : usersQuery.error ? (
            <div className="p-4 text-sm text-red-500">Failed to load users</div>
          ) : !usersQuery.data?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No users found in CRM
            </div>
          ) : (
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersQuery.data.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-xs">
                      {user.id}
                    </TableCell>
                    <TableCell>
                      {user.first_name || user.firstName} {user.last_name || user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-redmix/10 text-redmix rounded-md text-xs font-semibold">
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>{user.phone || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.created_at || user.createdAt
                        ? format(new Date(user.created_at || user.createdAt), "PPp")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* CRM Bookings Section */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/50 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold text-lg">
            Recent Bookings (tbl_customerdetails)
          </h2>
        </div>
        <div className="p-0 overflow-x-auto">
          {bookingsQuery.isLoading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : bookingsQuery.error ? (
            <div className="p-4 text-sm text-red-500">
              Failed to load bookings
            </div>
          ) : !bookingsQuery.data?.length ? (
            <div className="p-8 text-center text-muted-foreground">
              No bookings found in CRM
            </div>
          ) : (
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Ref</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Travelers</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookingsQuery.data.map((booking: any) => (
                  <TableRow key={booking.customerId}>
                    <TableCell className="font-medium text-xs">
                      {booking.bookingRef || booking.customerId}
                    </TableCell>
                    <TableCell>
                      {booking.originFrom} → {booking.destinationTo}
                    </TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">
                      {booking.travelers || "No travelers"}
                    </TableCell>
                    <TableCell>{booking.email}</TableCell>
                    <TableCell className="font-semibold">
                      {booking.totalAmount}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-muted rounded-md text-xs font-semibold capitalize">
                        {booking.work_status || booking.status || "Unknown"}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {booking.created_at
                        ? format(new Date(booking.created_at), "PPp")
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}
