import { useLoaderData, useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { getAdminPosAccess } from "../admin-pos-access.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const adminPosAccess = await getAdminPosAccess(session.shop);

  return { adminPosAccess };
};

export default function Index() {
  const { adminPosAccess } = useLoaderData();
  const navigate = useNavigate();

  return (
    <s-page heading="Admin Settings">
      <s-section heading="Manage your store">
        {adminPosAccess ? (
          <>
            <s-paragraph>Select a section to configure.</s-paragraph>
            <s-stack direction="inline" gap="loose">
              <s-button size="large" onClick={() => navigate("/app/staff")}>
                Employees
              </s-button>
              <s-button size="large" onClick={() => navigate("/app/menu")}>
                Menu
              </s-button>
              <s-button size="large" onClick={() => navigate("/app/pos")}>
                POS
              </s-button>
            </s-stack>
          </>
        ) : (
          <>
            <s-paragraph>
              Admin pages are only visible while an employee with admin access is
              logged in on the POS.
            </s-paragraph>
            <s-button size="large" onClick={() => navigate("/app/pos")}>
              Go To POS
            </s-button>
          </>
        )}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
