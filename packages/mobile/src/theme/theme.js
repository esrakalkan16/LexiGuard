export const theme = {
  colors: {
    primary: '#2563EB', // Blue
    background: '#F4F6F8', // Page bg
    surface: '#FFFFFF', // Card bg
    border: '#E5E7EB', // Subtle 0.5px border
    text: {
      primary: '#111827', // Dark gray for high readability
      secondary: '#6B7280', // Lighter gray for subtitles/meta
      inverse: '#FFFFFF',
    },
    risk: {
      high: '#EF4444', // Red
      medium: '#F59E0B', // Amber
      low: '#16A34A', // Green
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16, // Generous padding inside cards
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12, // 12px for cards as requested
    lg: 16,
    xl: 24,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2, // Android shadow
    }
  }
};
