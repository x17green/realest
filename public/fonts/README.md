# 🎨 Font Library Documentation

A comprehensive collection of fonts available in the Bounsser application. All fonts are locally hosted for optimal performance, privacy, and reliability.

## 📋 Available Font Families

### Google Fonts (Web-optimized)

#### Inter
- **Family**: `'Inter', sans-serif`
- **Weights**: 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Use Case**: Body text, UI elements
- **License**: SIL Open Font License 1.1
- **Files**: 9 TTF files (2.9MB total)

#### Space Grotesk
- **Family**: `'Space Grotesk', sans-serif`
- **Weights**: 300, 400, 500, 600, 700
- **Use Case**: Headings, modern sans-serif
- **License**: SIL Open Font License 1.1
- **Files**: 5 TTF files (348KB total)

#### JetBrains Mono
- **Family**: `'JetBrains Mono', monospace`
- **Weights**: 100, 200, 300, 400, 500, 600, 700, 800
- **Use Case**: Code blocks, monospace text
- **License**: SIL Open Font License 1.1
- **Files**: 8 TTF files (904KB total)

#### Playfair Display
- **Family**: `'Playfair Display', serif`
- **Weights**: 400, 500, 600, 700, 800, 900
- **Use Case**: Display text, elegant serif
- **License**: SIL Open Font License 1.1
- **Files**: 6 TTF files (752KB total)

### Premium Fonts (From Fonnts.com)

#### Neulis Sans
- **Family**: `'Neulis Sans', sans-serif`
- **Weights**: 100-900 (full range with italics)
- **Styles**: Normal, Italic
- **Use Case**: Modern sans-serif, branding
- **License**: Commercial use allowed
- **Files**: 20 OTF files

#### Neulis Neue
- **Family**: `'Neulis Neue', sans-serif`
- **Weights**: 200, 300, 400, 500, 600, 700, 900
- **Styles**: Normal, Italic
- **Use Case**: Contemporary sans-serif
- **License**: Commercial use allowed
- **Files**: 14 OTF files

#### Aeonik
- **Family**: `'Aeonik', sans-serif`
- **Weights**: 400, 700
- **Use Case**: Clean, minimal design
- **License**: Commercial use allowed
- **Files**: 2 TTF files (204KB total)

#### Nordique Pro
- **Family**: `'Nordique Pro', sans-serif`
- **Weights**: 700 (Bold only)
- **Use Case**: Strong headlines, impact text
- **License**: Commercial use allowed
- **Files**: 1 TTF file (36KB total)

#### Qarvic
- **Family**: `'Qarvic', sans-serif`
- **Weights**: 400, 700
- **Styles**: Normal, Italic
- **Use Case**: Unique character, branding
- **License**: Commercial use allowed
- **Files**: 3 OTF files

#### Qarvic Grunge
- **Family**: `'Qarvic Grunge', sans-serif`
- **Weights**: 400, 700
- **Styles**: Normal, Italic
- **Use Case**: Distressed/grunge effect
- **License**: Commercial use allowed
- **Files**: 3 OTF files

#### Qarvic Icon
- **Family**: `'Qarvic Icon', sans-serif`
- **Use Case**: Icon font, special characters
- **License**: Commercial use allowed
- **Files**: 1 OTF file

### Legacy Fonts (Pre-existing)

#### Open Sauce One
- **Family**: `'Open Sauce One', sans-serif`
- **Weights**: 400, 600, 700
- **License**: SIL Open Font License 1.1

#### Open Sauce Sans
- **Family**: `'Open Sauce Sans', sans-serif`
- **Weights**: 400, 500, 600
- **License**: SIL Open Font License 1.1

#### Lufga
- **Family**: `'Lufga', sans-serif`
- **Weights**: 100-900 (full range with italics)
- **Styles**: Normal, Italic

#### Righteous
- **Family**: `'Righteous', sans-serif`
- **Weights**: 400

#### Poppins
- **Family**: `'Poppins', sans-serif`
- **Weights**: 100-900 (full range with italics)
- **Styles**: Normal, Italic
- **License**: SIL Open Font License 1.1

#### Montserrat
- **Family**: `'Montserrat', sans-serif`
- **Weights**: 100-900 (full range with italics)
- **Styles**: Normal, Italic (Variable + Static)
- **License**: SIL Open Font License 1.1

## 🎯 Current Theme Mapping

The application's theme system uses these primary font assignments:

```css
--font-display: 'Playfair Display', serif     /* Hero/Display text */
--font-heading: 'Space Grotesk', sans-serif   /* Headings */
--font-body: 'Inter', sans-serif              /* Body text */
--font-mono: 'JetBrains Mono', monospace      /* Code */
```

