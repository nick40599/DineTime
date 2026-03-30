/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useFetcher, useLoaderData, useRevalidator } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

const POSITION_DEFINITIONS = [
  {
    key: "server",
    accessField: "serverMenuAccess",
    label: "Server",
    destination: "server",
  },
  {
    key: "bartender",
    accessField: "barMenuAccess",
    label: "Bartender",
    destination: "bartender",
  },
  {
    key: "manager",
    accessField: "adminAccess",
    label: "Manager",
    destination: "idle",
  },
  {
    key: "hourly",
    accessField: "hourlyClockAccess",
    label: "Hourly Worker",
    destination: "idle",
  },
];

const shellStyle = {
  minHeight: "100vh",
  padding: "2rem",
  background:
    "linear-gradient(135deg, #f7f2e7 0%, #efe4d0 52%, #e1d3bc 100%)",
  color: "#231815",
  fontFamily: '"Avenir Next", "Helvetica Neue", sans-serif',
  boxSizing: "border-box",
};

const stageFrameStyle = {
  position: "relative",
  minHeight: "calc(100vh - 4rem)",
  padding: "2rem",
  border: "4px solid #c6412b",
  borderRadius: "1.5rem",
  background: "rgba(255, 250, 243, 0.78)",
  boxSizing: "border-box",
};

const clockStyle = {
  position: "absolute",
  right: "1.75rem",
  bottom: "1.75rem",
  padding: "0.75rem 1rem",
  border: "4px solid #c6412b",
  borderRadius: "0.9rem",
  background: "#fff8f0",
  fontSize: "1.25rem",
  fontWeight: 700,
  letterSpacing: "0.04em",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 800,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: "#8f2b1d",
};

const actionButtonStyle = {
  border: "4px solid #c6412b",
  borderRadius: "1rem",
  background: "#fffdf8",
  color: "#231815",
  cursor: "pointer",
  font: "inherit",
  fontWeight: 700,
};

const primaryButtonStyle = {
  ...actionButtonStyle,
  padding: "1.4rem 1.8rem",
  minWidth: "12rem",
  fontSize: "1.25rem",
};

const keypadButtonStyle = {
  ...actionButtonStyle,
  width: "100%",
  aspectRatio: "1 / 1",
  fontSize: "2rem",
};

const modalButtonStyle = {
  ...actionButtonStyle,
  flex: 1,
  padding: "1.75rem 1rem",
  fontSize: "1.45rem",
};

const serializeEmployee = (employee) => ({
  id: employee.id,
  firstName: employee.firstName,
  lastName: employee.lastName,
  pin: employee.pin,
  hourlyRate: employee.hourlyRate.toString(),
  serverMenuAccess: employee.serverMenuAccess,
  barMenuAccess: employee.barMenuAccess,
  hourlyClockAccess: employee.hourlyClockAccess,
  adminAccess: employee.adminAccess,
});

const deriveAvailablePositions = (employee) =>
  POSITION_DEFINITIONS.filter((position) => employee[position.accessField]);

