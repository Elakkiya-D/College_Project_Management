module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: '#2F8C56',
                brandDark: '#256F45',
                brandSoft: '#EAF4EE',
                background: '#F6F8F5',
                surface: '#FFFFFF',
                accent: '#E6A23A',
                accentDark: '#CC861E',
                accentSoft: '#FDF3E2',

                // Keeping text defaults to avoid complete illegibility
                textDark: '#1F2933',
                textMedium: '#5F6B7A',
                textLight: '#F7FAF8',
            },
            fontFamily: {
                'sans': ['Inter', 'Poppins', 'sans-serif'],
            },
            boxShadow: {
                soft: '0 10px 28px rgba(31, 41, 51, 0.10)',
            },
            animation: {
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'slide-up': 'slideUp 0.8s ease-out forwards',
                'slide-up-delayed': 'slideUp 0.8s ease-out 0.2s forwards',
                'slide-up-delayed-2': 'slideUp 0.8s ease-out 0.4s forwards',
                'float': 'float 6s ease-in-out infinite',
                'shimmer': 'shimmer 2s infinite linear',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            }
        },
    },
    plugins: [],
}
