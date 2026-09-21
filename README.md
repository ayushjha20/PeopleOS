# PeopleOS – Employee Management System

A full-stack Employee Management System built using **Java and Spring Boot**, with a clean web-based dashboard for managing employee records through CRUD operations.

PeopleOS allows users to create, view, update, search, and delete employee information through a simple and intuitive interface.

## 🚀 Features

* **Create Employees:** Add employee details, including name, domain, salary, email, and password.
* **View Employees:** Retrieve and display employee records.
* **Update Employees:** Modify existing employee information using an employee ID.
* **Delete Employees:** Remove employee records.
* **Search Employees:** Find employee records through the frontend.
* **REST API Integration:** Connect the frontend with the Spring Boot backend.

## 🛠️ Tech Stack

### Backend

* Java
* Spring Boot
* Spring Data JPA
* Hibernate
* MySQL
* RESTful APIs
* DTOs
* Bean Validation
* Global Exception Handling

### Frontend

* HTML
* CSS
* JavaScript
* Fetch API

## 🏗️ Project Overview

The application follows a layered architecture to separate responsibilities and make the code easier to maintain.

```text
PeopleOS/
├── src/
│   └── main/
│       ├── java/
│       │   └── com/example/demo/
│       │       ├── Entity/
│       │       ├── RequestDTO/
│       │       ├── ResponseDTO/
│       │       ├── Repository/
│       │       ├── Service/
│       │       ├── Controller/
│       │       └── Exception/
│       └── resources/
│           ├── static/
│           │   ├── index.html
│           │   ├── style.css
│           │   └── script.js
│           └── application.properties
└── pom.xml
```

*Note: Adjust the folder structure above to match your actual project.*

## ⚙️ Getting Started

### Prerequisites

* Java 17 or compatible version
* Maven
* MySQL
* IDE such as VS Code or IntelliJ IDEA

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/peopleos-employee-management.git
cd peopleos-employee-management
```

### 2. Configure the Database

Create a MySQL database and configure the database connection in `application.properties`.

Keep database credentials outside version control and use environment variables for sensitive values.

### 3. Run the Application

Run the Spring Boot application from your IDE or use:

```bash
mvn spring-boot:run
```

### 4. Open the Application

If the frontend is inside Spring Boot's `static` directory, open:

```text
http://localhost:8080/
```

## 🔗 API Endpoints

The following routes are assumed by the frontend. Confirm these against your actual controller mappings.

| Method | Endpoint                    | Description        |
| ------ | --------------------------- | ------------------ |
| GET    | `/api/employee/readall`     | Retrieve employees |
| POST   | `/api/employee/create`      | Create an employee |
| PUT    | `/api/employee/modify/{id}` | Update an employee |
| DELETE | `/api/employee/delete/{id}` | Delete an employee |

## 📚 Key Learning Outcomes

* Building RESTful APIs using Spring Boot
* Implementing CRUD operations with Spring Data JPA
* Separating request and response data using DTOs
* Applying input validation
* Handling exceptions globally
* Connecting a JavaScript frontend to a Spring Boot backend
* Working with MySQL for persistent data storage

## 🎯 Project Purpose

This project was developed to strengthen practical understanding of backend development with Java and Spring Boot, while integrating a frontend dashboard with REST APIs.


