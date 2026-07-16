"use client"

import {
  Home,
  Bot,
  MessageSquare,
  Store,
  Wrench,
  Zap,
  Folder,
  Activity,
  Server,
  Network,
  Link2,
  Settings,
  Database,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"

interface AppSidebarProps {
  activeSection: string
  onNavigate: (section: string) => void
}

const aiWorkforceItems = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "chat-agents", label: "Chat Agents", icon: MessageSquare, badge: "Beta" },
  { id: "marketplace", label: "Marketplace", icon: Store },
  { id: "tools", label: "Tools", icon: Wrench },
]

const workflowItems = [
  { id: "konnectors", label: "Konnectors", icon: Zap },
  { id: "folders", label: "Folders", icon: Folder },
  { id: "event-logs", label: "Event logs", icon: Activity },
]

const mcpItems = [
  { id: "mcp-servers", label: "MCP Servers", icon: Server },
  { id: "mcp-konnect-hub", label: "MCP Konnect Hub", icon: Network },
]

export function AppSidebar({ activeSection, onNavigate }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-full bg-sidebar-primary">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="white" strokeWidth="1.5">
              <path
                d="M14.2 14.2H17V6.9375C17 4.76288 15.2371 3 13.0625 3H5.8V5.8M14.2 14.2V7.79063L7.79062 14.2H14.2ZM14.2 14.2V17H6.9375C4.76288 17 3 15.2371 3 13.0625V5.8H5.8M5.8 5.8V12.2313L12.2313 5.8H5.8Z"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="font-semibold text-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            Konnectify
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Home */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("home")}
                  isActive={activeSection === "home"}
                  tooltip="Home"
                >
                  <Home />
                  <span>Home</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI Workforce */}
        <SidebarGroup>
          <SidebarGroupLabel>AI Workforce</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiWorkforceItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    isActive={activeSection === item.id}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 font-medium group-data-[collapsible=icon]:hidden"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Knowledge Base */}
        <SidebarGroup>
          <SidebarGroupLabel>Knowledge Base</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onNavigate("knowledge-base")}
                  isActive={activeSection === "knowledge-base" || activeSection.startsWith("kb-")}
                  tooltip="Knowledge Base"
                  className="data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                >
                  <Database />
                  <span>Knowledge Base</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workflows */}
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    isActive={activeSection === item.id}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* MCP */}
        <SidebarGroup>
          <SidebarGroupLabel>MCP</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mcpItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onNavigate(item.id)}
                    isActive={activeSection === item.id}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onNavigate("connections")}
              isActive={activeSection === "connections"}
              tooltip="Connections"
            >
              <Link2 />
              <span>Connections</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => onNavigate("settings")}
              isActive={activeSection === "settings"}
              tooltip="Settings"
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