const normalizeDestination = (positionLabel) => {
  const normalized = positionLabel.toLowerCase();

  if (normalized === "server") {
    return "server";
  }

  if (normalized === "bartender") {
    return "bartender";
  }

  return "idle";
};

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const employees = await prisma.employee.findMany({
    where: { shop: session.shop },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }, { id: "asc" }],
  });

  const openShifts = await prisma.shift.findMany({
    where: {
      shop: session.shop,
      clockOut: null,
    },
    include: {
      employee: true,
      position: true,
    },
    orderBy: [{ clockIn: "asc" }, { id: "asc" }],
  });

  return {
    employees: employees.map((employee) => ({
      ...serializeEmployee(employee),
      availablePositions: deriveAvailablePositions(employee),
    })),
    clockedInEmployees: openShifts.map((shift) => ({
      employee: serializeEmployee(shift.employee),
      shift: {
        id: shift.id,
        positionName: shift.position.name,
        clockIn: shift.clockIn.toISOString(),
      },
    })),
  };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");

  if (intent === "verify-pin") {
    const pin = String(formData.get("pin") || "").trim();
    const expectedEmployeeId = Number(formData.get("employeeId"));

    if (!/^\d{4}$/.test(pin)) {
      return { ok: false, message: "PIN must be exactly 4 digits." };
    }

    const employee = await prisma.employee.findUnique({
      where: {
        shop_pin: {
          shop: session.shop,
          pin: Number(pin),
        },
      },
    });

    if (!employee) {
      return { ok: false, message: "No employee matches that PIN." };
    }

    if (expectedEmployeeId && employee.id !== expectedEmployeeId) {
      return { ok: false, message: "That PIN does not match the selected employee." };
    }

    const openShift = await prisma.shift.findFirst({
      where: {
        shop: session.shop,
        employeeId: employee.id,
        clockOut: null,
      },
      include: {
        position: true,
      },
      orderBy: [{ clockIn: "desc" }, { id: "desc" }],
    });

    return {
      ok: true,
      employee: {
        ...serializeEmployee(employee),
        availablePositions: deriveAvailablePositions(employee),
      },
      openShift: openShift
        ? {
            id: openShift.id,
            positionName: openShift.position.name,
            clockIn: openShift.clockIn.toISOString(),
            destination: normalizeDestination(openShift.position.name),
          }
        : null,
    };
  }

  if (intent === "clock-in") {
    const employeeId = Number(formData.get("employeeId"));
    const positionKey = String(formData.get("positionKey") || "");

    if (!employeeId || !positionKey) {
      return { ok: false, message: "Choose an employee and position to clock in." };
    }

    const employee = await prisma.employee.findUnique({
      where: {
        shop_id: {
          shop: session.shop,
          id: employeeId,
        },
      },
    });

    if (!employee) {
      return { ok: false, message: "That employee no longer exists." };
    }

    const positionDefinition = deriveAvailablePositions(employee).find(
      (position) => position.key === positionKey,
    );

    if (!positionDefinition) {
      return { ok: false, message: "That employee is not allowed to clock in for that role." };
    }

    const existingShift = await prisma.shift.findFirst({
      where: {
        shop: session.shop,
        employeeId,
        clockOut: null,
      },
      include: {
        position: true,
      },
      orderBy: [{ clockIn: "desc" }, { id: "desc" }],
    });

    if (existingShift) {
      return {
        ok: true,
        employee: {
          ...serializeEmployee(employee),
          availablePositions: deriveAvailablePositions(employee),
        },
        shift: {
          id: existingShift.id,
          positionName: existingShift.position.name,
          clockIn: existingShift.clockIn.toISOString(),
          destination: normalizeDestination(existingShift.position.name),
        },
        alreadyClockedIn: true,
      };
    }

    const position = await prisma.position.upsert({
      where: {
        shop_name: {
          shop: session.shop,
          name: positionDefinition.label,
        },
      },
      update: {},
      create: {
        shop: session.shop,
        name: positionDefinition.label,
        hourlyRate: employee.hourlyRate,
      },
    });

    const shift = await prisma.shift.create({
      data: {
        shop: session.shop,
        employeeId: employee.id,
        positionId: position.id,
        clockIn: new Date(),
        hourlyRateAtTime: employee.hourlyRate,
      },
      include: {
        position: true,
      },
    });

    return {
      ok: true,
      employee: {
        ...serializeEmployee(employee),
        availablePositions: deriveAvailablePositions(employee),
      },
      shift: {
        id: shift.id,
        positionName: shift.position.name,
        clockIn: shift.clockIn.toISOString(),
        destination: normalizeDestination(shift.position.name),
      },
      alreadyClockedIn: false,
    };
  }

  if (intent === "logout") {
    const shiftId = Number(formData.get("shiftId"));

    if (!shiftId) {
      return { ok: false, message: "No active shift was provided for logout." };
    }

    const shift = await prisma.shift.findUnique({
      where: {
        shop_id: {
          shop: session.shop,
          id: shiftId,
        },
      },
      include: {
        employee: true,
        position: true,
        report: true,
      },
    });

    if (!shift) {
      return { ok: false, message: "That shift no longer exists." };
    }

    const clockOutTime = shift.clockOut ?? new Date();

    const updatedShift = shift.clockOut
      ? shift
      : await prisma.shift.update({
          where: {
            shop_id: {
              shop: session.shop,
              id: shiftId,
            },
          },
          data: {
            clockOut: clockOutTime,
          },
          include: {
            employee: true,
            position: true,
            report: true,
          },
        });

    const report =
      updatedShift.report ??
      (await prisma.shiftReport.create({
        data: {
          shop: session.shop,
          shiftId: updatedShift.id,
        },
      }));

    return {
      ok: true,
      logout: true,
      employee: serializeEmployee(updatedShift.employee),
      shift: {
        id: updatedShift.id,
        positionName: updatedShift.position.name,
        clockIn: updatedShift.clockIn.toISOString(),
        clockOut: clockOutTime.toISOString(),
      },
      report: {
        id: report.id,
      },
      message: `${updatedShift.employee.firstName} clocked out of ${updatedShift.position.name}.`,
    };
  }

  return { ok: false, message: "Unknown POS action." };
};

