import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2Icon from "@mui/icons-material/Inventory2Outlined";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCartOutlined";

const DRAWER_WIDTH = 240;

const NAV = [
  { label: "Dashboard", to: "/dashboard", icon: <DashboardIcon /> },
  { label: "Item Master", to: "/masters/items", icon: <Inventory2Icon /> },
  { label: "Purchase Orders", to: "/purchase/orders-domestic", icon: <ShoppingCartIcon /> },
];

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const active = NAV.find((n) => location.pathname.startsWith(n.to));

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "primary.main", color: "#fff" },
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.2 }}>
            Cure ERP
          </Typography>
        </Toolbar>
        <List sx={{ px: 1 }}>
          {NAV.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                borderRadius: 1.5,
                mb: 0.5,
                color: "rgba(255,255,255,0.85)",
                "&.active": { bgcolor: "rgba(255,255,255,0.14)", color: "#fff" },
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14 }} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box sx={{ flexGrow: 1, minHeight: "100vh", bgcolor: "background.default" }}>
        <AppBar position="static" color="inherit" elevation={0} sx={{ borderBottom: "1px solid #e0e0e0" }}>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Breadcrumbs>
              <MuiLink underline="hover" color="inherit" href="/dashboard">
                Cure ERP
              </MuiLink>
              <Typography color="text.primary">{active?.label ?? ""}</Typography>
            </Breadcrumbs>
            <Typography variant="body2" color="text.secondary">
              current.user · Operator
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 3 }}>{children}</Box>
      </Box>
    </Box>
  );
}
