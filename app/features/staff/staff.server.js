const isValidPin = (pin) => /^\d{4}$/.test(pin);

export const getEmployeePayload = (formData) => {
  const firstName = String(formData.get("firstName") || "").trim();
  const lastName = String(formData.get("lastName") || "").trim();
  const position = String(formData.get("position") || "").trim();
  const pin = String(formData.get("pin") || "").trim();
  const hoursWorkedValue = String(formData.get("hoursWorked") || "").trim();
  const hourlyRateValue = String(formData.get("hourlyRate") || "").trim();

  if (!firstName || !lastName || !position) {
    return { error: "First name, last name, and position are required." };
  }

  if (!isValidPin(pin)) {
    return { error: "PIN must be exactly 4 digits." };
  }

  const hoursWorked = hoursWorkedValue === "" ? 0 : Number(hoursWorkedValue);
  const hourlyRate = hourlyRateValue === "" ? 0 : Number(hourlyRateValue);

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
      position,
      pin: Number(pin),
      hoursWorked,
      hourlyRate,
    },
  };
};
