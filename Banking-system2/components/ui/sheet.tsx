import React, { ReactNode } from "react";

interface SheetProps {
  children: ReactNode;
  className?: string;
}

interface SheetContentProps extends SheetProps {
  side?: "left" | "right";
}

interface SheetCloseProps extends SheetProps {
  asChild?: boolean;
}

export function Sheet({ children, className }: SheetProps) {
  return <div className={className}>{children}</div>;
}

export function SheetTrigger({ children, className }: SheetProps) {
  return <>{children}</>;
}

export function SheetContent({ children, side, className }: SheetContentProps) {
  // You can optionally handle side prop if needed for styling
  return <div className={className}>{children}</div>;
}

export function SheetClose({ children, asChild }: SheetCloseProps) {
  return <>{children}</>;
}

export function SheetHeader({ children, className }: SheetProps) {
  return <div className={className}>{children}</div>;
}

export function SheetTitle({ children, className }: SheetProps) {
  return <div className={className}>{children}</div>;
}

export function SheetDescription({ children, className }: SheetProps) {
  return <div className={className}>{children}</div>;
}
