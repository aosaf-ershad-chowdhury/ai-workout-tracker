import Box from "@mui/material/Box";

export default function SitemarkIcon() {
  return (
    <Box
      component="img"
      src="/public/images/logo.png" // <-- CHANGE this to your image path
      alt="Sitemark Logo"
      sx={{
        height: 50,
        width: 180,
        mr: 2,
        display: "inline-block",
        verticalAlign: "middle",
        // Add any other styles as needed
      }}
    />
  );
}
