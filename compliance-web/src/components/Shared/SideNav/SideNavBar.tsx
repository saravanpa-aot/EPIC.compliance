import { Box, Typography } from "@mui/material";
import { theme } from "@/styles/theme";
import { useMenuStore } from "@/store/menuStore";
import ExpandMenuButton from "./ExpandMenuButton";
import MenuItemsList from "./MenuItemsList";
import { AppConfig } from "@/utils/config";
import MenuItemIconsList from "./MenuItemIconsList";

export default function SideNavBar() {
  const { expandMenu } = useMenuStore();

  const version = AppConfig.version;

  return (
    <Box display={"flex"} alignItems={"flex-start"}>
      <Box
        sx={{
          bgcolor: theme.palette.primary.main,
          width: expandMenu ? 260 : 68,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "width 0.1s ease",
        }}
      >
        {expandMenu ? <MenuItemsList /> : <MenuItemIconsList />}
        <Typography
          variant="body1"
          color={theme.palette.common.white}
          textAlign={"center"}
          paddingBottom={"3rem"}
        >
          {expandMenu ? "Version: " : ""} {version}
        </Typography>
      </Box>
      <ExpandMenuButton />
    </Box>
  );
}
