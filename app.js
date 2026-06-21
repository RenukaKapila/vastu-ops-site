const SUPABASE_URL = (window.VNG_SUPABASE_URL || "").replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
const SUPABASE_ANON_KEY = window.VNG_SUPABASE_ANON_KEY || "";
const BOOKING_NETWORK_ERROR = "Online saving could not connect.";
const RENUKA_WHATSAPP_URL = "https://wa.me/14696593734";

const serviceTypeMap = {
  Vastu: "in-person",
  Numerology: "online",
  Remedies: "in-person",
  "Vastu + Numerology": "in-person"
};

const chaldeanGroups = {
  1: "AIJQY",
  2: "BKR",
  3: "CGLS",
  4: "DMT",
  5: "EHNX",
  6: "UVW",
  7: "OZ",
  8: "FP"
};

const chaldeanMap = Object.fromEntries(
  Object.entries(chaldeanGroups).flatMap(([number, letters]) =>
    letters.split("").map((letter) => [letter, Number(number)])
  )
);

function reduceNumber(value) {
  let number = value;
  while (number > 9) {
    number = String(number).split("").reduce((sum, item) => sum + Number(item), 0);
  }
  return number;
}

function scoreText(text) {
  const total = String(text).toUpperCase().split("").reduce((sum, char) => {
    if (chaldeanMap[char]) return sum + chaldeanMap[char];
    if (/\d/.test(char)) return sum + Number(char);
    return sum;
  }, 0);

  return { total, reduced: reduceNumber(total) };
}

function isSupabaseReady() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

function supabaseRestUrl() {
  return SUPABASE_URL.endsWith("/rest/v1")
    ? SUPABASE_URL
    : `${SUPABASE_URL}/rest/v1`;
}

function supabaseHeaders() {
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    Prefer: "return=minimal"
  };

  if (!SUPABASE_ANON_KEY.startsWith("sb_publishable_")) {
    headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  return headers;
}

function bookingFallbackUrl(payload) {
  const lines = [
    "Hello Renuka, I would like booking support for Vastu Numerology Guide.",
    `Name: ${payload.full_name}`,
    `Phone: ${payload.phone}`,
    payload.email ? `Email: ${payload.email}` : "",
    `Service: ${payload.service_interested_in}`,
    `Visit Type: ${payload.consultation_type}`,
    payload.preferred_contact_method ? `Preferred Contact: ${payload.preferred_contact_method}` : "",
    payload.message ? `Message: ${payload.message}` : ""
  ].filter(Boolean);

  return `${RENUKA_WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function showBookingFallback(status, payload, message) {
  const link = document.createElement("a");
  link.href = bookingFallbackUrl(payload);
  link.textContent = "Send details on WhatsApp";
  link.target = "_blank";
  link.rel = "noopener";

  status.textContent = `${message} `;
  status.appendChild(link);
}

async function saveInquiry(payload) {
  if (!isSupabaseReady()) {
    throw new Error("Online saving is not connected yet.");
  }

  let response;
  try {
    response = await fetch(`${supabaseRestUrl()}/inquiries`, {
      method: "POST",
      headers: supabaseHeaders(),
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error(BOOKING_NETWORK_ERROR);
  }

  if (!response.ok) {
    throw new Error("Request could not be saved.");
  }
}

function syncConsultationType() {
  const service = document.getElementById("serviceInterested");
  const type = document.getElementById("consultationType");
  const note = document.getElementById("serviceRule");
  if (!service || !type || !note) return;

  const selected = service.value;
  const requiredType = serviceTypeMap[selected];

  if (selected === "Vastu" || selected === "Vastu + Numerology") {
    type.value = "in-person";
    [...type.options].forEach((option) => {
      option.disabled = option.value !== "in-person";
    });
    note.textContent = "Vastu requires at least one in-person visit. Numerology may be completed online.";
    return;
  }

  [...type.options].forEach((option) => {
    option.disabled = false;
  });

  if (requiredType) {
    type.value = requiredType;
  }
  note.textContent = selected === "Numerology"
    ? "Numerology is available online for $150."
    : "Remedies are guided by the consultation.";
}

function setupInquiryForm() {
  const form = document.getElementById("inquiryForm");
  const status = document.getElementById("formStatus");
  const service = document.getElementById("serviceInterested");
  const type = document.getElementById("consultationType");
  if (!form || !status || !service || !type) return;

  service.addEventListener("change", syncConsultationType);
  syncConsultationType();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    syncConsultationType();

    const data = new FormData(form);
    const payload = {
      full_name: String(data.get("full_name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      email: String(data.get("email") || "").trim() || null,
      service_interested_in: String(data.get("service_interested_in") || "").trim(),
      consultation_type: String(data.get("consultation_type") || "").trim(),
      message: String(data.get("message") || "").trim() || null,
      preferred_contact_method: String(data.get("preferred_contact_method") || "").trim() || null
    };

    if (!payload.full_name || !payload.phone || !payload.service_interested_in || !payload.consultation_type) {
      status.textContent = "Please add name, phone, service, and visit type.";
      return;
    }

    if ((payload.service_interested_in === "Vastu" || payload.service_interested_in === "Vastu + Numerology") && payload.consultation_type !== "in-person") {
      status.textContent = "Vastu must be in person.";
      return;
    }

    try {
      await saveInquiry(payload);
      window.location.assign("/thank-you.html");
    } catch (error) {
      showBookingFallback(status, payload, error.message);
    }
  });
}

function setupAudit() {
  const button = document.getElementById("runAudit");
  const report = document.getElementById("auditReport");
  if (!button || !report) return;

  button.addEventListener("click", () => {
    const allowed = new Set([1, 3, 4]);
    const items = [...document.querySelectorAll("h1,h2,h3,a,button,label span,strong,summary,.eyebrow")];
    const rows = [];

    items.forEach((item) => {
      if (item.closest("[data-audit-exempt]") || item.dataset.auditExempt) return;
      const text = item.textContent.replace(/\s+/g, " ").trim();
      if (!text || rows.some((row) => row.text === text)) return;

      const score = scoreText(text);
      rows.push({ text, ...score, pass: allowed.has(score.reduced) });
    });

    report.innerHTML = rows
      .map((row) => `<p>${row.pass ? "PASS" : "CHECK"}: ${row.text} = ${row.total} / ${row.reduced}</p>`)
      .join("");
  });
}

setupInquiryForm();
setupAudit();
