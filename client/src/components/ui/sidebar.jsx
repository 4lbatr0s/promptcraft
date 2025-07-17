import * as React from "react"
import { cn } from "@/lib/utils"

const Sidebar = React.forwardRef(({ className, children, ...props }, ref) => (
  <aside
    ref={ref}
    className={cn(
      "w-64 min-h-screen flex flex-col",
      className
    )}
    {...props}
  >
    {children}
  </aside>
))
Sidebar.displayName = "Sidebar"

const SidebarProvider = ({ children }) => {
  return <div className="flex min-h-screen">{children}</div>
}

const SidebarContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarContent.displayName = "SidebarContent"

const SidebarHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarFooter.displayName = "SidebarFooter"

const SidebarGroup = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs font-medium text-blue-200 uppercase tracking-wider px-3 py-2", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarGroupLabel.displayName = "SidebarGroupLabel"

const SidebarGroupContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarGroupContent.displayName = "SidebarGroupContent"

const SidebarMenu = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col", className)}
    {...props}
  >
    {children}
  </div>
))
SidebarMenuItem.displayName = "SidebarMenuItem"

const SidebarMenuButton = React.forwardRef(({ className, children, asChild = false, ...props }, ref) => {
  const Comp = asChild ? React.Fragment : "button"
  return (
    <Comp
      ref={ref}
      className={cn(
        "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

const SidebarTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  >
    {children}
  </button>
))
SidebarTrigger.displayName = "SidebarTrigger"

export {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} 