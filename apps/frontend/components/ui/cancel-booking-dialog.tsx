"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { cn } from "@/lib/utils";

interface CancelBookingDialogProps {
  onConfirm: () => void;
  trigger: React.ReactNode;
  title?: string;
  description?: string;
  confirmText?: string;
}

export function CancelBookingDialog({
  onConfirm,
  trigger,
  title = "Are you sure you want to cancel this booking?",
  description = "This action cannot be undone and your booking will be cancelled.",
  confirmText = "Yes, Cancel",
}: CancelBookingDialogProps) {
  const isConfirmAction =
    confirmText.toLowerCase().includes("confirm") ||
    confirmText.toLowerCase().includes("approve");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Go Back</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              "font-bold uppercase tracking-widest text-[10px]",
              isConfirmAction
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-rose-600 hover:bg-rose-700",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
