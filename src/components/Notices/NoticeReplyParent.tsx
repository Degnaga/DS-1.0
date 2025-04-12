import { Box, Divider, dividerClasses, Typography } from "@mui/material";

interface Parent {
  id: string;
  author: {
    name: string;
  };
  text: string;
}

interface NoticeReplyParentProps {
  parent: Parent;
}

const NoticeReplyParent = ({ parent }: NoticeReplyParentProps) => {
  const MAX_LENGTH = 30;
  const name = parent?.author.name || "";
  const text = parent?.text || "";

  let truncatedName = name;
  let truncatedText = text;

  if (name.length + text.length > MAX_LENGTH) {
    const availableForText = MAX_LENGTH - name.length - 3;
    truncatedName =
      name.slice(0, MAX_LENGTH - 3) +
      (name.length > MAX_LENGTH - 3 ? "..." : "");
    truncatedText =
      availableForText > 0
        ? text.slice(0, availableForText) +
          (text.length > availableForText ? "..." : "")
        : "";
  }
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        "& svg": {
          m: 1,
        },
        [`& .${dividerClasses.root}`]: {
          mx: 0.5,
        },
      }}
    >
      <Typography
        variant="body2"
        color="secondary.light"
        // sx={{ fontWeight: 500, mr: 0.5 }}
      >
        to {truncatedName}
      </Typography>
      <Divider orientation="vertical" flexItem />
      <Typography
        component="span"
        variant="body2"
        color="textSecondary"
        sx={{
          // display: "-webkit-box",
          // WebkitLineClamp: 1,
          // WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {truncatedText}
      </Typography>
    </Box>
  );
};
export default NoticeReplyParent;
