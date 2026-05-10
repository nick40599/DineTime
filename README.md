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
