import Stack from "@mui/material/Stack";
import LinearProgress from "@mui/material/LinearProgress";
import { Box } from "@mui/material";

const Loading = () => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <Stack sx={{ width: "100%" }} spacing={2}>
        <LinearProgress color="info" />
      </Stack>
    </Box>
  );
};
export default Loading;
