import { Link as RouterLink, Outlet } from "react-router-dom";
import {
  AppBar,
  Box,
  Button,
  Container,
  Toolbar,
  Typography,
  Link,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext.js";

export const AppLayout = () => {
  const { user, logout } = useAuth();

  return (
    <Box className="min-h-screen bg-slate-50">
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar className="gap-4 flex-wrap">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Adaptive Video
          </Typography>
          {user && (
            <>
              <Link component={RouterLink} to="/" color="inherit" underline="hover">
                Library
              </Link>
              {(user.role === "editor" || user.role === "admin") && (
                <Link
                  component={RouterLink}
                  to="/upload"
                  color="inherit"
                  underline="hover"
                >
                  Upload
                </Link>
              )}
              {user.role === "admin" && (
                <Link
                  component={RouterLink}
                  to="/admin/users"
                  color="inherit"
                  underline="hover"
                >
                  Users
                </Link>
              )}
              <Typography variant="body2" className="opacity-90">
                {user.email} ({user.role})
              </Typography>
              <Button color="inherit" onClick={logout}>
                Log out
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className="py-8">
        <Outlet />
      </Container>
    </Box>
  );
};
