import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Drawer from "@mui/material/Drawer";
import MenuIcon from "@mui/icons-material/Menu";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ColorModeIconDropdown from "./ColorModelIconDropdown";
import Sitemark from "./SitemarkIcon";

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  // borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  // border: '1px solid',
  // borderColor: (theme.vars || theme).palette.divider,
  backgroundColor: theme.vars
    ? `rgba(${theme.vars.palette.background.defaultChannel} / 0.4)`
    : alpha(theme.palette.background.default, 0),
  // boxShadow: (theme.vars || theme).shadows[1],
  padding: "8px 12px",
}));

export default function AppAppBar() {
  const [open, setOpen] = React.useState(false);

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              alignItems: "center",
              px: 0,
              gap: 4,
            }}
          >
            <Sitemark />
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
              <Button
                variant="text"
                sx={{ color: "#c96010", fontSize: "1.1rem" }}
                size="small"
              >
                Features
              </Button>
              <Button
                variant="text"
                sx={{ color: "#c96010", fontSize: "1.1rem" }}
                size="small"
              >
                Testimonials
              </Button>
              <Button
                variant="text"
                sx={{ color: "#c96010", fontSize: "1.1rem" }}
                size="small"
              >
                Pricing
              </Button>
              <Button
                variant="text"
                size="small"
                sx={{ minWidth: 0, color: "#c96010", fontSize: "1.1rem" }}
              >
                FAQ
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            <ColorModeIconDropdown />
          </Box>
          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown size="medium" />
            <IconButton aria-label="Menu button" onClick={toggleDrawer(true)}>
              <MenuIcon sx={{ color: "#c96010" }} />
            </IconButton>
            <Drawer
              anchor="top"
              open={open}
              onClose={toggleDrawer(false)}
              PaperProps={{
                sx: {
                  top: "var(--template-frame-height, 0px)",
                },
              }}
            >
              <Box sx={{ p: 2, backgroundColor: "#c96010" }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton onClick={toggleDrawer(false)}>
                    <CloseRoundedIcon sx={{ color: "#ffffff" }} />
                  </IconButton>
                </Box>

                <MenuItem sx={{ color: "#ffffff" }}>Features</MenuItem>
                <MenuItem sx={{ color: "#ffffff" }}>Testimonials</MenuItem>
                <MenuItem sx={{ color: "#ffffff" }}>Pricing</MenuItem>
                <MenuItem sx={{ color: "#ffffff" }}>FAQ</MenuItem>
              </Box>
            </Drawer>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}
