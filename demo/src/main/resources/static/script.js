
const API_BASE = " ";

const ENDPOINTS = {
    list: "/api/employee/readall",
    create: "/api/employee/create",
    update: id => `/api/employee/modify/${id}`,
    remove: id => `/api/employee/delete/${id}`
};

let employees = [];
let editingId = null;
let page = 1;
const pageSize = 6;

const $ = id => document.getElementById(id);

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function normalize(employee) {
    return {
        id: employee.id,
        name: employee.name ?? "",
        domain: employee.domain ?? "",
        salary: employee.salary ?? employee.Salary ?? 0,
        email: employee.email ?? employee.Email ?? ""
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
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

async function api(path, options = {}) {
    const response = await fetch(API_BASE + path, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {})
        }
    });

    const text = await response.text();

    let data;
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

async function loadEmployees() {
    try {
        const data = await api(ENDPOINTS.list);

        const list = Array.isArray(data)
            ? data
            : data?.content ?? data?.data ?? [];

        employees = list.map(normalize);

        updateStats();
        updateDomainFilter();
        renderEmployees();

    } catch (error) {
        $("employeeTable").innerHTML = `
            <tr>
                <td colspan="4" class="empty">
                    Could not load employees.<br>
                    ${escapeHTML(error.message)}
                </td>
            </tr>
        `;

        notify("Could not connect to Spring Boot.");
    }
}

function updateStats() {
    $("totalEmployees").textContent = employees.length;

    const domains = new Set(
        employees.map(e => e.domain).filter(Boolean)
    );

    $("totalDomains").textContent = domains.size;

    const average = employees.length
        ? employees.reduce((sum, e) => sum + Number(e.salary), 0)
            / employees.length
        : 0;

    $("averageSalary").textContent = money(average);

    $("recordCount").textContent =
        `${employees.length} records`;
}

function updateDomainFilter() {
    const select = $("domainFilter");
    const previous = select.value;

    const domains = [...new Set(
        employees.map(e => e.domain).filter(Boolean)
    )].sort();

    select.innerHTML = '<option value="">All domains</option>';

    domains.forEach(domain => {
        const option = document.createElement("option");
        option.value = domain;
        option.textContent = domain;
        select.appendChild(option);
    });

    select.value = domains.includes(previous) ? previous : "";
}

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

        return a.name.localeCompare(b.name);
    });

    return result;
}

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

    $("empPassword").required = !employee;

    $("passwordHelp").textContent = employee
        ? "Leave blank only if your backend supports keeping the existing password."
        : "Required when creating an employee.";

    $("modalBackdrop").classList.add("open");
}

function closeForm() {
    $("modalBackdrop").classList.remove("open");
}

function showFormError(message) {
    $("formError").textContent = message;
}

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

    if (!editingId && !password) {
        return showFormError("Password is required.");
    }

    const payload = {
        id,
        name,
        domain,
        Salary: salary,
        Email: email,
        password
    };

    if (editingId && !password) {
        delete payload.password;
    }

    const isEdit = editingId !== null;

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

    } catch (error) {
        showFormError(error.message);
    } finally {
        $("saveBtn").disabled = false;

        $("saveBtn").textContent =
            editingId !== null
                ? "Save Changes"
                : "Create Employee";
    }
});

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
    }
}

$("employeeTable").addEventListener("click", event => {
    const editButton = event.target.closest("[data-edit]");
    const deleteButton = event.target.closest("[data-delete]");

    if (editButton) {
        const employee = employees.find(
            e => String(e.id) === editButton.dataset.edit
        );

        if (employee) openForm(employee);
    }

    if (deleteButton) {
        deleteEmployee(deleteButton.dataset.delete);
    }
});

$("addBtn").onclick =
$("addEmployeeBtn").onclick = () => openForm();

$("closeModal").onclick =
$("cancelBtn").onclick = closeForm;

$("modalBackdrop").addEventListener("click", event => {
    if (event.target === $("modalBackdrop")) {
        closeForm();
    }
});

$("refreshBtn").onclick = loadEmployees;

$("directoryBtn").onclick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
};

$("searchInput").addEventListener("input", () => {
    page = 1;
    renderEmployees();
});

$("domainFilter").onchange = () => {
    page = 1;
    renderEmployees();
};

$("sortSelect").onchange = () => {
    page = 1;
    renderEmployees();
};

$("prevBtn").onclick = () => {
    page = Math.max(1, page - 1);
    renderEmployees();
};

$("nextBtn").onclick = () => {
    page++;
    renderEmployees();
};

loadEmployees();