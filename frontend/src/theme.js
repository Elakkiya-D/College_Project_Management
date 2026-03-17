import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#2F8C56',
            dark: '#256F45',
            light: '#4DAE75',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#E6A23A',
            dark: '#CC861E',
            light: '#F0B960',
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#F6F8F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1F2933',
            secondary: '#5F6B7A',
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 12,
                    boxShadow: '0 6px 18px rgba(31, 41, 51, 0.12)',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                },
            },
        },
    },
});

export default theme;
