# Assets Directory

This directory contains static assets used by the Angular application.

## Directory Structure

- **images/** - Image files (PNG, JPG, SVG, etc.)
- **icons/** - Icon files and icon fonts
- **data/** - Static JSON data files, configuration files
- **fonts/** - Custom font files

## Usage

Assets in this directory can be referenced in your application using the `/assets/` path:

```typescript
// In component
imageUrl = "/assets/images/logo.png";
```

```html
<!-- In template -->
<img src="/assets/images/logo.png" alt="Logo" />
```

```scss
// In styles
background-image: url("/assets/images/background.jpg");
```

## Build Configuration

Assets are automatically copied to the build output directory as configured in `angular.json`.
