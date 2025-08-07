# Netlify Deployment Instructions

## Environment Variables Required

Set these environment variables in your Netlify dashboard:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Build Settings

- **Build command**: `npm run build`
- **Publish directory**: `frontend/dist`
- **Base directory**: `frontend`

## Troubleshooting

### "Cannot access uninitialized variable" Error

This error typically occurs when:
1. Environment variables are not set properly
2. Supabase configuration is missing
3. Router is used incorrectly in stores

### Solutions Applied

1. **Fixed auth store**: Removed `useRouter` from Pinia store
2. **Improved supabase.js**: Added proper error handling for missing env vars
3. **Updated netlify.toml**: Corrected build paths and settings

### Demo Animation Page

In development mode, you can access the animation showcase at:
`/demo/animations`

This page demonstrates all the new dark theme animations and glass effects.
