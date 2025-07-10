import {
  IconDashboard,
  IconUsers,
  IconSettings,
} from "@tabler/icons-react";
import { DashboardView } from "../views/dashboard/DashboardView";
import { UsersView } from "../views/users/UsersView";
import { UserDetailsView } from "../views/users/UserDetailsView";
import { SettingsView } from "../views/settings/SettingsView";
import { ArchbaseNavigationItem } from "@archbase/admin";

const dashboardView: ArchbaseNavigationItem = {
  label: "Admin Dashboard:Dashboard",
  icon: <IconDashboard strokeWidth={1.25} size={28} />,
  link: "/dashboard",
  category: "Dashboard",
  disabled: false,
  color: "#2196F3",
  component: <DashboardView />,
  showInSidebar: true,
};

const usersView: ArchbaseNavigationItem = {
  label: "Admin Dashboard:Usuários",
  icon: <IconUsers strokeWidth={1.25} size={28} />,
  link: "/users",
  category: "Usuários",
  disabled: false,
  color: "#4CAF50",
  component: <UsersView />,
  showInSidebar: true,
};

const userDetailsView: ArchbaseNavigationItem = {
  label: "Admin Dashboard:Detalhes do Usuário",
  icon: <IconUsers strokeWidth={1.25} size={28} />,
  link: "/users/:id",
  category: "Usuários",
  color: "#4CAF50",
  component: <UserDetailsView />,
  showInSidebar: false,
  redirect: "/users",
  customTitle: "Usuário: $title"
};


const settingsView: ArchbaseNavigationItem = {
  label: "Admin Dashboard:Configurações",
  icon: <IconSettings strokeWidth={1.25} size={28} />,
  link: "/settings",
  category: "Configurações",
  disabled: false,
  color: "#9E9E9E",
  component: <SettingsView />,
  showInSidebar: true,
};

export const navigationData: ArchbaseNavigationItem[] = [
  dashboardView,
  usersView,
  userDetailsView,
  settingsView,
];