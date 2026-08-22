"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  LayoutDashboard,
  Grid,
  MessageSquare,
  Lock,
  AlertTriangle,
  Settings,
  HelpCircle,
  ChevronsUpDown,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const isTasksActive = pathname === "/tasks" || pathname.startsWith("/tasks/");
  const isDashboardActive = pathname === "/dashboard" || pathname === "/";

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform duration-200 ease-in-out lg:static lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Workspace Brand / Header */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight leading-none">TaskFlow</span>
              <span className="text-xs text-muted-foreground mt-0.5">Admin Dashboard</span>
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground opacity-60 cursor-pointer" />
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* General Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              General
            </p>
            <nav className="space-y-1">
              <Link
                href="/"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isDashboardActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/tasks"
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isTasksActive
                    ? "bg-secondary text-primary font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <CheckSquare className="h-4 w-4" />
                <span>Tasks</span>
              </Link>

              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Grid className="h-4 w-4" />
                  <span>Apps</span>
                </div>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">Soon</span>
              </div>

              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4" />
                  <span>Chats</span>
                </div>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  3
                </span>
              </div>
            </nav>
          </div>

          {/* Pages Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Pages
            </p>
            <nav className="space-y-1">
              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Lock className="h-4 w-4" />
                  <span>Auth</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Errors</span>
                </div>
              </div>
            </nav>
          </div>

          {/* Other Section */}
          <div>
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Other
            </p>
            <nav className="space-y-1">
              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground/60 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help Center</span>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* User Profile Footer */}
        <div className="border-t p-3">
          <div className="flex items-center justify-between rounded-lg p-2 hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                SN
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium leading-none">Sahil</span>
                <span className="text-[11px] text-muted-foreground mt-0.5">admin@taskflow.dev</span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground opacity-60" />
          </div>
        </div>
      </aside>
    </>
  );
}
