import {
  IconDashboard,
  IconUsers,
  IconSettings,
  IconShield,
  IconKey,
} from "@tabler/icons-react";
import { DashboardView } from "../views/dashboard/DashboardView";
import { SecurityView } from "../views/security/SecurityView";
import { ApiTokenView } from "../views/security/ApiTokenView";
import { ArchbaseNavigationItem } from "@archbase/admin";

const dashboardView: ArchbaseNavigationItem = {
  label: "test-postcss-fix:Dashboard",
  icon: <IconDashboard strokeWidth={1.25} size={28} />,
  link: "/dashboard",
  category: "Dashboard",
  disabled: false,
  color: "#2196F3",
  component: <DashboardView />,
  showInSidebar: true,
};



const securityView: ArchbaseNavigationItem = {
  label: "test-postcss-fix:Gerenciar Usuários",
  icon: <IconShield strokeWidth={1.25} size={28} />,
  link: "/security/users",
  category: "Segurança",
  disabled: false,
  color: "#4CAF50",
  component: <SecurityView />,
  showInSidebar: true,
};

const apiTokenView: ArchbaseNavigationItem = {
  label: "test-postcss-fix:Tokens de API",
  icon: <IconKey strokeWidth={1.25} size={28} />,
  link: "/security/api-tokens",
  category: "Segurança",
  disabled: false,
  color: "#4CAF50",
  component: <ApiTokenView />,
  showInSidebar: true,
};


export const navigationData: ArchbaseNavigationItem[] = [
  dashboardView,
  securityView,
  apiTokenView,
];