function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  return <div style={clockStyle}>{now.toLocaleTimeString()}</div>;
}

function StationStatus({ message }) {
  if (!message) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: "2rem",
        bottom: "1.75rem",
        maxWidth: "28rem",
        padding: "0.75rem 1rem",
        borderRadius: "0.9rem",
        border: "3px solid #c6412b",
        background: "rgba(255, 248, 240, 0.95)",
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

export default function PosPage() {
  const { clockedInEmployees } = useLoaderData();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const [screen, setScreen] = useState("idle");
  const [activeEmployee, setActiveEmployee] = useState(null);
  const [pin, setPin] = useState("");
  const [selectedPositionKey, setSelectedPositionKey] = useState("");
  const [stationSession, setStationSession] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  const keyedClockedInEmployees = useMemo(
    () =>
      clockedInEmployees.map((entry) => ({
        ...entry,
        destination: normalizeDestination(entry.shift.positionName),
      })),
    [clockedInEmployees],
  );

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) {
      return;
    }

    if (!fetcher.data.ok) {
      setStatusMessage(fetcher.data.message || "That action could not be completed.");
      return;
    }

    if (fetcher.data.employee && "openShift" in fetcher.data) {
      setActiveEmployee(fetcher.data.employee);
      setSelectedPositionKey("");
      setStatusMessage("");

      if (fetcher.data.openShift) {
        const nextSession = {
          employee: fetcher.data.employee,
          shift: fetcher.data.openShift,
        };

        setStationSession(nextSession);

        if (fetcher.data.openShift.destination === "server") {
          setScreen("server-main");
          return;
        }

        if (fetcher.data.openShift.destination === "bartender") {
          setScreen("bartender-main");
          return;
        }

        resetToIdle(
          `${fetcher.data.employee.firstName} is already clocked in as ${fetcher.data.openShift.positionName}.`,
        );
        return;
      }

      setScreen("confirm");
      return;
    }

    if (fetcher.data.employee && fetcher.data.shift) {
      revalidator.revalidate();

      const nextSession = {
        employee: fetcher.data.employee,
        shift: fetcher.data.shift,
      };

      setStationSession(nextSession);
      setActiveEmployee(fetcher.data.employee);
      setStatusMessage(
        fetcher.data.alreadyClockedIn
          ? `${fetcher.data.employee.firstName} is already clocked in as ${fetcher.data.shift.positionName}.`
          : `${fetcher.data.employee.firstName} clocked in as ${fetcher.data.shift.positionName}.`,
      );

      if (fetcher.data.shift.destination === "server") {
        setScreen("server-main");
        return;
      }

      if (fetcher.data.shift.destination === "bartender") {
        setScreen("bartender-main");
        return;
      }

      resetToIdle(
        `${fetcher.data.employee.firstName} clocked in as ${fetcher.data.shift.positionName}.`,
      );
      return;
    }

    if (fetcher.data.logout) {
      revalidator.revalidate();
      resetToIdle(fetcher.data.message || "Employee logged out.");
    }
  }, [fetcher.data, fetcher.state, revalidator]);

  const resetToIdle = (message = "") => {
    setScreen("idle");
    setActiveEmployee(null);
    setPin("");
    setSelectedPositionKey("");
    setStationSession(null);
    setStatusMessage(message);
  };

  const beginPinEntry = (employee = null) => {
    setActiveEmployee(employee);
    setPin("");
    setSelectedPositionKey("");
    setStatusMessage("");
    setScreen("pin");
  };

  const appendDigit = (digit) => {
    setPin((current) => (current.length >= 4 ? current : `${current}${digit}`));
  };

  const submitPin = () => {
    const formData = new FormData();
    formData.set("intent", "verify-pin");
    formData.set("pin", pin);

    if (activeEmployee?.id) {
      formData.set("employeeId", String(activeEmployee.id));
    }

    fetcher.submit(formData, { method: "post" });
  };

  const confirmEmployee = () => {
    if (!activeEmployee) {
      resetToIdle();
      return;
    }

    const matchingOpenShift = keyedClockedInEmployees.find(
      (entry) => entry.employee.id === activeEmployee.id,
    );

    if (matchingOpenShift) {
      const session = {
        employee: activeEmployee,
        shift: {
          ...matchingOpenShift.shift,
          destination: matchingOpenShift.destination,
        },
      };

      setStationSession(session);

      if (matchingOpenShift.destination === "server") {
        setScreen("server-main");
        return;
      }

      if (matchingOpenShift.destination === "bartender") {
        setScreen("bartender-main");
        return;
      }

      resetToIdle(
        `${activeEmployee.firstName} is already clocked in as ${matchingOpenShift.shift.positionName}.`,
      );
      return;
    }

    if (!activeEmployee.availablePositions?.length) {
      resetToIdle(
        `${activeEmployee.firstName} does not have any available clock-in roles yet.`,
      );
      return;
    }

    setScreen("clock-in");
  };

  const submitClockIn = () => {
    const formData = new FormData();
    formData.set("intent", "clock-in");
    formData.set("employeeId", String(activeEmployee?.id || ""));
    formData.set("positionKey", selectedPositionKey);
    fetcher.submit(formData, { method: "post" });
  };

  const submitLogout = () => {
    if (!stationSession?.shift?.id) {
      resetToIdle("Station logged out.");
      return;
    }

    const formData = new FormData();
    formData.set("intent", "logout");
    formData.set("shiftId", String(stationSession.shift.id));
    fetcher.submit(formData, { method: "post" });
  };

  const renderIdleScreen = () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1.45fr 1fr",
        gap: "0",
        minHeight: "calc(100vh - 8rem)",
      }}
    >
      <section
        style={{
          borderRight: "4px solid #c6412b",
          padding: "1rem 2rem 1rem 0",
        }}
      >
        <div style={{ display: "grid", gap: "1rem" }}>
          <p style={sectionTitleStyle}>Clocked In Employees</p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignContent: "flex-start",
            }}
          >
            {keyedClockedInEmployees.length ? (
              keyedClockedInEmployees.map((entry) => (
                <button
                  key={entry.employee.id}
                  onClick={() => beginPinEntry(entry.employee)}
                  style={{
                    ...primaryButtonStyle,
                    minWidth: "10rem",
                    textAlign: "center",
                  }}
                >
                  {entry.employee.firstName}
                </button>
              ))
            ) : (
              <div style={{ fontSize: "1.1rem", color: "#6f5249" }}>
                Nobody is clocked in yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          placeItems: "start center",
          padding: "1rem 0 1rem 2rem",
        }}
      >
        <div style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
          <p style={sectionTitleStyle}>Station Access</p>
          <button onClick={() => beginPinEntry()} style={primaryButtonStyle}>
            Log In
          </button>
        </div>
      </section>
    </div>
  );

  const renderPinScreen = () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "calc(100vh - 8rem)",
      }}
    >
      <div
        style={{
          width: "min(22rem, 90vw)",
          border: "4px solid #c6412b",
          borderRadius: "1rem",
          overflow: "hidden",
          background: "#fffdf8",
        }}
      >
        <div
          style={{
            minHeight: "5.5rem",
            display: "grid",
            placeItems: "center",
            borderBottom: "4px solid #c6412b",
            fontSize: "2.1rem",
            fontWeight: 700,
            letterSpacing: "0.28em",
          }}
        >
          {pin || "----"}
        </div>
        <div style={{ padding: "1rem", display: "grid", gap: "0.85rem" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.85rem",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button
                key={digit}
                onClick={() => appendDigit(String(digit))}
                style={keypadButtonStyle}
              >
                {digit}
              </button>
            ))}
            <button
              onClick={() => setPin((current) => current.slice(0, -1))}
              style={keypadButtonStyle}
            >
              ←
            </button>
            <button onClick={() => appendDigit("0")} style={keypadButtonStyle}>
              0
            </button>
            <button
              onClick={submitPin}
              disabled={pin.length !== 4 || fetcher.state !== "idle"}
              style={{
                ...keypadButtonStyle,
                opacity: pin.length === 4 && fetcher.state === "idle" ? 1 : 0.55,
              }}
            >
              OK
            </button>
          </div>
          <button
            onClick={() => resetToIdle()}
            style={{ ...actionButtonStyle, padding: "0.95rem 1rem", fontSize: "1rem" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderConfirmationScreen = () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "calc(100vh - 8rem)",
      }}
    >
      <div
        style={{
          width: "min(44rem, 88vw)",
          border: "4px solid #c6412b",
          borderRadius: "1rem",
          overflow: "hidden",
          background: "#fffdf8",
        }}
      >
        <div
          style={{
            minHeight: "16rem",
            display: "grid",
            placeItems: "center",
            padding: "2rem",
            fontSize: "3rem",
            fontWeight: 800,
            textAlign: "center",
          }}
        >
          {`Is this ${activeEmployee?.firstName?.toUpperCase() || "EMPLOYEE"}?`}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            borderTop: "4px solid #c6412b",
          }}
        >
          <button onClick={confirmEmployee} style={modalButtonStyle}>
            Yes
          </button>
          <button
            onClick={() => resetToIdle()}
            style={{ ...modalButtonStyle, borderLeft: "4px solid #c6412b" }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );

  const renderClockInScreen = () => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "calc(100vh - 8rem)",
      }}
    >
      <div
        style={{
          width: "min(54rem, 92vw)",
          minHeight: "28rem",
          padding: "2rem",
          border: "4px solid #c6412b",
          borderRadius: "1rem",
          background: "#fffdf8",
          display: "grid",
          gridTemplateColumns: "14rem 1fr 12rem",
          gap: "2rem",
          alignItems: "start",
        }}
      >
        <button
          onClick={submitClockIn}
          disabled={!selectedPositionKey || fetcher.state !== "idle"}
          style={{
            ...primaryButtonStyle,
            width: "100%",
            opacity: selectedPositionKey && fetcher.state === "idle" ? 1 : 0.55,
          }}
        >
          Clock In
        </button>

        <div style={{ display: "grid", gap: "1rem", justifyItems: "center" }}>
          {(activeEmployee?.availablePositions || []).map((position) => (
            <button
              key={position.key}
              onClick={() => setSelectedPositionKey(position.key)}
              style={{
                ...primaryButtonStyle,
                minWidth: "13rem",
                background:
                  selectedPositionKey === position.key ? "#f9d9cd" : "#fffdf8",
              }}
            >
              {position.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", alignItems: "end", height: "100%" }}>
          <button
            onClick={() => resetToIdle()}
            style={{ ...primaryButtonStyle, width: "100%" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const renderMainScreen = (title, accent) => (
    <div
      style={{
        display: "grid",
        placeItems: "center",
        minHeight: "calc(100vh - 8rem)",
      }}
    >
      <div
        style={{
          width: "min(48rem, 90vw)",
          padding: "2.5rem",
          border: "4px solid #c6412b",
          borderRadius: "1.25rem",
          background: "#fffdf8",
          display: "grid",
          gap: "1rem",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "#8f2b1d",
          }}
        >
          POS Main Page
        </div>
        <h1 style={{ margin: 0, fontSize: "3rem" }}>{title}</h1>
        <p style={{ margin: 0, fontSize: "1.25rem" }}>
          {stationSession?.employee?.firstName} is clocked in as{" "}
          {stationSession?.shift?.positionName}.
        </p>
        <div
          style={{
            justifySelf: "center",
            marginTop: "0.5rem",
            padding: "0.75rem 1rem",
            borderRadius: "999px",
            background: accent,
            fontWeight: 700,
          }}
        >
          Station ready
        </div>
        <button
          onClick={submitLogout}
          disabled={fetcher.state !== "idle"}
          style={{ ...primaryButtonStyle, justifySelf: "center", marginTop: "1rem" }}
        >
          {fetcher.state === "idle" ? "Log Out Of Station" : "Logging Out..."}
        </button>
      </div>
    </div>
  );

  return (
    <div style={shellStyle}>
      <div style={stageFrameStyle}>
        {screen === "idle" ? renderIdleScreen() : null}
        {screen === "pin" ? renderPinScreen() : null}
        {screen === "confirm" ? renderConfirmationScreen() : null}
        {screen === "clock-in" ? renderClockInScreen() : null}
        {screen === "server-main"
          ? renderMainScreen("Server POS", "#f6d5cc")
          : null}
        {screen === "bartender-main"
          ? renderMainScreen("Bartender POS", "#d7ecf7")
          : null}

        <StationStatus message={statusMessage} />
        <LiveClock />
      </div>
    </div>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
