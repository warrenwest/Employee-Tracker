INSERT INTO department (id, department_name)
VALUES (1, 'HR'),
       (2, 'Finance'),
       (3, 'IT'),
       (4, 'Marketing'),
       (5, 'Sales');

INSERT INTO roles (department_id, id, roles_title, salary)
VALUES (1, 1, 'HR Manager', 60000),
       (1, 2, 'Recruiter', 50000),
       (2, 3, 'Accountant', 55000),
       (2, 4, 'Financial Analyst', 65000),
       (3, 5, 'Software Engineer', 70000),
       (3, 6, 'System Administrator', 60000),
       (4, 7, 'Marketing Manager', 70000),
       (4, 8, 'Content Writer', 50000),
       (5, 9, 'Sales Manager', 80000),
       (5, 10, 'Sales Associate', 40000);
       
INSERT INTO employee (roles_id, id, employee_first_name, employee_last_name)
VALUES (1, 1, 'Alice', 'Brooks'),
       (2, 2, 'Bob', 'Smith'),
       (3, 3, 'Charlie', 'Johnson'),
       (4, 4, 'David', 'Williams'),
       (5, 5, 'Eve', 'Brown'),
       (6, 6, 'Frank', 'Jones'),
       (7, 7, 'Grace', 'Garcia'),
       (8, 8, 'Hannah', 'Martinez'),
       (9, 9, 'Ian', 'Davis'),
       (10, 10, 'Jack', 'Rodriguez');