export default function StaffPage() {
  return (
    <s-page heading="Employees">
      <s-section heading="Employee Actions">
        <s-paragraph>Select an action to manage employees.</s-paragraph>
        <s-stack direction="block" gap="base">
          <s-button>Create Employee</s-button>
          <s-button>Modify Employee</s-button>
          <s-button>Delete Employee</s-button>
          <s-button>Employee Info</s-button>
        </s-stack>
      </s-section>
    </s-page>
  );
}
