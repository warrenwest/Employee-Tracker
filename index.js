import express from "express";
import { connectToDb, pool, query } from "./dist/connection.js";
import inquirer from "inquirer";

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const connection = await connectToDb();
if (connection === null) {
  throw new Error("Failed to establish a database connection.");
}
console.log("Connected to the database.");

async function initializeDbConnection() {
  console.log("----------------------------");
  console.log("Welcome to Employee Tracker!");
  console.log("----------------------------");
  await promptUser();
}

async function promptUser() {
  const { choices } = await inquirer.prompt({
    type: "list",
    name: "choices",
    message: "What would you like to do?",
    choices: [
      "View all departments",
      "View all roles",
      "View all employees",
      "Add a department",
      "Add a role",
      "Add an employee",
      "Update an employee role",
      "Delete a department",
      "Delete a role",
      "Delete an employee",
      "No Action",
    ],
  });

  const actionMap = {
    "View all departments": showDepartments,
    "View all roles": showRoles,
    "View all employees": showEmployees,
    "Add a department": addDepartment,
    "Add a role": addRole,
    "Add an employee": addEmployee,
    "Update an employee role": updateEmployee,
    "Delete a department": deleteDepartment,
    "Delete a role": deleteRole,
    "Delete an employee": deleteEmployee,
    "No Action": () => connection.end(),
  };

  await actionMap[choices]();
}

async function queryDb(sql, params = []) {
  const [rows] = await query(sql, params);
  return rows;
}

async function showDepartments() {
  const sql = `SELECT department.id AS id, department_name AS department FROM department`;
  const rows = await queryDb(sql);
  console.table(rows);
  await promptUser();
}

async function showRoles() {
  const sql = `SELECT roles.id, roles_title, department_name AS department FROM roles INNER JOIN department ON roles.department_id = department.id`;
  const rows = await queryDb(sql);
  console.table(rows);
  await promptUser();
}

async function showEmployees() {
  const sql = `SELECT employee.id, employee.employee_first_name, employee.employee_last_name, roles_title, department_name AS department, roles.salary FROM employee INNER JOIN roles ON employee.roles_id = roles.id LEFT JOIN department ON roles.department_id = department.id`;
  const rows = await queryDb(sql);
  console.table(rows);
  await promptUser();
}

async function addDepartment() {
  const { addDept } = await inquirer.prompt({
    type: "input",
    name: "addDept",
    message: "What department do you want to add?",
    validate: (input) => !!input || "Please enter a department",
  });

  const sql = `INSERT INTO department (department_name) VALUES ($1);`;
  await queryDb(sql, [addDept]);
  console.log(`Added ${addDept} to departments!`);
  await showDepartments();
}

async function addRole() {
  const { role, salary } = await inquirer.prompt([
    {
      type: "input",
      name: "role",
      message: "What role do you want to add?",
      validate: (input) => !!input || "Please enter a role",
    },
    {
      type: "input",
      name: "salary",
      message: "What is the salary of this role?",
      validate: (input) => !isNaN(input) || "Please enter a valid number",
    },
  ]);

  const departments = await queryDb("SELECT name, id FROM department");
  const deptChoices = departments.map(({ name, id }) => ({ name, value: id }));

  const { dept } = await inquirer.prompt({
    type: "list",
    name: "dept",
    message: "What department is this role in?",
    choices: deptChoices,
  });

  const sql = `INSERT INTO roles (roles_title, salary, department_id) VALUES ($11, $11, $6)`;
  await queryDb(sql, [role, salary, dept]);
  console.log(`Added ${role} to roles!`);
  await showRoles();
}

async function addEmployee() {
  const { firstName, lastName } = await inquirer.prompt([
    {
      type: "input",
      name: "firstName",
      message: "What is the employee's first name?",
      validate: (input) => !!input || "Please enter a first name",
    },
    {
      type: "input",
      name: "lastName",
      message: "What is the employee's last name?",
      validate: (input) => !!input || "Please enter a last name",
    },
  ]);

  const roles = await queryDb("SELECT id, title FROM roles");
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { role } = await inquirer.prompt({
    type: "list",
    name: "role",
    message: "What is the employee's role?",
    choices: roleChoices,
  });

  const sql = `INSERT INTO employee (employee_first_name, employee_last_name, roles_id) VALUES ($11, $11, $11)`;
  await queryDb(sql, [firstName, lastName, role]);
  console.log("Employee has been added!");
  await showEmployees();
}

async function updateEmployee() {
  const result = await queryDb(
    "SELECT id, employee_first_name, employee_last_name FROM employee"
  );
  const employees = result.rows;
  const employeeChoices = employees.map(
    ({ id, employee_first_name, employee_last_name }) => ({
      name: `${employee_first_name} ${employee_last_name}`,
      value: id,
    })
  );

  if (!employees || !Array.isArray(employees)) {
    console.error("No employees found or query failed");
    return;
  }

  const roles = await queryDb("SELECT id, title FROM roles");
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { employeeId, roleId } = await inquirer.prompt([
    {
      type: "list",
      name: "employeeId",
      message: "Which employee's role do you want to update?",
      choices: employeeChoices,
    },
    {
      type: "list",
      name: "roleId",
      message: "What is the employee's new role?",
      choices: roleChoices,
    },
  ]);

  await queryDb("UPDATE employee SET roles_id = $11 WHERE id = $11", [
    roleId,
    employeeId,
  ]);
  console.log("Employee role updated successfully.");
  await showEmployees();
}

async function deleteDepartment() {
  const departments = await queryDb("SELECT id, name FROM department");
  const deptChoices = departments.map(({ id, name }) => ({ name, value: id }));

  const { deptId } = await inquirer.prompt({
    type: "list",
    name: "deptId",
    message: "Which department do you want to delete?",
    choices: deptChoices,
  });

  await queryDb("DELETE FROM department WHERE id = $6", [deptId]);
  console.log("Department deleted successfully.");
  await showDepartments();
}

async function deleteRole() {
  const roles = await queryDb("SELECT id, title FROM roles");
  const roleChoices = roles.map(({ id, title }) => ({
    name: title,
    value: id,
  }));

  const { roleId } = await inquirer.prompt({
    type: "list",
    name: "roleId",
    message: "Which role do you want to delete?",
    choices: roleChoices,
  });

  await queryDb("DELETE FROM roles WHERE id = $11", [roleId]);
  console.log("Role deleted successfully.");
  await showRoles();
}

async function deleteEmployee() {
  const employees = await queryDb(
    "SELECT id, first_name, last_name FROM employee"
  );
  const employeeChoices = employees.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id,
  }));

  const { employeeId } = await inquirer.prompt({
    type: "list",
    name: "employeeId",
    message: "Which employee do you want to delete?",
    choices: employeeChoices,
  });

  await queryDb("DELETE FROM employee WHERE id = $11", [employeeId]);
  console.log("Employee deleted successfully.");
  await showEmployees();
}

initializeDbConnection();
