/* eslint-disable react/prop-types */
import {
  EMPTY_FORM,
  POSITION_OPTIONS,
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
        position: employee.position,
        pin: String(employee.pin),
        hoursWorked: String(employee.hoursWorked),
        hourlyRate: String(employee.hourlyRate),
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
        Position
        <select
          name="position"
          defaultValue={defaults.position}
          required
          style={inputStyle}
        >
          {POSITION_OPTIONS.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
          {!POSITION_OPTIONS.includes(defaults.position) ? (
            <option value={defaults.position}>{defaults.position}</option>
          ) : null}
        </select>
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
          style={inputStyle}
        />
      </label>
    </div>
  );
}
