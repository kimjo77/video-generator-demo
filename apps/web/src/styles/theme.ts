import 'styled-components';
export const theme = {
  colors: {
    canvas: '#f7f6f2',
    onAccent: '#ffffff',
    surface: '#ffffff',
    ink: '#272b27',
    muted: '#6d716c',
    border: '#e5e5dd',
    accent: '#b94020',
    accentHover: '#9f341a',
    accentSoft: '#fbede5',
    success: '#376747',
    danger: '#a73526',
  },
  space: { panel: '22px', xs: '6px', sm: '12px', md: '20px', lg: '28px', xl: '40px', xxl: '64px' },
  radius: { sm: '8px', md: '16px', lg: '24px', pill: '999px' },
  font: {
    body: "'Inter', 'Segoe UI', Arial, sans-serif",
    display: "'Inter', 'Segoe UI', Arial, sans-serif",
    size: {
      xs: '10px',
      caption: '11px',
      small: '12px',
      label: '13px',
      body: '14px',
      input: '15px',
      subheading: '16px',
      brand: '23px',
      hero: 'clamp(40px, 4.6vw, 58px)',
    },
  },
  breakpoints: { stacked: '760px', mobile: '640px', tablet: '900px' },
};
type AppTheme = typeof theme;
declare module 'styled-components' {
  // The empty interface intentionally augments styled-components with our theme.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefaultTheme extends AppTheme {}
}