## 🚀 Usage Examples

### CSS
```css
/* Use theme variables */
.hero-title {
  font-family: var(--font-display);
  font-weight: 700;
}

/* Direct font family */
.custom-heading {
  font-family: 'Neulis Sans', sans-serif;
  font-weight: 600;
}
```

### React/JSX with Theme Components
```jsx
import { HeroTitle, Heading, Body } from '@/lib/theme';

// Theme components (recommended)
<HeroTitle>Welcome to Bounsser</HeroTitle>
<Heading size="2xl">Section Title</Heading>
<Body>Regular paragraph text</Body>

// Custom styling
<h1 style={{ fontFamily: "'Aeonik', sans-serif" }}>
  Custom Font Usage
</h1>
```

### Tailwind CSS Classes
```html
<!-- Using theme font utilities -->
<h1 class="font-display text-4xl font-bold">Display Title</h1>
<h2 class="font-heading text-2xl font-semibold">Heading</h2>
<p class="font-body text-base">Body text</p>
<code class="font-mono text-sm">Code text</code>

<!-- Custom font families -->
<div class="font-['Neulis_Sans',sans-serif] font-medium">
  Custom Neulis Sans
</div>
```

## 📁 File Structure

```
public/fonts/
├── inter/           # Inter font family
├── space-grotesk/   # Space Grotesk font family
├── jetbrains-mono/  # JetBrains Mono font family
├── playfair-display/# Playfair Display font family
├── neulis/          # Neulis Sans & Neulis Neue families
├── aeonik/          # Aeonik font family
├── nordique/        # Nordique Pro font family
├── quarvic/         # Qarvic variants font families
├── open-sauce-one/  # Open Sauce One font family
├── open-sauce-sans/ # Open Sauce Sans font family
├── lufga/           # Lufga font family
├── Poppins/         # Poppins font family
├── Montserrat/      # Montserrat font family
└── righteous/       # Righteous font family
```

## 🔧 Technical Details

### Font Loading
- All fonts are loaded via `@font-face` declarations in `/styles/fonts.css`
- Font files are served from `/public/fonts/` directory
- `font-display: swap` is used for optimal loading performance

### Font Formats
- **TTF**: TrueType fonts (Google Fonts)
- **OTF**: OpenType fonts (Premium fonts)
- **Variable Fonts**: Montserrat includes variable font files

### Performance
- **Total Size**: ~22MB for all fonts
- **Lazy Loading**: Fonts load only when needed
- **Local Hosting**: No external requests to Google Fonts or other CDNs

### Browser Support
- All fonts support modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback fonts specified for each family
- Progressive enhancement approach

## 📜 License Information

### Open Font License (OFL)
Most fonts use SIL OFL 1.1, allowing:
- ✅ Personal and commercial use
- ✅ Modification and redistribution
- ✅ Web embedding
- ❌ Standalone font sales

### Commercial Licenses
Premium fonts from Fonnts.com allow:
- ✅ Personal and commercial projects
- ✅ Web and print usage
- ✅ Client work
- ❌ Font redistribution

## 🛠️ Adding New Fonts

To add new fonts to the system:

1. **Add font files** to `/public/fonts/[font-name]/`
2. **Create @font-face declarations** in `/styles/fonts.css`
3. **Add license file** in the font directory
4. **Update this README** with font information
5. **Test font loading** in development and production

### Example @font-face Declaration
```css
@font-face {
    font-family: "Your Font Name";
    src: url("/fonts/your-font/YourFont-Regular.woff2") format("woff2"),
         url("/fonts/your-font/YourFont-Regular.ttf") format("truetype");
    font-weight: 400;
    font-style: normal;
    font-display: swap;
}
```

## 🎨 Font Recommendations

### For Branding
- **Neulis Sans**: Modern, professional
- **Aeonik**: Minimal, clean
- **Lufga**: Unique character

### For Body Text
- **Inter**: Excellent readability
- **Open Sauce Sans**: Clean, approachable
- **Poppins**: Friendly, rounded

### For Headings
- **Space Grotesk**: Modern geometric
- **Montserrat**: Versatile, popular
- **Nordique Pro**: Bold impact

### For Display
- **Playfair Display**: Elegant serif
- **Righteous**: Playful, distinctive
- **Lufga**: Modern display

### For Code
- **JetBrains Mono**: Developer-friendly
- Fixed-width, clear distinction

---

**Last Updated**: January 2025  
**Total Fonts**: 13 font families  
**Total Files**: ~100+ font files  
**Total Size**: ~22MB