import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DeleteIcon from "@mui/icons-material/Delete";
import CircularProgress from "@mui/material/CircularProgress";
import { Box } from "@mui/material";

type Props = {
  loading: boolean;
};

export default function DeleteButton({ loading }: Props) {
  return (
    <Box
      sx={{
        position: "relative",
        transition: "opacity 0.3s",
        cursor: "pointer",
        display: "inline-flex",
      }}
    >
      {!loading ? (
        <>
          <DeleteOutlineIcon
            sx={{
              position: "absolute",
              top: -2,
              right: -2,
              fontSize: "32px",
              color: "#fff",
            }}
          />
          <DeleteIcon
            sx={{
              fontSize: "28px",
              color: "rgba(238, 36, 9, 0.7)",
            }}
          />
        </>
      ) : (
        <CircularProgress size={32} sx={{ color: "#fff" }} />
      )}
    </Box>
  );
}
