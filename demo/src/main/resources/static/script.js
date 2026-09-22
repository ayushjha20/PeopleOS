
const API_BASE = "";

const ENDPOINTS = {
    list: "/api/employee/getall",
    create: "/api/employee/create",
    getById: id => `/api/employee/get/${id}`,
    update: id => `/api/employee/update/get/${id}`,
    remove: id => `/api/employee/delete/${id}`
};

let employees = [];
let editingId = null;
let page = 1;
const pageSize = 6;

const $ = id => document.getElementById(id);

// Escape HTML to prevent user-entered values from becoming markup
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// Support the field names returned by your DTO
function normalize(employee) {
    return {
        id: employee.id,
        name: employee.name ?? "",
        domain: employee.domain ?? "",
        salary: employee.Salary ?? employee.salary ?? 0,
        email: employee.Email ?? employee.email ?? ""
    };
}

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);
}

function notify(message) {
    const toast = $("toast");

    if (!toast) {
        console.log(message);
        return;
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

function showFormError(message) {
    $("formError").textContent = message;
}

// Centralized API request handler
async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: {
            ...(options.body ? {
                "Content-Type": "application/json"
            } : {}),
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        throw new Error(
            typeof data === "string"
                ? data
                : data?.message || `HTTP ${response.status}`
        );
    }

    return data;
}

// Read all employees
async function loadEmployees() {
    const table = $("employeeTable");

    table.innerHTML = `
        <tr>
            <td colspan="4" class="empty">
                Loading employees...
            </td>
        </tr>
    `;

    try {
        const data = await api(ENDPOINTS.list);

        const list = Array.isArray(data)
            ? data
            : data?.content ?? data?.data ?? [];

        employees = list.map(normalize);

        page = 1;

        updateStats();
        updateDomainFilter();
        renderEmployees();

    } catch (error) {
        table.innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    Could not load employees.<br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        notify("Could not connect to Spring Boot.");
        console.error("Load employees error:", error);
    }
}

// Dashboard statistics
function updateStats() {
    $("totalEmployees").textContent = employees.length;

    const domains = new Set(
        employees.map(employee => employee.domain).filter(Boolean)
    );

    $("totalDomains").textContent = domains.size;

    const average = employees.length
        ? employees.reduce(
            (sum, employee) => sum + Number(employee.salary),
            0
        ) / employees.length
        : 0;

    $("averageSalary").textContent = money(average);

    $("recordCount").textContent =
        `${employees.length} records`;
}

// Populate domain filter
function updateDomainFilter() {
    const select = $("domainFilter");
    const previous = select.value;

    const domains = [
        ...new Set(
            employees.map(employee => employee.domain).filter(Boolean)
        )
    ].sort();

    select.innerHTML = `
        <option value="">All domains</option>
    `;

    domains.forEach(domain => {
        const option = document.createElement("option");

        option.value = domain;
        option.textContent = domain;

        select.appendChild(option);
    });

    select.value = domains.includes(previous) ? previous : "";
}

// Search, filter and sort
function getFilteredEmployees() {
    const query = $("searchInput").value.toLowerCase().trim();
    const domain = $("domainFilter").value;
    const sort = $("sortSelect").value;

    const result = employees.filter(employee => {
        const matchesDomain =
            !domain || employee.domain === domain;

        const matchesSearch = [
            employee.id,
            employee.name,
            employee.email,
            employee.domain
        ].some(value =>
            String(value ?? "").toLowerCase().includes(query)
        );

        return matchesDomain && matchesSearch;
    });

    result.sort((a, b) => {
        if (sort === "id") {
            return Number(a.id) - Number(b.id);
        }

        if (sort === "salary-desc") {
            return Number(b.salary) - Number(a.salary);
        }

        if (sort === "salary-asc") {
            return Number(a.salary) - Number(b.salary);
        }

        return String(a.name).localeCompare(String(b.name));
    });

    return result;
}

// Render employee table and pagination
function renderEmployees() {
    const filtered = getFilteredEmployees();

    const pages = Math.max(
        1,
        Math.ceil(filtered.length / pageSize)
    );

    page = Math.min(page, pages);

    const start = (page - 1) * pageSize;
    const shown = filtered.slice(start, start + pageSize);

    $("pageNumber").textContent = page;

    $("prevBtn").disabled = page <= 1;
    $("nextBtn").disabled = page >= pages;

    $("resultInfo").textContent = filtered.length
        ? `Showing ${start + 1}–${Math.min(
            start + pageSize,
            filtered.length
        )} of ${filtered.length} employees`
        : "No matching employees";

    if (!shown.length) {
        $("employeeTable").innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    No employees found.
                </td>
            </tr>
        `;

        return;
    }

    $("employeeTable").innerHTML = shown.map(employee => `
        <tr>
            <td>
                <span class="employee-name">
                    ${escapeHTML(employee.name)}
                </span>

                <span class="employee-sub">
                    ID: ${escapeHTML(employee.id)}
                    · ${escapeHTML(employee.email)}
                </span>
            </td>

            <td>
                <span class="domain">
                    ${escapeHTML(employee.domain || "Unassigned")}
                </span>
            </td>

            <td class="salary">
                ${money(employee.salary)}
            </td>

            <td>
                <div class="actions">
                    <button
                        class="edit-btn"
                        data-edit="${escapeHTML(employee.id)}">
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        data-delete="${escapeHTML(employee.id)}">
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join("");
}

// Open add/edit form
function openForm(employee = null) {
    editingId = employee ? employee.id : null;

    $("employeeForm").reset();
    $("formError").textContent = "";

    $("modalTitle").textContent =
        employee ? "Edit Employee" : "Add Employee";

    $("saveBtn").textContent =
        employee ? "Save Changes" : "Create Employee";

    $("empId").value = employee?.id ?? "";
    $("empId").readOnly = Boolean(employee);

    $("empName").value = employee?.name ?? "";
    $("empDomain").value = employee?.domain ?? "";
    $("empSalary").value = employee?.salary ?? "";
    $("empEmail").value = employee?.email ?? "";

    // Reset password input each time the form opens
    $("empPassword").value = "";
    $("empPassword").required = !employee;

    // Update password helper text
    $("passwordHelp").textContent = employee
        ? ""
        : "Required when creating an employee.";

    // Hide the ENTIRE password section during editing
    const passwordGroup = $("passwordGroup");

    if (employee) {
        passwordGroup.style.display = "none";
    } else {
        passwordGroup.style.display = "";
    }

    $("modalBackdrop").classList.add("open");
}

function closeForm() {
    $("modalBackdrop").classList.remove("open");
}

// Create or update employee
$("employeeForm").addEventListener("submit", async event => {
    event.preventDefault();

    const id = Number($("empId").value);
    const name = $("empName").value.trim();
    const domain = $("empDomain").value.trim();
    const salary = Number($("empSalary").value);
    const email = $("empEmail").value.trim();
    const password = $("empPassword").value;

    if (!Number.isInteger(id) || id <= 0) {
        return showFormError("Enter a valid employee ID.");
    }

    if (!name) {
        return showFormError("Name is required.");
    }

    if (!Number.isFinite(salary) || salary < 20000) {
        return showFormError("Salary must be at least ₹20,000.");
    }

    if (!email || !$("empEmail").checkValidity()) {
        return showFormError("Enter a valid email.");
    }

    if (editingId === null && !password) {
        return showFormError("Password is required.");
    }

    const isEdit = editingId !== null;

    const payload = {
        id,
        name,
        domain,
        Salary: salary,
        Email: email
    };

    // Send password only when creating an employee.
    // It is not editable in the update form.
    if (!isEdit) {
        payload.password = password;
    }

    $("saveBtn").disabled = true;

    try {
        await api(
            isEdit
                ? ENDPOINTS.update(editingId)
                : ENDPOINTS.create,
            {
                method: isEdit ? "PUT" : "POST",
                body: JSON.stringify(payload)
            }
        );

        closeForm();

        notify(
            isEdit
                ? "Employee updated successfully."
                : "Employee created successfully."
        );

        await loadEmployees();

        // Reset editing state after a successful save
        editingId = null;

    } catch (error) {
        showFormError(error.message);
        console.error("Save employee error:", error);

    } finally {
        $("saveBtn").disabled = false;

        $("saveBtn").textContent =
            editingId !== null
                ? "Save Changes"
                : "Create Employee";
    }
});

// Delete employee
async function deleteEmployee(id) {
    const employee = employees.find(
        e => String(e.id) === String(id)
    );

    const confirmed = confirm(
        `Delete ${employee?.name || "this employee"} (ID ${id})?`
    );

    if (!confirmed) return;

    try {
        await api(ENDPOINTS.remove(id), {
            method: "DELETE"
        });

        notify("Employee deleted successfully.");

        await loadEmployees();

    } catch (error) {
        notify(`Delete failed: ${error.message}`);
        console.error("Delete employee error:", error);
    }
}

// Handle table buttons
$("employeeTable").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
        const employee = employees.find(
            e => String(e.id) === editButton.dataset.edit
        );

        if (employee) {
            openForm(employee);
        }
    }

    if (deleteButton) {
        deleteEmployee(deleteButton.dataset.delete);
    }
});

// Add employee buttons
$("addBtn").onclick = () => openForm();
$("addEmployeeBtn").onclick = () => openForm();

// Close modal
$("closeModal").onclick = closeForm;
$("cancelBtn").onclick = closeForm;

$("modalBackdrop").addEventListener("click", event => {
    if (event.target === $("modalBackdrop")) {
        closeForm();
    }
});

// Refresh
$("refreshBtn").onclick = loadEmployees;

// Directory navigation
$("directoryBtn").onclick = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
};

// Search
$("searchInput").addEventListener("input", () => {
    page = 1;
    renderEmployees();
});

// Domain filter
$("domainFilter").onchange = () => {
    page = 1;
    renderEmployees();
};

// Sorting
$("sortSelect").onchange = () => {
    page = 1;
    renderEmployees();
};

// Pagination
$("prevBtn").onclick = () => {
    page = Math.max(1, page - 1);
    renderEmployees();
};

$("nextBtn").onclick = () => {
    page++;
    renderEmployees();
};

// Initial load
loadEmployees();