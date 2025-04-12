"use client";

import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Link from "next/link";
import { SvgIconProps } from "@mui/material";

interface LinkTabProps {
  label?: string;
  href: string;
  selected?: boolean;
  icon?: React.ReactElement<SvgIconProps>;
  iconPosition?: "top" | "bottom" | "start" | "end";
}

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
    />
  );
};

interface NavLinksProps {
  value: number;
  onChange: (event: React.SyntheticEvent, newValue: number) => void;
  navLinks: Array<{
    label: string;
    href: string;
    icon?: React.ReactElement<SvgIconProps>;
  }>;
}

export const NavLinks = ({ value, onChange, navLinks }: NavLinksProps) => {
  return (
    <>
      <Tabs
        value={value}
        onChange={onChange}
        aria-label="nav-links"
        role="navigation"
      >
        {navLinks.map((link, index) => (
          <LinkTab
            key={link.href}
            label={link.label}
            href={link.href}
            icon={link.icon}
            selected={value === index}
          />
        ))}
      </Tabs>
    </>
  );
};

const MobLinkTab = ({
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

export const MobileNavLinks = ({
  value,
  onChange,
  navLinks,
}: NavLinksProps) => {
  return (
    <>
      <Tabs
        orientation="vertical"
        value={value}
        onChange={onChange}
        aria-label="mobile-nav-links"
        role="navigation"
        sx={{
          borderRight: 1,
          borderColor: "divider",
          "& .MuiTab-root": {
            justifyContent: "flex-start",
          },
        }}
      >
        {navLinks.map((link, index) => (
          <MobLinkTab
            key={link.href}
            label={link.label}
            href={link.href}
            icon={link.icon}
            iconPosition="start"
            selected={value === index}
          />
        ))}
      </Tabs>
    </>
  );
};
