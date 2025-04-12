import { SvgIconProps, Tab, Tabs } from "@mui/material";
import Link from "next/link";

interface LinkTabProps {
  label?: string;
  href: string;
  selected?: boolean;
  icon?: React.ReactElement<SvgIconProps>;
  iconPosition?: "top" | "bottom" | "start" | "end";
}

const MobileLinkTab = ({
  label,
  href,
  selected,
  icon,
  iconPosition = "bottom",
}: LinkTabProps) => {
  return (
    <Tab
      component={Link}
      href={href}
      aria-current={selected ? "page" : undefined}
      icon={icon}
      iconPosition={iconPosition}
      label={label}
    />
  );
};

interface LinksProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  navLinks: Array<{
    label: string;
    href: string;
    icon?: React.ReactElement<SvgIconProps>;
  }>;
}

export const TabsLinksMobile = ({ value, onChange, navLinks }: LinksProps) => {
  return (
    <>
      <Tabs
        value={value}
        onChange={onChange}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        role="navigation"
        aria-label="member-profile-mobile-nav"
      >
        {navLinks.map((link, index) => (
          <MobileLinkTab
            key={link.href}
            href={link.href}
            icon={link.icon}
            label={link.label}
            selected={value === index}
          />
        ))}
      </Tabs>
    </>
  );
};

const LinkTab = ({
  label,
  href,
  selected,
  icon,
  iconPosition = "bottom",
}: LinkTabProps) => {
  return (
    <Tab
      component={Link}
      href={href}
      aria-current={selected ? "page" : undefined}
      icon={icon}
      iconPosition={iconPosition}
      label={label}
      sx={{
        display: "flex",
        gap: "8px",
      }}
    />
  );
};

export const TabsLinks = ({ value, onChange, navLinks }: LinksProps) => {
  return (
    <>
      <Tabs
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={onChange}
        aria-label="member-profile-nav-links"
        role="navigation"
        sx={{
          borderRight: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            justifyContent: "flex-start",
          },
        }}
      >
        {navLinks.map((tab, index) => (
          <LinkTab
            key={tab.href}
            label={tab.label}
            href={tab.href}
            icon={tab.icon}
            iconPosition="start"
            selected={value === index}
          />
        ))}
      </Tabs>
    </>
  );
};
