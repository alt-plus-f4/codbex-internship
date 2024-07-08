# Vacation Management Application

## Overview

The Vacation Management Application simplifies the process of handling employee vacation requests within a company. Employees can submit vacation requests, and employers can approve or deny them. Additionally, employers can view a comprehensive calendar of all approved vacations, ensuring better workforce management.

## Features

- 🗓️ **Employee Vacation Requests**: Easy-to-use interface for employees to request vacations.
- ✅ **Employer Approval**: Employers can review, approve, or deny vacation requests.
- 📅 **Vacation Overview**: Calendar view of all approved vacations for efficient planning.

### Prerequisites

- Dirigible
- Docker (to run dirigible)

### Steps

1. **Pull the Dirigible Docker Image:**:
    ```bash
    docker pull dirigiblelabs/dirigible:latest
    ```
    
2. **Run Dirigible:**:
    ```bash
    docker run --name dirigible --rm -p 8080:8080 -p 8081:8081 dirigiblelabs/dirigible:latest
    ```
    
3. **Open a web browser and go to: http://localhost:8080/:**

---

4. **Clone the github repo at the Github perspective URL:**
   ```
   https://github.com/alt-plus-f4/codbex-internship
   ```
5. **Check the generated index.html**
    
## Usage

1. **Employee**:
    - Log in and navigate to the 'Request Vacation' page.
    - Select start and end dates and submit the request.

2. **Employer**:
    - Log in and navigate to the 'Dashboard'.
    - Review pending requests and approve or deny them.
    - View the 'Vacation Overview' to manage team schedules.

## Issues and Solutions

- **Issue**: Vacation requests are not updating in real-time.
- **Issue**: Delays in request status updates.
- **Issue**: Not working aproving or denying requests.
- **Issue**: Race conditions with multiple users.

## EDM (Entity data model diagram)
![Screenshot 2024-07-08 100751](https://github.com/alt-plus-f4/codbex-internship/assets/79216061/13313ed3-ba52-4a76-a46c-d106afac547c)

## Workflow chart
![flowchart](https://github.com/alt-plus-f4/codbex-internship/assets/79216061/c3e4b560-9c98-4bfc-a122-121ed0a1b914)


## GitHub Repository

The codebase is available on GitHub. Clone the repository using the following link:

[Vacation Management App Repository](https://github.com/alt-plus-f4/codbex-internship)


## Contact

For any inquiries or issues, please contact valentin.p.asenov.2020@elsys-bg.org.

---

