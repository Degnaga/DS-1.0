import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Fab, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const phoneNumber = "79779776566";
  const message = "Hi! I’m interested in your services.";
  const [, setIsMobile] = useState(false);

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsMobile(/mobile|android|iphone|ipad|tablet/i.test(userAgent));
  }, []);

  const handleClick = () => {
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <Tooltip
      title="Contact via WhatsApp"
      slotProps={{
        tooltip: {
          sx: {
            color: (theme) => theme.palette.primary.main,
            bgcolor: "transparent",
          },
        },
      }}
    >
      <Fab
        size="small"
        aria-label="whatsapp"
        onClick={handleClick}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        <WhatsAppIcon color="primary" />
      </Fab>
    </Tooltip>
  );
}
