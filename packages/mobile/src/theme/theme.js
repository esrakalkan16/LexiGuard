export const theme = {
  colors: {
    primary: '#0f172a', // Slate-900 (Login ile aynı)
    background: '#ffffff', // Bembeyaz (Login ile aynı)
    surface: '#ffffff',
    border: '#e2e8f0', // Slate-200
    text: {
      primary: '#0f172a',
      secondary: '#64748b', // Slate-500
      inverse: '#ffffff',
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
