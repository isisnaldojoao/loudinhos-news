import { Calendar, Home, Inbox, Search, Settings,CirclePlus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Menu items.
const items = [
  {
    title: "Visitar site",
    url: "/",
    icon: Home,
  },
  {
    title: "Adicionar postagens",
    url: "/painel",
    icon: CirclePlus,
  },
  {
    title: "Todas as postagens",
    url: "/painelallposts",
    icon: Inbox,
  },
  {
    title: "Postagens em destaque",
    url: "/painelfav",
    icon: Calendar,
  },
];

interface AppSidebarProps {
  userEmail: string;
  handleLogout: () => void;
}

export function AppSidebar({ userEmail, handleLogout }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent className="bg-zinc-900 text-900 text-white">
        <SidebarGroup className="bg-zinc-900 text-900 " >
          <SidebarGroupLabel className="text-white">Bem-vindo!</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
            <SidebarGroupLabel className="text-white">
                <p><strong>{`Usuário: ${userEmail}`}</strong></p>
            </SidebarGroupLabel >
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
              >
                Sair
              </button>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
