/* eslint-disable react/prop-types */
import {
  ACCESS_FIELDS,
  EMPTY_FORM,
  checkboxGroupStyle,
  checkboxLabelStyle,
  fieldGridStyle,
  inputStyle,
} from "./constants";

export function EmployeeSelect({
  employees,
  selectedEmployeeId,
  setSelectedEmployeeId,
}) {
  return (
    <label style={{ display: "block" }}>
      Employee
      <select
        name="employeeId"
        value={selectedEmployeeId}
        onChange={(event) => setSelectedEmployeeId(event.target.value)}
        style={inputStyle}
      >
        {employees.map((employee) => (
          <option key={employee.id} value={employee.id}>
            #{employee.id} - {employee.firstName} {employee.lastName}
          </option>
        ))}
      </select>
    </label>
  );
}

export function EmployeeFormFields({ employee }) {
  const defaults = employee
    ? {
        firstName: employee.firstName,
        lastName: employee.lastName,
        pin: String(employee.pin),
        hoursWorked: String(employee.hoursWorked ?? 0),
        hourlyRate: String(employee.hourlyRate),
        serverMenuAccess: Boolean(employee.serverMenuAccess),
        barMenuAccess: Boolean(employee.barMenuAccess),
        hourlyClockAccess: Boolean(employee.hourlyClockAccess),
        adminAccess: Boolean(employee.adminAccess),
      }
    : EMPTY_FORM;

  return (
    <div style={fieldGridStyle}>
      <label>
        First Name
        <input
          name="firstName"
          type="text"
          defaultValue={defaults.firstName}
          required
          style={inputStyle}
        />
      </label>

      <label>
        Last Name
        <input
          name="lastName"
          type="text"
          defaultValue={defaults.lastName}
          required
          style={inputStyle}
        />
      </label>

      <label>
        PIN
        <input
          name="pin"
          type="text"
          inputMode="numeric"
          pattern="\d{4}"
          maxLength={4}
          minLength={4}
          defaultValue={defaults.pin}
          required
          style={inputStyle}
        />
      </label>

      <label>
        Hours Worked
        <input
          name="hoursWorked"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaults.hoursWorked}
          style={inputStyle}
        />
      </label>

      <label>
        Hourly Rate
        <input
          name="hourlyRate"
          type="number"
          min="0"
          step="0.01"
          defaultValue={defaults.hourlyRate}
          required
          style={inputStyle}
        />
      </label>

      <fieldset style={checkboxGroupStyle}>
        <legend>Menu and Access Permissions</legend>
        {ACCESS_FIELDS.map((field) => (
          <label key={field.name} style={checkboxLabelStyle}>
            <input
              name={field.name}
              type="checkbox"
              value="true"
              defaultChecked={defaults[field.name]}
            />
            <span>{field.label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
