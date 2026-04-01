# Devex CRM - Production Ready

A full-featured CRM platform built on Next.js 16, Prisma ORM, and PostgreSQL. Inspired by Zoho CRM with multi-tenant support, RBAC, and internationalization.

## Features

### Core CRM
- **Leads** - Lead capture, scoring, and conversion
- **Contacts** - Contact management with relationships
- **Accounts** - Company/organization tracking
- **Deals** - Pipeline management with forecasting
- **Activities** - Tasks, calls, meetings, and logging

### Sales Operations
- **Inventory** - Products, quotes, sales orders, invoices, vendors, purchase orders
- **Forecasts** - Revenue forecasting with target tracking
- **Campaigns** - Email campaign management with analytics

### Support
- **Cases** - Support ticket management
- **Solutions** - Knowledge base articles
- **Voice of Customer** - Feedback collection and analysis

### Business Tools
- **Projects** - Client project tracking
- **Services** - Service offerings management
- **Documents** - File management with folders
- **Workflows** - Automation builder with execution logs
- **Analytics** - Dashboard with KPIs and charts
- **Reports** - Custom report builder

### Administration
- **Multi-tenant** - Organization-scoped data
- **RBAC** - 6 roles with 150+ granular permissions
- **i18n** - English, French, Arabic with RTL support
- **Audit trail** - Soft deletes on all records

## Tech Stack

- **Framework**: Next.js 16.1 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: JWT with bcrypt password hashing
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Email**: Resend
- **Testing**: Jest + React Testing Library

## Quick Start

### Prerequisites
- Node.js 20+ (LTS recommended)
- pnpm: `npm install -g pnpm`
- PostgreSQL 14+ (local or cloud)

### Installation

1. **Clone and install**
   ```bash
   pnpm install
   ```

2. **Environment setup**
   ```bash
   # Copy template
   cp .env.example .env.local

   # Edit .env.local with your settings
   ```

3. **Database setup**
   ```bash
   # Create database in PostgreSQL
   createdb crm_db

   # Push schema (development)
   pnpm db:push

   # Or run migrations (production)
   pnpm db:migrate
   ```

4. **Seed demo data**
   ```bash
   pnpm db:seed
   ```

5. **Start development**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000`

## Demo Accounts

After running `pnpm db:seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@dx.local | admin123 |
| Sales Manager | sales@dx.local | sales123 |
| Sales Rep | rep@dx.local | rep123 |
| Marketing | marketing@dx.local | marketing123 |
| Support | support@dx.local | support123 |
| Executive | executive@dx.local | executive123 |

## Production Deployment

### Environment Variables Required

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
JWT_SECRET="minimum-32-character-random-string"
NODE_ENV="production"
```

### Optional Features

```env
# Email campaigns
RESEND_API_KEY="re_xxx"
RESEND_FROM_EMAIL="noreply@company.com"

# Feature toggles
NEXT_PUBLIC_INTEGRATIONS_ENABLED=false
NEXT_PUBLIC_PROJECTS_ENABLED=true
NEXT_PUBLIC_VOC_ENABLED=true
NEXT_PUBLIC_SERVICES_ENABLED=true
```

### Build and Deploy

```bash
# Production build
pnpm build

# Run production server
pnpm start
```

### Database Migration (Production)

```bash
# Apply migrations
pnpm db:migrate

# Seed initial data (first-time setup only)
pnpm db:seed
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | ESLint check |
| `pnpm test` | Run Jest test suite |
| `pnpm test:watch` | Jest watch mode |
| `pnpm db:push` | Push schema without migrations |
| `pnpm db:migrate` | Run Prisma migrations |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm check:i18n` | Validate translation keys |

## Role Permissions

### Administrator
Full access to all modules and settings.

### Sales Manager
- Full CRM access (leads, contacts, accounts, deals)
- Campaign management
- Inventory operations
- Team analytics and forecasts
- Cannot manage users or system settings

### Sales Representative
- Create/edit/view own leads, contacts, accounts, deals
- Product catalog read-only
- Activity logging
- Basic analytics

### Marketing User
- Lead management
- Full campaign suite
- Email templates and segments
- Analytics and reporting

### Support Agent
- Cases and solutions management
- Contact/account view
- Activity logging
- Customer feedback

### Executive
- Read-only dashboard access
- Forecasts and analytics
- Reports and insights

## Module Architecture

```
app/
├── (dashboard)/          # Authenticated routes
│   ├── leads/           # Lead management
│   ├── contacts/        # Contact management
│   ├── accounts/        # Account management
│   ├── deals/           # Deal pipeline
│   ├── activities/      # Tasks, calls, meetings
│   ├── inventory/       # Products, quotes, orders, invoices
│   ├── campaigns/       # Marketing campaigns
│   ├── forecasts/       # Revenue forecasting
│   ├── support/         # Cases, solutions
│   ├── projects/        # Project tracking
│   ├── services/        # Service management
│   ├── voice-of-the-customer/ # Feedback
│   ├── documents/       # File management
│   ├── workflows/       # Automation builder
│   ├── analytics/       # KPI dashboards
│   ├── reports/         # Report builder
│   └── settings/        # Configuration
├── api/                 # REST API routes
└── page.tsx             # Landing/login

prisma/
├── schema.prisma        # Database schema
└── seed.ts             # Demo data seeder

lib/
├── prisma.ts           # Prisma client singleton
├── permissions.ts      # RBAC utilities
├── roles.ts            # Role configuration
└── auth.ts             # JWT utilities
```

## Database Models

1. **Organization** - Multi-tenant root
2. **User** - Employee accounts
3. **Role** - Named permission groups
4. **Permission** - Resource+action pairs
5. **RolePermission** - Junction table
6. **Lead** - Sales prospects
7. **Contact** - Individual people
8. **Account** - Companies
9. **Deal** - Opportunities
10. **Activity** - Tasks, calls, meetings

## Security Features

- Bcrypt password hashing (10 rounds)
- HttpOnly JWT cookies
- Server-side permission enforcement
- Organization-scoped queries
- Soft deletes for audit trail
- SQL injection prevention (Prisma)
- CSRF protection via cookies

## Internationalization

Supported locales:
- `en` - English (default)
- `fr` - French
- `ar` - Arabic with RTL layout

Language preference stored in `NEXT_LOCALE` cookie.

## Testing

```bash
# Run full test suite
pnpm test

# Watch mode during development
pnpm test:watch
```

Test coverage includes:
- Unit tests for utilities
- Component tests with RTL
- Integration tests for API routes

## Contributing

See `CONTRIBUTING.md` for development guidelines.

## License

Private - All rights reserved.

## Support

For production issues or feature requests, contact the development team.
