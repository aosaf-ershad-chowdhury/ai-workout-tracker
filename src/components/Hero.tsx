import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface HeroProps {
  start: () => void;
}

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "70%",
  height: 800,
  marginTop: theme.spacing(8),
  backgroundImage: `url(${import.meta.env.BASE_URL || "/"}images/man.png)`,
  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
    height: 500,
  },
  ...theme.applyStyles("dark", {
    backgroundImage: `url(${
      import.meta.env.VITE_TEMPLATE_IMAGE_URL || "https://mui.com"
    }/static/screenshots/material-ui/getting-started/templates/dashboard-dark.jpg)`,
  }),
}));

export const Hero: React.FC<HeroProps> = ({ start }) => {
  return (
    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        minHeight: "100vh",
        background: `
          radial-gradient(circle at 0% 100%, rgba(255, 38, 0, 0.52) 0%, transparent 30%),
          radial-gradient(circle at 100% 100%, rgba(255, 38, 0, 0.52) 0%, transparent 30%),
          #101014
        `,
        backgroundRepeat: "no-repeat",
        ...theme.applyStyles("dark", {
          background: `
            radial-gradient(circle at 0% 100%, rgba(255, 38, 0, 0.52) 0%, transparent 60%),
            radial-gradient(circle at 100% 100%, rgba(255, 38, 0, 0.52) 0%, transparent 60%),
            #101014
          `,
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
          gap: { xs: 2, sm: 4 },
        }}
      >
        <Box sx={{ flex: 1, minWidth: "600px" }}>
          <Stack
            spacing={1}
            useFlexGap
            sx={{
              alignItems: { xs: "center", sm: "flex-start" },
              width: "100%",
            }}
          >
            <Typography
              variant="h1"
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                fontSize: "clamp(5rem, 20vw, 5.5rem)",
                textAlign: { xs: "center", sm: "left" },
                color: "common.white",
                fontWeight: 1000,
              }}
            >
              AI Gym Form Coach
            </Typography>
            <Typography
              sx={{
                textAlign: { xs: "center", sm: "left" },
                color: "common.white",
                width: { sm: "100%", md: "80%" },
              }}
            >
              Real-time form analysis powered by computer vision
            </Typography>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              useFlexGap
              sx={{ pt: 2, width: { xs: "100%", sm: "350px" } }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#c96010", // orange
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#fb8c00", // darker orange on hover
                  },
                }}
                fullWidth
                onClick={start}
              >
                Start now
              </Button>
            </Stack>
          </Stack>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <StyledBox id="image" />
        </Box>
      </Container>
    </Box>
  );
};
