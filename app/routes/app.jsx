import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";
import { getAdminPosAccess } from "../admin-pos-access.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const adminPosAccess = await getAdminPosAccess(session.shop);

  return {
    // eslint-disable-next-line no-undef
    apiKey: process.env.SHOPIFY_API_KEY || "",
    hasAdminPosAccess: Boolean(adminPosAccess),
    adminEmployeeName: adminPosAccess?.employeeName || "",
  };
};

export default function App() {
  const { apiKey, hasAdminPosAccess, adminEmployeeName } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <s-app-nav>
        {hasAdminPosAccess ? <s-link href="/app">Admin Settings</s-link> : null}
        {hasAdminPosAccess ? <s-link href="/app/staff">Employees</s-link> : null}
        {hasAdminPosAccess ? <s-link href="/app/menu">Menu</s-link> : null}
        <s-link href="/app/pos">POS</s-link>
      </s-app-nav>
      {hasAdminPosAccess ? (
        <div style={{ padding: "0.75rem 1rem 0", fontWeight: 600 }}>
          Admin access is available while {adminEmployeeName} is logged in on POS.
        </div>
      ) : null}
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
