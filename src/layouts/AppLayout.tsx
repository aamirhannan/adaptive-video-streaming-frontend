import { NavLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext.js";
import { useUI } from "../contexts/UIContext.js";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUI();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const drawerWidth = 260;

  const navItems = [
    { label: "Library", to: "/", allow: true },
    {
      label: "Upload",
      to: "/upload",
      allow: user?.role === "editor" || user?.role === "admin",
    },
    { label: "Users", to: "/admin/users", allow: user?.role === "admin" },
  ].filter((item) => item.allow);

  const navContent = (
    <Box className="h-full flex flex-col">
      <Box className="px-4 py-4">
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Adaptive Video
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Streaming workspace
        </Typography>
      </Box>
      <Divider />
      <List sx={{ px: 1.25, py: 1.5, gap: 0.5, display: "grid" }}>
        {navItems.map((item) => (
          <ListItemButton
            key={item.to}
            component={NavLink}
            to={item.to}
            end={item.to === "/"}
            onClick={() => setSidebarOpen(false)}
            sx={{
              borderRadius: 2,
              "&.active": {
                bgcolor: "primary.main",
                color: "primary.contrastText",
              },
            }}
          >
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box className="mt-auto p-3">
        <Typography
          variant="caption"
          color="text.secondary"
          className="block rounded-xl border border-white/10 p-3"
        >
          Role: {user?.role ?? "-"}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box className="min-h-screen bg-[#070b16] text-slate-100">
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          ml: { lg: `${drawerWidth}px` },
          width: { lg: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar className="gap-2">
          {!isDesktop && (
            <IconButton color="inherit" edge="start" onClick={toggleSidebar}>
              <span className="text-xl leading-none">=</span>
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
          <Button color="inherit" onClick={logout}>
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundImage: "none",
            bgcolor: "#090f1e",
          },
        }}
      >
        {navContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          ml: { lg: `${drawerWidth}px` },
          pt: "80px",
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
