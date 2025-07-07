# Custom Fonts Guide

This guide explains how to add and use custom fonts in this React project.

## Font Directory Structure

```
public/
  fonts/
    Roboto-Regular.woff2
    Roboto-Bold.woff2
    Roboto-Italic.woff2
    OpenSans-Regular.woff2
    OpenSans-Bold.woff2
    DisplayFont-Regular.woff2
    // ... other font files
```

## How to Add New Fonts

### 1. Download Font Files
- Download your font files (preferably in WOFF2 format for best performance)
- Place them in the `public/fonts/` directory
- Use descriptive names: `FontName-Weight.woff2`

### 2. Define Font Face
Add `@font-face` rules in `src/fonts.css`:

```css
@font-face {
  font-family: 'YourFontName';
  src: url('/fonts/YourFontName-Regular.woff2') format('woff2'),
       url('/fonts/YourFontName-Regular.woff') format('woff'),
       url('/fonts/YourFontName-Regular.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### 3. Add to Font Utilities
Update `src/utils/fonts.js`:

```javascript
export const FONT_FAMILIES = {
  // ... existing fonts
  YOUR_FONT: 'YourFontName',
};
```

### 4. Add to Tailwind Config
Update `tailwind.config.js`:

```javascript
fontFamily: {
  // ... existing fonts
  'your-font': ['YourFontName', 'fallback-fonts'],
},
```

## Using Fonts in Components

### Method 1: CSS Classes (Recommended)
```jsx
<h1 className="font-display text-4xl">Display Heading</h1>
<p className="font-primary">Primary font text</p>
<span className="font-secondary font-bold">Secondary bold text</span>
```

### Method 2: CSS Custom Properties
```css
.my-element {
  font-family: var(--font-primary);
  font-weight: 700;
}
```

### Method 3: JavaScript Utilities
```jsx
import { getFontStyles, FONT_FAMILIES, FONT_WEIGHTS } from '../utils/fonts';

const MyComponent = () => {
  return (
    <div style={getFontStyles(FONT_FAMILIES.DISPLAY, FONT_WEIGHTS.BOLD)}>
      Styled text
    </div>
  );
};
```

### Method 4: Inline Styles
```jsx
<div style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}>
  Inline styled text
</div>
```

## Font Formats Priority

1. **WOFF2** - Best compression, modern browsers
2. **WOFF** - Good compression, older browsers
3. **TTF** - Fallback for very old browsers

## Performance Tips

- Use `font-display: swap` for better loading performance
- Preload critical fonts in `index.html`:
  ```html
  <link rel="preload" href="/fonts/Roboto-Regular.woff2" as="font" type="font/woff2" crossorigin>
  ```
- Use WOFF2 format when possible
- Limit the number of font weights/styles loaded

## Available Fonts

- **Primary**: Roboto (Regular, Bold, Italic)
- **Secondary**: OpenSans (Regular, Bold)
- **Display**: DisplayFont (Regular)
- **System**: System fonts as fallbacks 