import { useEffect, useState } from "react";
import { useActionData, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { EmployeeFormFields, EmployeeSelect } from "../features/staff/components";
import { messageStyle, panelStyle } from "../features/staff/constants";
import { getEmployeePayload } from "../features/staff/staff.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const employees = await prisma.employee.findMany({
    where: { shop: session.shop },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
  });

  return { employees };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  const employeeId = Number(formData.get("employeeId"));

  try {
    if (intent === "create") {
      const payload = getEmployeePayload(formData);

      if (payload.error) {
        return { ok: false, message: payload.error };
      }

      const employee = await prisma.employee.create({
        data: {
          ...payload.data,
          shop: session.shop,
        },
      });

      return {
        ok: true,
        message: `Created employee #${employee.id}.`,
      };
    }

    if (intent === "update") {
      if (!employeeId) {
        return { ok: false, message: "Select an employee to modify." };
      }

      const payload = getEmployeePayload(formData);

      if (payload.error) {
        return { ok: false, message: payload.error };
      }

      await prisma.employee.update({
        where: {
          shop_id: {
            shop: session.shop,
            id: employeeId,
          },
        },
        data: payload.data,
      });

      return {
        ok: true,
        message: `Updated employee #${employeeId}.`,
      };
    }

    if (intent === "delete") {
      if (!employeeId) {
        return { ok: false, message: "Select an employee to delete." };
      }

      await prisma.employee.delete({
        where: {
          shop_id: {
            shop: session.shop,
            id: employeeId,
          },
        },
      });

      return {
        ok: true,
        message: `Deleted employee #${employeeId}.`,
      };
    }

    return { ok: false, message: "Unknown employee action." };
  } catch (error) {
    if (error?.code === "P2025") {
      return {
        ok: false,
        message: "That employee no longer exists in the database.",
      };
    }

    if (error?.code === "P2002") {
      return {
        ok: false,
        message: "An employee with that PIN already exists for this shop.",
      };
    }

    return {
      ok: false,
      message: error instanceof Error ? error.message : "Employee action failed.",
    };
  }
};

export default function StaffPage() {
  const { employees } = useLoaderData();
  const actionData = useActionData();

  const [mode, setMode] = useState("create");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    employees[0] ? String(employees[0].id) : "",
  );

  useEffect(() => {
    if (!employees.length) {
      setSelectedEmployeeId("");
      return;
    }

    const selectedExists = employees.some(
      (employee) => String(employee.id) === selectedEmployeeId,
    );

    if (!selectedExists) {
      setSelectedEmployeeId(String(employees[0].id));
    }
  }, [employees, selectedEmployeeId]);

  const selectedEmployee = employees.find(
    (employee) => String(employee.id) === selectedEmployeeId,
  );

  return (
    <s-page heading="Employees">
      <s-section heading="Employee Actions">
        <s-paragraph>Select an action to manage employees.</s-paragraph>

        <s-stack direction="block" gap="base">
          <s-button onClick={() => setMode("create")}>Create Employee</s-button>
          <s-button onClick={() => setMode("modify")}>Modify Employee</s-button>
          <s-button onClick={() => setMode("delete")}>Delete Employee</s-button>
          <s-button onClick={() => setMode("info")}>Employee Info</s-button>
        </s-stack>

        {actionData?.message ? (
          <div style={messageStyle(actionData.ok)}>{actionData.message}</div>
        ) : null}

        {mode === "create" ? (
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Create Employee</h3>
            <form method="post">
              <input type="hidden" name="intent" value="create" />
              <EmployeeFormFields />
              <div style={{ marginTop: "1rem" }}>
                <button type="submit">Save Employee</button>
              </div>
            </form>
          </div>
        ) : null}

        {mode === "modify" ? (
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Modify Employee</h3>
            {employees.length ? (
              <form method="post" key={selectedEmployeeId || "no-selection"}>
                <input type="hidden" name="intent" value="update" />
                <EmployeeSelect
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  setSelectedEmployeeId={setSelectedEmployeeId}
                />
                <div style={{ marginTop: "1rem" }}>
                  <EmployeeFormFields employee={selectedEmployee} />
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <button type="submit">Update Employee</button>
                </div>
              </form>
            ) : (
              <p>No employees found yet.</p>
            )}
          </div>
        ) : null}

        {mode === "delete" ? (
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Delete Employee</h3>
            {employees.length ? (
              <form method="post">
                <input type="hidden" name="intent" value="delete" />
                <EmployeeSelect
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  setSelectedEmployeeId={setSelectedEmployeeId}
                />
                {selectedEmployee ? (
                  <p style={{ marginTop: "1rem" }}>
                    This will permanently delete {selectedEmployee.firstName}{" "}
                    {selectedEmployee.lastName}.
                  </p>
                ) : null}
                <button type="submit">Permanently Delete Employee</button>
              </form>
            ) : (
              <p>No employees found yet.</p>
            )}
          </div>
        ) : null}

        {mode === "info" ? (
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>Employee Info</h3>
            {employees.length ? (
              <>
                <EmployeeSelect
                  employees={employees}
                  selectedEmployeeId={selectedEmployeeId}
                  setSelectedEmployeeId={setSelectedEmployeeId}
                />

                {selectedEmployee ? (
                  <div style={{ marginTop: "1rem", lineHeight: 1.8 }}>
                    <div>
                      <strong>ID:</strong> {selectedEmployee.id}
                    </div>
                    <div>
                      <strong>First Name:</strong> {selectedEmployee.firstName}
                    </div>
                    <div>
                      <strong>Last Name:</strong> {selectedEmployee.lastName}
                    </div>
                    <div>
                      <strong>Server Menu Access:</strong>{" "}
                      {selectedEmployee.serverMenuAccess ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Bar Menu Access:</strong>{" "}
                      {selectedEmployee.barMenuAccess ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Hourly Clock Access:</strong>{" "}
                      {selectedEmployee.hourlyClockAccess ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>Admin Access:</strong>{" "}
                      {selectedEmployee.adminAccess ? "Yes" : "No"}
                    </div>
                    <div>
                      <strong>PIN:</strong> {selectedEmployee.pin}
                    </div>
                    <div>
                      <strong>Hours Worked:</strong> {selectedEmployee.hoursWorked}
                    </div>
                    <div>
                      <strong>Hourly Rate:</strong> {selectedEmployee.hourlyRate}
                    </div>
                    <div>
                      <strong>Created At:</strong>{" "}
                      {new Date(selectedEmployee.createdAt).toLocaleString()}
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <p>No employees found yet.</p>
            )}
          </div>
        ) : null}
      </s-section>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
