SELECT department.department_name, roles.roles_title, employee.employee_first_name, employee.employee_last_name
FROM department
LEFT JOIN roles
ON department.id = roles.department_id
LEFT JOIN employee
ON roles.id = employee.roles_id
ORDER BY department.department_name;

