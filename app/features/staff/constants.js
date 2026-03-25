export const POSITION_OPTIONS = [
  "Server",
  "Bartender",
  "Manager",
  "Hourly Worker",
  "Host",
  "Cook",
  "Cashier",
];

export const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  position: POSITION_OPTIONS[0],
  pin: "",
  hoursWorked: "0",
  hourlyRate: "0",
};

export const panelStyle = {
  marginTop: "1.5rem",
  padding: "1rem",
  border: "1px solid #d0d0d0",
  borderRadius: "0.75rem",
  background: "#fff",
  maxWidth: "36rem",
};

export const fieldGridStyle = {
  display: "grid",
  gap: "0.875rem",
};

export const inputStyle = {
  display: "block",
  width: "100%",
  marginTop: "0.35rem",
  padding: "0.55rem 0.7rem",
  border: "1px solid #c9cccf",
  borderRadius: "0.5rem",
  boxSizing: "border-box",
};

export const messageStyle = (ok) => ({
  marginTop: "1rem",
  padding: "0.75rem 1rem",
  borderRadius: "0.75rem",
  background: ok ? "#e7f8ee" : "#fdecec",
  color: ok ? "#17613a" : "#9f1c1c",
  border: `1px solid ${ok ? "#b9e3c8" : "#f3b7b7"}`,
});
