import { useNavigate } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const navigate = useNavigate();

  return (
    <s-page heading="Admin Settings">
      <s-section heading="Manage your store">
        <s-paragraph>Select a section to configure.</s-paragraph>
        <s-stack direction="inline" gap="loose">
          <s-button size="large" onClick={() => navigate("/app/staff")}>
            Employees
          </s-button>
          <s-button size="large" onClick={() => navigate("/app/menu")}>
            Menu
          </s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
