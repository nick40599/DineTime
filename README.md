# DineTime

DineTime is an embedded Shopify app built to help restaurants manage basic staff and menu settings from inside the Shopify admin. The app provides admin-facing sections for employee management and menu management, using Shopify authentication, React Router, Prisma, and SQLite.

## Overview

DineTime is designed for restaurant-based Shopify stores that need a simple internal management tool. The app currently includes navigation for:

- Admin settings
- Employee management
- Menu management

The employee section is intended to support actions such as creating, modifying, deleting, and viewing employees. The menu section is intended to support actions such as creating menus, creating menu items, modifying menu items, deleting menu items, deleting menus, and setting a maximum number of ticket items.

## Tech Stack

- Shopify App Framework
- React
- React Router
- Shopify App Bridge
- Prisma ORM
- SQLite
- Node.js
- Docker

## Project Structure

```text
DineTime/
├── app/
│   ├── routes/
│   │   ├── app.jsx
│   │   ├── app._index.jsx
│   │   ├── app.staff.jsx
│   │   ├── app.menu.jsx
│   │   ├── auth.login/
│   │   ├── auth.$.jsx
│   │   ├── webhooks.app.scopes_update.jsx
│   │   └── webhooks.app.uninstalled.jsx
│   ├── db.server.js
│   ├── shopify.server.js
│   └── root.jsx
├── prisma/
│   └── schema.prisma
├── public/
├── extensions/
├── Dockerfile
├── package.json
├── shopify.app.toml
├── shopify.web.toml
└── README.md

## How to Use

### 1. Open the DineTime App

From the Shopify admin, open the DineTime app. You should see the main app dashboard with navigation options for the app sections.

### 2. Use the Employee Page

Go to the **Employees** section to manage restaurant staff.

The employee page is set up for actions such as:

- Creating a new employee
- Viewing employee information
- Modifying employee details
- Deleting an employee

Employees are stored using the Prisma `Employee` model, which includes the employee position, shop, PIN, and creation date.

### 3. Use the Menu Page

Go to the **Menu** section to manage restaurant menu settings.

The menu page is set up for actions such as:

- Creating a menu
- Creating menu items
- Editing menu items
- Deleting menu items
- Deleting menus
- Setting a maximum number of ticket items

This section is intended to help restaurants organize menu-related data directly from the Shopify admin.

### 4. Manage Data Through the Database

DineTime uses Prisma and SQLite for local development. To view or manage the database during development, you can use Prisma Studio:

```bash
npx prisma studio

### 5. Test Changes Locally

As you update the app, the local development server will reload changes. Use your Shopify development store to test how the app looks and behaves inside the Shopify admin.

### 6. Prepare for Deployment

Before deploying, make sure the app builds correctly:
```bash
npm run build

Then confirm that all required production environment variables are set, including the Shopify API keys, app URL, scopes, and database connection.
