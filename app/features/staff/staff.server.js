const isValidPin = (pin) => /^\d{4}$/.test(pin);
const isChecked = (formData, key) => formData.get(key) === "true";

export const getEmployeePayload = (formData) => {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  const hoursWorkedValue = String(formData.get("hoursWorked") || "").trim();
  const hourlyRateValue = String(formData.get("hourlyRate") || "").trim();
  const serverMenuAccess = isChecked(formData, "serverMenuAccess");
  const barMenuAccess = isChecked(formData, "barMenuAccess");
  const hourlyClockAccess = isChecked(formData, "hourlyClockAccess");
  const adminAccess = isChecked(formData, "adminAccess");

  if (!firstName || !lastName || !pin || !hourlyRateValue) {
    return {
      error: "First name, last name, PIN, and hourly rate are required.",
    };
  }

  if (!isValidPin(pin)) {
    return { error: "PIN must be exactly 4 digits." };
  }

  if (!serverMenuAccess && !barMenuAccess && !hourlyClockAccess && !adminAccess) {
    return {
      error:
        "Select at least one access permission: server, bar, hourly clock, or admin.",
    };
  }

  const hoursWorked = hoursWorkedValue === "" ? 0 : Number(hoursWorkedValue);
  const hourlyRate = Number(hourlyRateValue);

  if (Number.isNaN(hoursWorked) || hoursWorked < 0) {
    return { error: "Hours worked must be 0 or greater." };
  }

  if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
    return { error: "Hourly rate must be 0 or greater." };
  }

  return {
    data: {
      firstName,
      lastName,
      pin: Number(pin),
      hoursWorked,
      hourlyRate,
      serverMenuAccess,
      barMenuAccess,
      hourlyClockAccess,
      adminAccess,
    },
  };
};
