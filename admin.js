const ADMIN_SUPABASE_URL = (window.VNG_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const ADMIN_SUPABASE_KEY = window.VNG_SUPABASE_ANON_KEY || "";

const state = {
  client: null,
  records: [],
  creating: false
};

const statusOptions = ["new", "contacted", "booked", "closed"];

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function toLocalInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInputValue(value) {
  return value ? new Date(value).toISOString() : null;
}

function setStatus(message) {
  $("adminStatus").textContent = message || "";
}

function requireClient() {
  if (!ADMIN_SUPABASE_URL || !ADMIN_SUPABASE_KEY || !window.supabase) {
    throw new Error("Admin config is missing.");
  }

  if (!state.client) {
    state.client = window.supabase.createClient(ADMIN_SUPABASE_URL, ADMIN_SUPABASE_KEY);
  }
  return state.client;
}

function filteredRecords() {
  const term = $("searchInput").value.trim().toLowerCase();
  if (!term) return state.records;

  return state.records.filter((record) => [
    record.full_name,
    record.phone,
    record.email,
    record.service_interested_in,
    record.consultation_type,
    record.status,
    record.message,
    record.admin_notes
  ].some((value) => String(value || "").toLowerCase().includes(term)));
}

function renderRecords() {
  const records = filteredRecords();
  const list = $("recordsList");

  if (!records.length) {
    list.innerHTML = '<article class="record-card"><p>No records found.</p></article>';
    return;
  }

  list.innerHTML = records.map((record) => `
    <article class="record-card" data-id="${record.id}">
      <div class="record-head">
        <div>
          <h3>${escapeHtml(record.full_name)}</h3>
          <p>${escapeHtml(record.phone)}${record.email ? " | " + escapeHtml(record.email) : ""}</p>
        </div>
        <span>${escapeHtml(record.status)}</span>
      </div>

      <div class="record-grid">
        <p><strong>Service:</strong> ${escapeHtml(record.service_interested_in)}</p>
        <p><strong>Visit:</strong> ${escapeHtml(record.consultation_type)}</p>
        <p><strong>Contact:</strong> ${escapeHtml(record.preferred_contact_method)}</p>
        <p><strong>Created:</strong> ${escapeHtml(record.created_at ? new Date(record.created_at).toLocaleString() : "")}</p>
      </div>

      ${record.message ? `<p class="record-message">${escapeHtml(record.message)}</p>` : ""}

      <form class="record-update">
        <label>
          <span>Status</span>
          <select name="status">
            ${statusOptions.map((status) => `<option value="${status}" ${record.status === status ? "selected" : ""}>${status}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Schedule</span>
          <input name="scheduled_for" type="datetime-local" value="${toLocalInputValue(record.scheduled_for)}" />
        </label>
        <label class="full">
          <span>Notes</span>
          <textarea name="admin_notes" rows="3">${escapeHtml(record.admin_notes)}</textarea>
        </label>
        <button class="button primary full" type="submit">Save Record</button>
      </form>
    </article>
  `).join("");

  document.querySelectorAll(".record-update").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await updateRecord(form.closest(".record-card").dataset.id, new FormData(form));
    });
  });
}

async function loadRecords() {
  const client = requireClient();
  setStatus("Loading records...");
  const { data, error } = await client
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    setStatus(error.message || "Could not load records.");
    return;
  }

  state.records = data || [];
  renderRecords();
  setStatus(`${state.records.length} record(s) loaded.`);
}

async function updateRecord(id, formData) {
  const client = requireClient();
  const payload = {
    status: String(formData.get("status") || "new"),
    scheduled_for: fromLocalInputValue(String(formData.get("scheduled_for") || "")),
    admin_notes: String(formData.get("admin_notes") || ""),
    updated_at: new Date().toISOString()
  };

  const { error } = await client
    .from("inquiries")
    .update(payload)
    .eq("id", id);

  if (error) {
    setStatus(error.message || "Could not save record.");
    return;
  }

  setStatus("Record saved.");
  await loadRecords();
}

async function createRecord(event) {
  event.preventDefault();
  if (state.creating) return;

  const client = requireClient();
  const submitButton = event.currentTarget.querySelector('button[type="submit"]');
  state.creating = true;
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Creating...";
  }

  const data = new FormData(event.currentTarget);
  const service = String(data.get("service_interested_in") || "");
  const visitType = String(data.get("consultation_type") || "");

  if (service === "Vastu" && visitType !== "in-person") {
    setStatus("Vastu records must be in person.");
    state.creating = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Record";
    }
    return;
  }

  const payload = {
    full_name: String(data.get("full_name") || "").trim(),
    phone: String(data.get("phone") || "").trim(),
    email: String(data.get("email") || "").trim() || null,
    service_interested_in: service,
    consultation_type: visitType,
    message: String(data.get("message") || "").trim() || null,
    preferred_contact_method: "Admin",
    scheduled_for: fromLocalInputValue(String(data.get("scheduled_for") || "")),
    status: "new",
    updated_at: new Date().toISOString()
  };

  const { error } = await client.from("inquiries").insert(payload);
  if (error) {
    setStatus(error.message || "Could not create record.");
    state.creating = false;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Create Record";
    }
    return;
  }

  event.currentTarget.reset();
  setStatus("Record created.");
  await loadRecords();
  state.creating = false;
  if (submitButton) {
    submitButton.disabled = false;
    submitButton.textContent = "Create Record";
  }
}

async function showSession() {
  const client = requireClient();
  const { data } = await client.auth.getSession();
  const hasSession = Boolean(data.session);

  $("loginPanel").hidden = hasSession;
  $("adminPanel").hidden = !hasSession;
  $("logoutButton").hidden = !hasSession;

  if (hasSession) {
    await loadRecords();
  }
}

function setupAdmin() {
  try {
    requireClient();
  } catch (error) {
    $("loginStatus").textContent = error.message;
    return;
  }

  $("loginForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const { error } = await state.client.auth.signInWithPassword({ email, password });

    if (error) {
      $("loginStatus").textContent = error.message || "Login failed.";
      return;
    }

    $("loginStatus").textContent = "";
    await showSession();
  });

  $("logoutButton").addEventListener("click", async () => {
    await state.client.auth.signOut();
    state.records = [];
    $("recordsList").innerHTML = "";
    await showSession();
  });

  $("refreshButton").addEventListener("click", loadRecords);
  $("searchInput").addEventListener("input", renderRecords);
  $("createForm").addEventListener("submit", createRecord);

  showSession();
}

setupAdmin();
