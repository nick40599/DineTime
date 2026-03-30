import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import { requireAdminPosAccess } from "../admin-pos-access.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  await requireAdminPosAccess(session.shop);

  return null;
};

export default function MenuPage() {
  return (
    <s-page heading="Menu">
      <s-section heading="Menu Actions">
        <s-paragraph>Select an action to manage your menus and items.</s-paragraph>
        <s-stack direction="block" gap="base">
          <s-button>Create Menu</s-button>
          <s-button>Create Menu Item</s-button>
          <s-button>Modify Menu Item</s-button>
          <s-button>Delete Menu Item</s-button>
          <s-button>Delete Menu</s-button>
          <s-button>Set Max Amount of Ticket Items</s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
