import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    appbarBackground: {
      primary: string;
    };
  }
  interface PaletteOptions {
    appbarBackground?: {
      primary: string;
    };
  }
}

export const lightTheme = createTheme({
  typography: {
    fontFamily: "Hind",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "rgba(255, 254, 253, 0.9)",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: () => null,
      },
    },
    // MuiMenu: {
    //   styleOverrides: {
    //     paper: ({ theme }) => ({
    // backgroundColor: theme.palette.secondary.dark,
    // "& .MuiMenuItem-root": {
    //   color: theme.palette.secondary.main,
    //   "&:hover": {
    //     backgroundColor: theme.palette.primary.dark,
    //   },
    //   "&.Mui-selected": {
    //     backgroundColor: theme.palette.secondary.main,
    //     color: theme.palette.secondary.main,
    //     "&:hover": {
    //       backgroundColor: theme.palette.primary.dark,
    //     },
    //   },
    // },
    //     }),
    //   },
    // },
  },
  palette: {
    mode: "light",
    primary: {
      light: "#151007",
      main: "#DEA820",
      dark: "#FBF5EA",
      contrastText: "#7C5569",
    },
    secondary: {
      light: "#110D0D",
      main: "#664F52",
      dark: "#F3EDEE",
      contrastText: "#7C5569",
    },
    warning: {
      light: "#FCF4DA",
      main: "#F0CA4C",
      dark: "#30280F",
    },
    error: {
      light: "#9E9E9E",
      main: "#D0766C",
      dark: "#F85644",
    },
    success: {
      light: "#F9F3E4",
      main: "#CCA135",
      dark: "#161105",
    },
    info: {
      light: "#CDDFDD",
      main: "#839A97",
      dark: "#121615",
    },
    background: {
      default: "#FFFEFD",
      paper: "#FFFDFB",
    },
    text: {
      primary: "#161105",
      secondary: "#B59649",
    },
    action: {
      disabled: "#A4998D",
    },
    appbarBackground: {
      primary: "rgba(255, 254, 253, 0.9)",
    },
  },
});

export const darkTheme = createTheme({
  typography: {
    fontFamily: "Hind",
  },
  components: {
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "rgba(3, 1, 9, 0.9)",
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        IconComponent: () => null,
      },
    },
    // MuiMenu: {
    //   styleOverrides: {
    //     paper: ({ theme }) => ({
    //       backgroundColor: theme.palette.secondary.dark,
    // "& .MuiMenuItem-root": {
    //   color: theme.palette.secondary.main,
    //   "&:hover": {
    //     backgroundColor: theme.palette.primary.dark,
    //   },
    //   "&.Mui-selected": {
    //     backgroundColor: theme.palette.secondary.main,
    //     color: theme.palette.secondary.main,
    //     "&:hover": {
    //       backgroundColor: theme.palette.primary.dark,
    //     },
    //   },
    // },
    //     }),
    //   },
    // },
    // MuiInputBase: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       "& input": {
    //         padding: theme.spacing(0.75, 1.5),
    //         backgroundColor: theme.palette.secondary.dark,
    //         color: theme.palette.primary.light,
    //         "&.MuiInputBase-inputSizeSmall": {
    //           padding: theme.spacing(1, 0.5),
    //         },
    //         fontSize: "0.8125rem",
    //       },
    //     }),
    //   },
    // },
    // MuiInputBase: {
    //   styleOverrides: {
    //     root: {
    //       "& input": {
    //         padding: "12px 14px",

    //       },
    //       "&.MuiInputBase-sizeSmall input": {
    //         padding: "8px 12px",
    //       },
    //     },
    //   },
    // },
    // MuiOutlinedInput: {
    //   styleOverrides: {
    //     input: {
    //       padding: "12px 14px",
    //       "&.MuiInputBase-inputSizeSmall": {
    //         padding: "8px 12px",
    //       },
    //     },
    //   },
    // },
  },
  palette: {
    mode: "dark",
    primary: {
      light: "#FBF5EA",
      main: "#DEB564",
      dark: "#151007",
      contrastText: "#7C5569",
    },
    secondary: {
      light: "#AB626B",
      main: "#F3EDEE",
      dark: "#110D0D",
      contrastText: "#DEB564",
    },
    background: {
      default: "#030109",
      paper: "#070212",
    },
    warning: {
      light: "#FCF4DA",
      main: "#F0CA4C",
      dark: "#30280F",
    },
    error: {
      light: "#9E9E9E",
      main: "#D0766C",
      dark: "#F85644",
    },
    // success: {
    //   light: "#F2F7F0",
    //   main: "#8BB381",
    //   dark: "#0E120D",
    // },
    success: {
      light: "#F9F3E4",
      main: "#CCA135",
      dark: "#161105",
    },
    info: {
      light: "#F4F8F8",
      main: "#A9C6C2",
      dark: "#121615",
    },
    text: {
      primary: "#F7EBD5",
      secondary: "#816328",
    },
    action: { disabled: "#AF9982" },
    appbarBackground: {
      primary: "rgba(3, 1, 9, 0.9)",
    },
  },
});
