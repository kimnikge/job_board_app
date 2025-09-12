# AI Coding Agent Instructions for Shiftwork Job Board

## Architecture Overview
This is a Vue.js 3 + Supabase job board platform for Kazakhstan's HoReCa industry with **Telegram-only authentication**. 

**Key Architecture Patterns:**
- **Frontend**: Vue 3 + Composition API, Pinia stores, Vue Router with auth guards
- **Backend**: Supabase PostgreSQL + Edge Functions (Deno/TypeScript)
- **Auth Flow**: Telegram Login Widget → Edge Function validation → Supabase user creation
- **Deployment**: Netlify (frontend) + Supabase (backend)

## Critical Project Conventions

### 1. Authentication is Telegram-Only
```javascript
// ❌ Never implement email/password auth
// ✅ All auth flows through Telegram Login Widget
await authService.loginWithTelegram(telegramData)
```

The system has **dual modes**:
- `isDemoMode=true`: Uses localStorage for development
- `isDemoMode=false`: Real Telegram validation via `telegram-login` Edge Function

### 2. Edge Functions Pattern
All Edge Functions follow this structure:
```typescript
// Required imports and CORS handling
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  // Function logic here
})
```

### 3. Service Layer Architecture
Services are in `frontend/src/services/` and follow this pattern:
- `supabase.js`: Creates client with demo/production modes
- `auth.service.js`: Telegram auth only, no other methods
- Each service returns `{ data, error }` objects

### 4. Store Management (Pinia)
```javascript
// Stores use Composition API pattern
export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)
  // Actions return { success: boolean, error?: string }
})
```

### 5. Database Conventions
- All tables use `created_at`/`updated_at` timestamps
- User roles: `candidate` (default), `employer`, `admin`
- Main tables: `profiles`, `job_postings`, `urgent_jobs`, `user_badges`
- RLS policies protect all data access

## Development Workflows

### Local Development
```bash
# Frontend (http://localhost:3000)
cd frontend && npm run dev

# Backend (Supabase local)
cd backend/supabase && supabase start

# Tests (backend only)
cd backend/tests && npm test
```

### Key Testing Commands
```bash
# Full test suite (backend/tests/)
npm test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage
```

### Environment Setup
- Frontend: `.env` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Demo mode: Set `VITE_DEMO_MODE=true` to bypass Telegram validation
- Backend: Supabase dashboard for Edge Function env vars

## Integration Points

### Telegram Bot Integration
- Bot commands: `/start`, `/urgent`, `/jobs`, `/ready`, `/profile`, `/help`
- Webhook at `telegram-webhook` Edge Function
- Bot logic in `telegram-bot` Edge Function using Grammy framework

### Push Notifications
- Web Push API via `send-push-notification` Edge Function  
- Requires VAPID keys configuration
- Subscription data stored in `push_subscriptions` table

### File Upload Pattern
```javascript
// Always use Supabase Storage with RLS policies
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/avatar.jpg`, file)
```

## Project-Specific Patterns

### Error Handling
```javascript
// Services always return { data, error } format
const { data, error } = await someService.method()
if (error) {
  console.error('Operation failed:', error)
  return { success: false, error: error.message }
}
```

### Vue Component Structure
- Use `<script setup>` Composition API
- Import order: Vue imports, then services, then components
- Props with TypeScript-style definitions when possible

### CSS Architecture
- Utility-first approach with custom CSS classes
- Dark theme with glass-effect UI components  
- Mobile-first responsive design
- Component-scoped styles preferred

## Badge & Skills System
The platform has a sophisticated gamification system:

### Badge Categories & Types
```sql
-- Badge categories: 'Hard Skills', 'Soft Skills', 'Experience', 'Recommendations'
-- Levels: 'Bronze', 'Silver', 'Gold', 'Platinum'
-- Sources: 'manual' (employer-awarded) vs 'auto' (system-generated)
```

### Automatic Badge Awarding
- Badges auto-awarded via database triggers on `work_logs` table changes
- Skills are recalculated when badges are awarded (`badge_skill_links` table)
- Functions: `assign_shift_badges()`, `recalc_user_skills_on_badge()`

### Badge-Skills Integration
```sql
-- Skills have base_level + calculated_level (base + badge bonuses)
-- badge_skill_links table maps badges to skill improvements
INSERT INTO badge_skill_links VALUES (badge_id, 'Кофе', +20) -- +20 to coffee skill
```

## Urgent Jobs System
Core differentiator from regular job postings:

### Instant Notification Flow
1. **Ready Flag**: Users set `ready_for_urgent=true` via `/ready` Telegram command
2. **Auto-Targeting**: System finds users by specialization + location + ready_for_urgent
3. **Instant Push**: Telegram Bot + Web Push notifications sent immediately
4. **Time Limits**: Jobs auto-close after deadline or when positions filled

### Database Structure
```sql
-- urgent_jobs table has different fields than job_postings:
needed_date, needed_time_start, needed_time_end, payment_per_shift, instant_payment
-- vs regular jobs: salary_min/max, employment_type, schedule_type
```

### Ready Status Management
```javascript
// Users can toggle availability for urgent jobs
/ready command → updates ready_for_urgent + urgent_available_until (24h expiry)
```

## Critical Files to Understand
- `frontend/src/services/supabase.js`: Demo/production mode switching
- `backend/supabase/functions/telegram-login/index.ts`: Core auth logic
- `backend/supabase/migrations/20250811121000_create_gamification_triggers.sql`: Badge automation
- `docs/план/общая-структура.md`: Complete feature specifications (1766 lines)
- `frontend/src/router/index.js`: Auth guards and route protection
- `backend/tests/`: Comprehensive test suite showing expected behaviors

## Known Issues & Constraints
- Some tests fail due to missing Supabase connection in CI
- Edge Functions require proper CORS headers for all responses
- Telegram auth validation requires bot token in production
- File uploads need proper RLS policies for security
- Badge system requires work_logs data to function properly
