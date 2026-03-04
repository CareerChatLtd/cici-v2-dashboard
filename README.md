# CiCi Dashboard

The dashboard provides statistical information to clients of CiCi - typically information
relating to the demographics of users and what topics they are engaging with.

## Tech Stack

- [Next.js](https://nextjs.org) - Application framework for code organisation and useful components
- [React](https://reactjs.org) - Component framework for building reusable HTML components in Javascript
- [Auth0](https://auth0.com) - Platform for storing dashboard user credentials. Handles password resets, etc
- [PostgreSQL](https://www.postgresql.org) - database used by the CiCi bot that we retrieve data from
- [Blueprint](https://blueprintjs.com) - UI component library used for buttons, menus, alerts, etc
- [Recharts](https://recharts.org) - Charting library used for the graphs and charts on the dashboard
- [Tailwind](https://tailwindcss.com) - CSS framework providing a vast range of helpful utility classes

## Setup

1. Clone this repository
2. `npm install`
3. Duplicate `.env.example` as `.env.local` and fill in any missing values
4. `npm run dev`

## Troubleshooting

If you get an error `Cannot GET /api/auth/callback` when trying to login,
make sure your .env file's port number in `AUTH0_BASE_URL` matches your
actual port number.

### Database Connection

This dashboard requires access to a PostgreSQL database.
As this app only reads data, you may want to connect to the production CiCi bot database.
1. Copy the PostgreSQL connection string from the [DigitalOcean Database Dashboard](https://cloud.digitalocean.com/databases/cici-bot/pools), and paste as the `DB_CONNECTION_STRING` value in your `.env.local` file

## Deployment

This app is automatically deployed to the DigitalOcean App Platform every time you push to the master branch.
You can change settings and view logs in the [Apps Dashboard](https://cloud.digitalocean.com/apps).

## Creating new dashboard users (clients)

1. Login to https://manage.auth0.com/
2. Under User Management > Users, create a new user
3. When editing that user, under app_metadata add the **slug** of the tenant that this user should have access to, eg:
   ```json
   {
     "tenantId": "derby"
   }
   ```

For CareerChat staff the tenantId is "cici". 
Yes, the field in Auth0 really should be called "slug", but this is a legacy issue.


## Code Style

### Function expressions over function declarations

Prefer **function expressions** (const arrow functions) over **function declarations** (named functions):

```typescript
// Preferred
const getUser = (id: string): User => {
  return db.findUser(id);
};

// Avoid
function getUser(id: string): User {
  return db.findUser(id);
}
```

This applies to all functions including React components, utility functions, and handlers.

### Named exports over default exports

Use **named exports** instead of **default exports**:

```typescript
// Preferred
export const MyComponent = () => {
  ...
};

// Avoid
export default MyComponent;
```

Named exports enforce consistent import names across the codebase, improve refactoring support, and make tree-shaking more predictable.

### Destructuring over dot access

Prefer **destructuring** when extracting properties from objects:

```typescript
// Preferred
const {userId, userText} = currentMessage;

// Avoid
const userId = currentMessage.userId;
const userText = currentMessage.userText;
```
