import { SvgIconProps, Tab, Tabs } from "@mui/material";
import Link from "next/link";

interface AppNavTabsProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  appNavLinks: Array<{
    label: string;
    href: string;
    icon?: React.ReactElement<SvgIconProps>;
  }>;
}

function AppNavTabs({ value, onChange, appNavLinks }: AppNavTabsProps) {
  return (
    <Tabs
      orientation="vertical"
      value={value}
      onChange={onChange}
      textColor="primary"
      aria-label="app-nav-tabs"
      role="navigation"
      sx={{
        borderRight: 1,
        borderColor: "divider",
        "& .MuiTab-root": {
          justifyContent: "flex-start",
        },
        // ".MuiTabs-indicator": {
        //   left: 0,
        // },
      }}
    >
      {appNavLinks.map((link, index) => (
        <Tab
          key={link.href}
          component={Link}
          href={link.href}
          icon={link.icon}
          iconPosition="start"
          label={link.label}
          value={index}
          sx={{
            display: "flex",
            gap: "8px",
            fontFamily: "inherit",
          }}
        />
      ))}
    </Tabs>
  );
}
export default AppNavTabs;
