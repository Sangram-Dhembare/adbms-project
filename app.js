"use strict";

const STORAGE_KEY = "campusOS.campusEvents.v1";

const seedData = {
  events: [
    {
      _id: "EVT101",
      title: "HackCampus 2026",
      category: "Technical",
      organizerClub: "Coding Club",
      venue: "Auditorium A",
      date: "2026-10-15T09:00:00.000Z",
      capacity: 200,
      seatsAvailable: 45,
      entryFee: 150,
      tags: ["hackathon", "coding", "prizes"],
      coordinators: [{ name: "Aarav Sharma", contact: "aarav@college.edu" }],
      sponsors: ["TechCorp", "DevStudio"],
    },
    {
      _id: "EVT102",
      title: "Annual Music Night",
      category: "Cultural",
      organizerClub: "Music Society",
      venue: "Open Air Theatre",
      date: "2026-10-20T18:00:00.000Z",
      capacity: 500,
      seatsAvailable: 120,
      entryFee: 0,
      tags: ["music", "concert", "night"],
      coordinators: [{ name: "Riya Sen", contact: "riya@college.edu" }],
      sponsors: [],
    },
    {
      _id: "EVT103",
      title: "AI & Robotics Workshop",
      category: "Technical",
      organizerClub: "Robotics Club",
      venue: "Lab 3",
      date: "2026-11-05T10:00:00.000Z",
      capacity: 60,
      seatsAvailable: 10,
      entryFee: 50,
      tags: ["ai", "robotics", "workshop"],
      coordinators: [{ name: "Karan Patel", contact: "karan@college.edu" }],
      sponsors: ["RoboLabs"],
    },
  ],
  registrations: [
    {
      ticketId: "TICK-2026-001",
      eventId: "EVT101",
      studentId: "STU8821",
      studentName: "Priya Verma",
      department: "Computer Science",
      year: 3,
      registrationDate: "2026-09-12T14:30:00.000Z",
      checkInStatus: false,
      paymentDetails: { method: "UPI", amountPaid: 150, status: "Completed" },
    },
    {
      ticketId: "TICK-2026-002",
      eventId: "EVT102",
      studentId: "STU8821",
      studentName: "Priya Verma",
      department: "Computer Science",
      year: 3,
      registrationDate: "2026-09-13T10:00:00.000Z",
      checkInStatus: true,
      paymentDetails: { method: "Free", amountPaid: 0, status: "Completed" },
    },
    {
      ticketId: "TICK-2026-003",
      eventId: "EVT101",
      studentId: "STU4412",
      studentName: "Rohan Gupta",
      department: "Electrical Engineering",
      year: 2,
      registrationDate: "2026-09-14T11:20:00.000Z",
      checkInStatus: true,
      paymentDetails: { method: "Card", amountPaid: 150, status: "Completed" },
    },
    {
      ticketId: "TICK-2026-004",
      eventId: "EVT103",
      studentId: "STU9903",
      studentName: "Ananya Roy",
      department: "Computer Science",
      year: 4,
      registrationDate: "2026-09-15T16:45:00.000Z",
      checkInStatus: false,
      paymentDetails: { method: "UPI", amountPaid: 50, status: "Completed" },
    },
  ],
  clubs: [
    { _id: "CLB101", name: "Coding Club", category: "Technical" },
    { _id: "CLB102", name: "Music Society", category: "Cultural" },
    { _id: "CLB103", name: "Robotics Club", category: "Technical" },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
let state = clone(seedData);
let workspaces = [{
  id: "northstar-university",
  name: "Northstar University",
  location: "Campus workspace",
  data: clone(seedData),
}];
let activeWorkspaceId = workspaces[0].id;
let profile = {
  name: "Alex Morgan",
  email: "alex.morgan@campusos.edu",
  role: "Event administrator",
};
let savedDataError = false;
const storedState = localStorage.getItem(STORAGE_KEY);
if (storedState) {
  try {
    const parsedState = JSON.parse(storedState);
    const isDataSet = (data) => data
      && Array.isArray(data.events)
      && Array.isArray(data.registrations)
      && Array.isArray(data.clubs);
    if (Array.isArray(parsedState.workspaces)) {
      const validWorkspaces = parsedState.workspaces.filter((workspace) => (
        workspace
        && typeof workspace.id === "string"
        && typeof workspace.name === "string"
        && isDataSet(workspace.data)
      ));
      if (validWorkspaces.length !== parsedState.workspaces.length) savedDataError = true;
      if (validWorkspaces.length) workspaces = validWorkspaces;
      activeWorkspaceId = workspaces.some((workspace) => workspace.id === parsedState.activeWorkspaceId)
        ? parsedState.activeWorkspaceId
        : workspaces[0].id;
      const storedProfile = parsedState.profile || {};
      profile = {
        name: typeof storedProfile.name === "string" ? storedProfile.name : profile.name,
        email: typeof storedProfile.email === "string" ? storedProfile.email : profile.email,
        role: typeof storedProfile.role === "string" ? storedProfile.role : profile.role,
      };
      state = clone(workspaces.find((workspace) => workspace.id === activeWorkspaceId).data);
    } else if (isDataSet(parsedState)) {
      state = parsedState;
      workspaces[0].data = clone(parsedState);
    } else {
      savedDataError = true;
    }
  } catch (error) {
    console.error("Could not read saved CampusOS data.", error);
    savedDataError = true;
  }
}

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const pageNames = {
  overview: "Overview",
  events: "Events",
  attendees: "Attendees",
  analytics: "Analytics",
  database: "Query studio",
};
let activeFilter = "all";
let chartMode = "revenue";

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function money(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function notify(message, error = false) {
  const toast = document.createElement("div");
  toast.className = `toast-message${error ? " error" : ""}`;
  toast.innerHTML = `<span>${error ? "!" : "✓"}</span><span>${escapeHtml(message)}</span>`;
  $("#toast-stack").append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function persist() {
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  if (!activeWorkspace) throw new Error("Cannot save data because the active university is missing.");
  activeWorkspace.data = clone(state);
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    workspaces,
    activeWorkspaceId,
    profile,
  }));
}

function renderWorkspaceControls() {
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);
  $("#workspace-name").textContent = activeWorkspace.name;
  $("#workspace-icon").textContent = initials(activeWorkspace.name).slice(0, 1);
  $("#workspace-options").innerHTML = workspaces.map((workspace) => {
    const selected = workspace.id === activeWorkspaceId;
    return `<button class="workspace-option ${selected ? "selected" : ""}" type="button" data-switch-workspace="${escapeHtml(workspace.id)}">
      <span class="workspace-option-icon">${escapeHtml(initials(workspace.name).slice(0, 1))}</span>
      <span class="workspace-option-copy"><strong>${escapeHtml(workspace.name)}</strong><small>${escapeHtml(workspace.location || "Campus workspace")} · ${workspace.data.events.length} events</small></span>
      ${selected ? '<span class="workspace-option-check" aria-label="Current university">✓</span>' : ""}
    </button>`;
  }).join("");
}

function renderProfileControls() {
  const name = profile.name || "Campus administrator";
  const profileInitials = initials(name) || "CA";
  $$("[data-profile-name]").forEach((element) => { element.textContent = name; });
  $$("[data-profile-initials]").forEach((element) => { element.textContent = profileInitials; });
  $$("[data-profile-email]").forEach((element) => { element.textContent = profile.email || "No email added"; });
  $$("[data-profile-role]").forEach((element) => { element.textContent = profile.role || "University administrator"; });
  $("#profile-button").setAttribute("aria-label", `Profile for ${name}`);
}

function closeWorkspaceMenu() {
  $("#workspace-menu").classList.add("hidden");
  $("#workspace-switcher").setAttribute("aria-expanded", "false");
}

function closeProfileMenu() {
  $("#profile-menu").classList.add("hidden");
  $("#profile-button").setAttribute("aria-expanded", "false");
  $("#top-profile-button").setAttribute("aria-expanded", "false");
}

function switchWorkspace(id) {
  const workspace = workspaces.find((item) => item.id === id);
  if (!workspace || workspace.id === activeWorkspaceId) {
    closeWorkspaceMenu();
    return;
  }
  persist();
  activeWorkspaceId = workspace.id;
  state = clone(workspace.data);
  activeFilter = "all";
  renderWorkspaceControls();
  closeWorkspaceMenu();
  render();
  persist();
  notify(`Switched to ${workspace.name}.`);
}

function eventById(id) {
  return state.events.find((event) => event._id === id);
}

function ticketById(id) {
  return state.registrations.find((registration) => registration.ticketId.toLowerCase() === id.toLowerCase());
}

function initials(name) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase();
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function eventIcon(event) {
  if (/music|concert/i.test(event.title + event.category)) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V5l12-2v13M9 18c0 1.7-1.6 3-3.5 3S2 19.7 2 18s1.6-3 3.5-3S9 16.3 9 18Zm12-2c0 1.7-1.6 3-3.5 3S14 17.7 14 16s1.6-3 3.5-3 3.5 1.3 3.5 3Z"/></svg>';
  }
  if (/robot|workshop/i.test(event.title + event.category)) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="3"/><path d="M12 3v4m-3 6h.01M15 13h.01M8 17h8M2 12h2m16 0h2"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 12 5l7 14M8 14h8M4 20h16M8 10h8"/></svg>';
}

function matchingEvents(query = "", filter = "all") {
  const normalized = query.trim().toLowerCase();
  return state.events.filter((event) => {
    const matchesText = !normalized || [
      event.title,
      event._id,
      event.category,
      event.organizerClub,
      event.venue,
      ...(event.tags || []),
    ].join(" ").toLowerCase().includes(normalized);
    const matchesFilter = filter === "all"
      || (filter === "free" && event.entryFee === 0 && event.seatsAvailable > 50)
      || (filter === "tagged" && (event.tags || []).some((tag) => ["coding", "hackathon"].includes(tag.toLowerCase())));
    return matchesText && matchesFilter;
  });
}

function renderEventList(container, query = "", filter = "all", empty = null) {
  const events = matchingEvents(query, filter);
  container.innerHTML = events.map((event) => {
    const seatsLow = event.seatsAvailable <= Math.max(10, Math.ceil(event.capacity * 0.1));
    const tags = (event.tags || []).slice(0, 3).map(escapeHtml).join(" · ");
    const categoryClass = event.category === "Cultural" ? "category-cultural" : "category-technical";
    return `<article class="event-row">
      <div class="event-art ${/music|concert/i.test(event.title) ? "art-music" : /robot|workshop/i.test(event.title) ? "art-robotics" : event._id === "EVT101" ? "" : "art-custom"}">${eventIcon(event)}</div>
      <div class="event-main">
        <div class="event-title-line"><span class="event-title">${escapeHtml(event.title)}</span><span class="category-tag ${categoryClass}">${escapeHtml(event.category)}</span></div>
        <div class="event-meta"><span><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M7.5 3v4M16.5 3v4M3.5 10h17"/></svg>${escapeHtml(formatDate(event.date))} · ${escapeHtml(formatTime(event.date))}</span><span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>${escapeHtml(event.venue)}</span><span>${escapeHtml(event.organizerClub)}</span></div>
        <div class="event-tags">${tags}</div>
      </div>
      <div class="event-side">
        <span class="event-fee ${event.entryFee === 0 ? "free" : ""}">${event.entryFee === 0 ? "Free" : money(event.entryFee)}</span>
        <span class="seat-count ${seatsLow ? "low" : ""}">${event.seatsAvailable} seats left</span>
        <div class="event-actions"><button class="mini-button" type="button" data-book="${escapeHtml(event._id)}" ${event.seatsAvailable < 1 ? "disabled" : ""}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/></svg>Book</button><button class="mini-button" type="button" data-sponsor="${escapeHtml(event._id)}">Sponsor</button></div>
      </div>
    </article>`;
  }).join("");
  if (empty) {
    empty.textContent = state.events.length
      ? "No events match this search. Try another name, club, or tag."
      : "No events in this university yet. Create your first event to get started.";
    empty.classList.toggle("hidden", events.length > 0);
  }
}

function registrationRows(registrations, extended = false) {
  return registrations.map((registration) => {
    const event = eventById(registration.eventId);
    const checkedIn = Boolean(registration.checkInStatus);
    const status = `<span class="status-pill ${checkedIn ? "" : "status-pending"}">${checkedIn ? "Checked in" : "Registered"}</span>`;
    const avatar = `<span class="attendee-avatar">${escapeHtml(initials(registration.studentName))}</span>`;
    const attendee = `<span class="attendee-cell">${avatar}<span class="attendee-name"><strong>${escapeHtml(registration.studentName)}</strong><small>${escapeHtml(registration.studentId)}</small></span></span>`;
    if (extended) {
      return `<tr><td>${attendee}</td><td>${escapeHtml(event?.title || registration.eventId)}</td><td>${escapeHtml(registration.department)}</td><td>Year ${escapeHtml(registration.year)}</td><td><span class="ticket-id">${escapeHtml(registration.ticketId)}</span></td><td>${money(registration.paymentDetails.amountPaid)} · ${escapeHtml(registration.paymentDetails.method)}</td><td><button class="mini-button" type="button" data-checkin="${escapeHtml(registration.ticketId)}">${checkedIn ? "Checked in" : "Check in"}</button></td></tr>`;
    }
    return `<tr><td>${attendee}</td><td>${escapeHtml(event?.title || registration.eventId)}</td><td>${escapeHtml(registration.department)}</td><td><span class="ticket-id">${escapeHtml(registration.ticketId)}</span></td><td>${status}</td></tr>`;
  }).join("");
}

function renderRegistrations(query = "") {
  const normalized = query.trim().toLowerCase();
  const registrations = [...state.registrations]
    .sort((a, b) => new Date(b.registrationDate) - new Date(a.registrationDate))
    .filter((registration) => {
      const event = eventById(registration.eventId);
      return !normalized || [
        registration.studentName,
        registration.studentId,
        registration.department,
        registration.ticketId,
        event?.title || "",
      ].join(" ").toLowerCase().includes(normalized);
    });
  $("#registration-table").innerHTML = registrationRows(registrations.slice(0, 4));
  $("#registrations-empty").classList.toggle("hidden", registrations.length > 0);
  $("#attendee-table").innerHTML = registrationRows(registrations, true);
  $("#attendee-empty").classList.toggle("hidden", registrations.length > 0);
  $("#attendee-page-count").textContent = String(state.registrations.length).padStart(2, "0");
}

function revenueGroups() {
  const totals = new Map();
  for (const registration of state.registrations) {
    const event = eventById(registration.eventId);
    if (!event) continue;
    const group = totals.get(event._id) || { eventId: event._id, title: event.title, club: event.organizerClub, revenue: 0, tickets: 0 };
    group.revenue += Number(registration.paymentDetails?.amountPaid || 0);
    group.tickets += 1;
    totals.set(event._id, group);
  }
  return [...totals.values()].sort((a, b) => b.revenue - a.revenue);
}

function departmentGroups() {
  const totals = new Map();
  for (const registration of state.registrations) {
    totals.set(registration.department, (totals.get(registration.department) || 0) + 1);
  }
  return [...totals.entries()].map(([department, count]) => ({ department, count })).sort((a, b) => b.count - a.count);
}

function turnoutGroups() {
  const totals = new Map();
  for (const registration of state.registrations) {
    const group = totals.get(registration.eventId) || { eventId: registration.eventId, total: 0, checkedIn: 0 };
    group.total += 1;
    group.checkedIn += registration.checkInStatus ? 1 : 0;
    totals.set(registration.eventId, group);
  }
  return [...totals.values()];
}

function renderAnalytics() {
  const revenue = revenueGroups();
  const departments = departmentGroups();
  const turnout = turnoutGroups();
  const totalRevenue = state.registrations.reduce((total, registration) => total + Number(registration.paymentDetails?.amountPaid || 0), 0);
  const checkedIn = state.registrations.filter((registration) => registration.checkInStatus).length;
  const checkInRate = state.registrations.length ? Math.round((checkedIn / state.registrations.length) * 100) : 0;

  $("#stat-revenue").textContent = money(totalRevenue);
  $("#stat-registrations").textContent = String(state.registrations.length).padStart(2, "0");
  $("#stat-event-count").textContent = String(state.events.length);
  $("#stat-checkin").innerHTML = `${checkInRate}<span class="value-unit">%</span>`;
  $("#stat-checkin-count").textContent = String(checkedIn);
  $("#event-nav-count").textContent = String(state.events.length).padStart(2, "0");
  $("#events-heading-count").textContent = String(state.events.length).padStart(2, "0");
  $("#events-page-count").textContent = String(state.events.length).padStart(2, "0");

  $("#chart-total").textContent = money(totalRevenue);
  const maxRevenue = Math.max(1, ...revenue.map((group) => group.revenue));
  $("#bar-chart").innerHTML = revenue.map((group) => {
    const value = chartMode === "revenue" ? group.revenue : group.tickets;
    const max = chartMode === "revenue" ? maxRevenue : Math.max(1, ...revenue.map((item) => item.tickets));
    const height = Math.max(5, (value / max) * 100);
    return `<div class="chart-column" title="${escapeHtml(group.title)}: ${chartMode === "revenue" ? money(group.revenue) : `${group.tickets} tickets`}"><div class="chart-bar-track"><div class="chart-bar" style="height:${height}%"></div></div><span class="chart-label">${escapeHtml(group.eventId)}</span></div>`;
  }).join("");
  $("#chart-period").textContent = chartMode === "revenue" ? "BY EVENT" : "TICKETS SOLD";
  $("#chart-mode-button").innerHTML = `${chartMode === "revenue" ? "Revenue" : "Tickets"} <span>⌄</span>`;

  const topDepartments = departments.slice(0, 4);
  const maxDepartmentCount = Math.max(1, ...topDepartments.map((item) => item.count));
  $("#department-list").innerHTML = topDepartments.length
    ? topDepartments.map((item) => `<div class="department-item"><div class="department-item-top"><span>${escapeHtml(item.department)}</span><strong>${item.count}</strong></div><div class="department-bar"><span style="width:${(item.count / maxDepartmentCount) * 100}%"></span></div></div>`).join("")
    : '<div class="empty-state">No registrations yet.</div>';
  $("#revenue-metrics").innerHTML = revenue.length
    ? revenue.map((item) => `<div class="metric-row"><span>${escapeHtml(item.club)}</span><div class="metric-track"><span style="width:${Math.max(3, (item.revenue / maxRevenue) * 100)}%"></span></div><strong>${money(item.revenue)}</strong></div>`).join("")
    : '<div class="empty-state">No ticket revenue yet.</div>';
  const maxDept = Math.max(1, ...departments.map((item) => item.count));
  $("#department-metrics").innerHTML = departments.length
    ? departments.map((item) => `<div class="metric-row"><span>${escapeHtml(item.department)}</span><div class="metric-track"><span style="width:${(item.count / maxDept) * 100}%"></span></div><strong>${item.count}</strong></div>`).join("")
    : '<div class="empty-state">No registrations yet.</div>';
  $("#turnout-metrics").innerHTML = turnout.length
    ? turnout.map((item) => {
      const event = eventById(item.eventId);
      const percentage = item.total ? Math.round((item.checkedIn / item.total) * 100) : 0;
      return `<div class="turnout-row"><strong>${escapeHtml(event?.title || item.eventId)}</strong><small>${item.total} registered</small><small>${item.checkedIn} checked in</small><span class="turnout-percent">${percentage}%</span></div>`;
    }).join("")
    : '<div class="empty-state">No turnout data yet.</div>';
}

function render() {
  renderWorkspaceControls();
  renderProfileControls();
  const overviewQuery = $("#event-search").value;
  const allEventsQuery = $("#all-event-search").value;
  renderEventList($("#event-list"), overviewQuery, activeFilter, $("#events-empty"));
  renderEventList($("#all-event-list"), allEventsQuery, activeFilter, $("#all-events-empty"));
  $("#filter-label").textContent = filterLabel(activeFilter);
  $("#all-filter-label").textContent = filterLabel(activeFilter);
  renderRegistrations($("#attendee-search").value);
  renderAnalytics();
}

function filterLabel(filter) {
  if (filter === "free") return "Free · 50+ seats";
  if (filter === "tagged") return "Coding & hackathons";
  return "All events";
}

function setPage(page) {
  if (!pageNames[page]) return;
  $$(".page-section").forEach((section) => section.classList.remove("visible"));
  $(`#${page}-page`).classList.add("visible");
  $$(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === page));
  $("#breadcrumb-current").textContent = pageNames[page];
  document.title = `${pageNames[page]} — CampusOS`;
  history.replaceState(null, "", `#${page}`);
}

function setFilter(filter) {
  activeFilter = filter;
  $("#event-filter-menu").classList.add("hidden");
  $("#all-event-filter-menu").classList.add("hidden");
  $("#event-filter-button").setAttribute("aria-expanded", "false");
  $("#all-event-filter-button").setAttribute("aria-expanded", "false");
  render();
}

function field(name, label, options = {}) {
  const { type = "text", required = false, placeholder = "", value = "", choices = [], min = "", max = "", step = "" } = options;
  const requiredAttr = required ? "required" : "";
  const attrs = `name="${escapeHtml(name)}" ${requiredAttr} ${placeholder ? `placeholder="${escapeHtml(placeholder)}"` : ""} ${value ? `value="${escapeHtml(value)}"` : ""} ${min ? `min="${min}"` : ""} ${max ? `max="${max}"` : ""} ${step ? `step="${step}"` : ""}`;
  const input = type === "select"
    ? `<select ${attrs}>${choices.map((choice) => `<option value="${escapeHtml(choice.value)}" ${String(choice.value) === String(value || choices[0]?.value) ? "selected" : ""}>${escapeHtml(choice.label)}</option>`).join("")}</select>`
    : `<input type="${type}" ${attrs} />`;
  return `<div class="form-field"><label>${escapeHtml(label)}</label>${input}</div>`;
}

function showModal({ title, description, kicker = "CAMPUSOS", content, submitLabel, icon = "plus", onSubmit }) {
  const modalIcon = $("#modal-icon");
  modalIcon.innerHTML = icon === "check"
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>'
    : icon === "ticket"
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  $("#modal-title").textContent = title;
  $("#modal-description").textContent = description;
  $("#modal-kicker").textContent = kicker;
  $("#modal-form").innerHTML = `${content}<p class="form-error hidden" id="modal-error"></p><button class="button button-primary form-submit" type="submit">${escapeHtml(submitLabel)}</button>`;
  $("#modal-backdrop").classList.remove("hidden");
  const firstInput = $("#modal-form input, #modal-form select");
  if (firstInput) firstInput.focus();
  $("#modal-form").onsubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    const error = onSubmit(values);
    if (error) {
      const errorElement = $("#modal-error");
      errorElement.textContent = error;
      errorElement.classList.remove("hidden");
    }
  };
}

function closeModal() {
  $("#modal-backdrop").classList.add("hidden");
  $("#modal-form").onsubmit = null;
}

function openCreateEvent() {
  showModal({
    title: "Create an event",
    description: "Add a new event to the campus program.",
    kicker: "EVENT MANAGEMENT",
    submitLabel: "Create event",
    content: `<div class="form-grid">
      ${field("title", "Event title", { required: true, placeholder: "e.g. Design sprint" })}
      ${field("category", "Category", { type: "select", choices: [{ value: "Technical", label: "Technical" }, { value: "Cultural", label: "Cultural" }, { value: "Workshop", label: "Workshop" }] })}
      ${field("organizerClub", "Organizer club", { required: true, placeholder: "e.g. Design Club" })}
      ${field("venue", "Venue", { required: true, placeholder: "e.g. Lab 2" })}
      ${field("date", "Date & time", { type: "datetime-local", required: true })}
      ${field("capacity", "Capacity", { type: "number", required: true, min: "1", value: "100" })}
      ${field("entryFee", "Entry fee (₹)", { type: "number", required: true, min: "0", value: "0" })}
      ${field("tags", "Tags (comma separated)", { placeholder: "design, community" })}
    </div>`,
    onSubmit: (values) => {
      const capacity = Number(values.capacity);
      const entryFee = Number(values.entryFee);
      if (!Number.isInteger(capacity) || capacity < 1) return "Capacity must be a whole number above zero.";
      if (!Number.isFinite(entryFee) || entryFee < 0) return "Entry fee must be zero or more.";
      const sequence = Math.max(100, ...state.events.map((event) => Number(event._id.replace(/\D/g, "")) || 0)) + 1;
      const eventId = `EVT${sequence}`;
      const date = new Date(values.date);
      if (!state.clubs.some((club) => club.name.toLowerCase() === values.organizerClub.trim().toLowerCase())) {
        const clubSequence = Math.max(100, ...state.clubs.map((club) => Number(club._id.replace(/\D/g, "")) || 0)) + 1;
        state.clubs.push({ _id: `CLB${clubSequence}`, name: values.organizerClub.trim(), category: values.category });
      }
      state.events.unshift({
        _id: eventId,
        title: values.title.trim(),
        category: values.category,
        organizerClub: values.organizerClub.trim(),
        venue: values.venue.trim(),
        date: date.toISOString(),
        capacity,
        seatsAvailable: capacity,
        entryFee,
        tags: values.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        coordinators: [],
        sponsors: [],
      });
      persist();
      render();
      closeModal();
      notify(`${values.title.trim()} is now on the event lineup.`);
      return null;
    },
  });
}

function openCreateUniversity() {
  showModal({
    title: "Add a university",
    description: "Create a separate workspace for another university or campus.",
    kicker: "UNIVERSITY WORKSPACES",
    submitLabel: "Create & open workspace",
    content: `<div class="form-grid">
      ${field("universityName", "University name", { required: true, placeholder: "e.g. Lakeside University" })}
      ${field("location", "Campus or city", { placeholder: "e.g. Downtown campus" })}
      ${field("startingData", "Starting data", { type: "select", choices: [{ value: "blank", label: "Start with an empty workspace" }, { value: "sample", label: "Copy the sample events and tickets" }] })}
    </div><p class="form-help">Each university has its own events, registrations, sponsors, and analytics in this browser.</p>`,
    onSubmit: (values) => {
      const name = values.universityName.trim();
      if (!name) return "Enter a university name.";
      if (workspaces.some((workspace) => workspace.name.toLowerCase() === name.toLowerCase())) {
        return "A university with this name already exists in your workspace list.";
      }
      const workspace = {
        id: `university-${Date.now()}-${workspaces.length + 1}`,
        name,
        location: values.location.trim() || "Campus workspace",
        data: values.startingData === "sample"
          ? clone(seedData)
          : { events: [], registrations: [], clubs: [] },
      };
      workspaces.push(workspace);
      activeWorkspaceId = workspace.id;
      state = clone(workspace.data);
      activeFilter = "all";
      persist();
      render();
      closeModal();
      notify(`${name} workspace created and opened.`);
      return null;
    },
  });
}

function openEditProfile() {
  showModal({
    title: "Edit your profile",
    description: "Update the account details shown in your university workspace.",
    kicker: "YOUR ACCOUNT",
    submitLabel: "Save profile",
    content: `<div class="form-grid">
      ${field("profileName", "Full name", { required: true, value: profile.name })}
      ${field("profileEmail", "Email address", { type: "email", required: true, value: profile.email })}
      ${field("profileRole", "Role", { required: true, value: profile.role })}
    </div>`,
    onSubmit: (values) => {
      const name = values.profileName.trim();
      const email = values.profileEmail.trim();
      const role = values.profileRole.trim();
      if (!name || !email || !role) return "Name, email, and role are required.";
      profile = { name, email, role };
      persist();
      renderProfileControls();
      closeModal();
      notify("Your profile has been updated.");
      return null;
    },
  });
}

function openBooking(eventId = null) {
  const availableEvents = state.events.filter((event) => event.seatsAvailable > 0);
  if (availableEvents.length === 0) {
    notify("There are no seats available to book right now.", true);
    return;
  }
  const choices = availableEvents.map((event) => ({ value: event._id, label: `${event.title} · ${event.entryFee ? money(event.entryFee) : "Free"}` }));
  showModal({
    title: "Reserve a campus seat",
    description: "Create a registration and atomically reserve one available seat.",
    kicker: "TICKET BOOKING",
    submitLabel: "Confirm registration",
    icon: "ticket",
    content: `<div class="form-grid">
      ${field("eventId", "Choose event", { type: "select", choices, value: eventId || choices[0].value })}
      ${field("studentName", "Student name", { required: true, placeholder: "Full name" })}
      ${field("studentId", "Student ID", { required: true, placeholder: "e.g. STU1024" })}
      ${field("department", "Department", { type: "select", choices: ["Computer Science", "Electrical Engineering", "Mechanical Engineering", "Business", "Other"].map((item) => ({ value: item, label: item })) })}
      ${field("year", "Year of study", { type: "select", choices: [1, 2, 3, 4].map((year) => ({ value: year, label: `Year ${year}` })) })}
      ${field("method", "Payment method", { type: "select", choices: [{ value: "UPI", label: "UPI" }, { value: "Card", label: "Card" }, { value: "Cash", label: "Cash" }] })}
    </div><p class="form-help">The ticket price follows the selected event. Free events are registered at ₹0.</p>`,
    onSubmit: (values) => {
      const event = eventById(values.eventId);
      if (!event || event.seatsAvailable < 1) return "This event has just sold out. Choose another event.";
      const studentName = values.studentName.trim();
      const studentId = values.studentId.trim();
      if (!studentName || !studentId) return "Enter the student's name and ID.";
      event.seatsAvailable -= 1;
      const nextTicket = Math.max(0, ...state.registrations.map((registration) => Number(registration.ticketId.split("-").pop()) || 0)) + 1;
      const ticketId = `TICK-2026-${String(nextTicket).padStart(3, "0")}`;
      state.registrations.unshift({
        ticketId,
        eventId: event._id,
        studentId,
        studentName,
        department: values.department,
        year: Number(values.year),
        registrationDate: new Date().toISOString(),
        checkInStatus: false,
        paymentDetails: {
          method: event.entryFee === 0 ? "Free" : values.method,
          amountPaid: event.entryFee,
          status: "Completed",
        },
      });
      persist();
      render();
      closeModal();
      notify(`Seat reserved for ${studentName}. Ticket ${ticketId}.`);
      return null;
    },
  });
}

function openCheckIn(ticketId = "") {
  showModal({
    title: "Check in a guest",
    description: "Enter the ticket ID to verify the registration and mark the attendee present.",
    kicker: "DOOR CHECK-IN",
    submitLabel: "Verify & check in",
    icon: "check",
    content: `${field("ticketId", "Ticket ID", { required: true, placeholder: "TICK-2026-001", value: ticketId })}<p class="form-help">Ticket IDs are case-insensitive.</p>`,
    onSubmit: (values) => {
      const registration = ticketById(values.ticketId.trim());
      if (!registration) return `Ticket ${values.ticketId.trim()} was not found.`;
      if (registration.checkInStatus) {
        closeModal();
        notify(`${registration.studentName} is already checked in.`, true);
        return null;
      }
      registration.checkInStatus = true;
      persist();
      render();
      closeModal();
      notify(`${registration.studentName} checked in successfully.`);
      return null;
    },
  });
}

function openSponsor(eventId = null) {
  const choices = state.events.map((event) => ({ value: event._id, label: `${event.title} · ${event._id}` }));
  if (!choices.length) {
    notify("Create an event before adding a sponsor.", true);
    return;
  }
  showModal({
    title: "Add an event sponsor",
    description: "Add a partner to an event's sponsor list. Existing sponsors are never duplicated.",
    kicker: "PARTNER MANAGEMENT",
    submitLabel: "Add sponsor",
    content: `<div class="form-grid">
      ${field("eventId", "Choose event", { type: "select", choices, value: eventId || choices[0].value })}
      ${field("sponsor", "Sponsor name", { required: true, placeholder: "e.g. CloudInc" })}
    </div><p class="form-help">Uses set-style insertion to keep sponsor entries unique.</p>`,
    onSubmit: (values) => {
      const event = eventById(values.eventId);
      const sponsor = values.sponsor.trim();
      if (!event || !sponsor) return "Choose an event and enter a sponsor name.";
      if (event.sponsors.some((name) => name.toLowerCase() === sponsor.toLowerCase())) {
        closeModal();
        notify(`${sponsor} is already on this event's sponsor list.`);
        return null;
      }
      event.sponsors.push(sponsor);
      persist();
      render();
      closeModal();
      notify(`${sponsor} added to ${event.title}.`);
      return null;
    },
  });
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportData() {
  downloadFile("campus_events_export.json", JSON.stringify(state, null, 2), "application/json");
  notify("Campus event data exported as JSON.");
}

function runDiscoveryQueries() {
  const free = state.events.filter((event) => event.entryFee === 0 && event.seatsAvailable > 50);
  const tagged = state.events.filter((event) => event.tags.some((tag) => ["coding", "hackathon"].includes(tag.toLowerCase())));
  const computerScience = state.registrations.filter((registration) => registration.department === "Computer Science");
  $("#discovery-output").innerHTML = `<div class="query-output">Free events (&gt;50 seats): ${free.length} · Tagged events: ${tagged.length} · Computer Science registrations: ${computerScience.length}</div>`;
  notify("Discovery queries completed against the local data.");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) {
    closeWorkspaceMenu();
    closeProfileMenu();
    return;
  }
  if (!event.target.closest(".workspace-area")) closeWorkspaceMenu();
  if (!event.target.closest(".profile-area") && target.id !== "top-profile-button") closeProfileMenu();
  if (target.id === "workspace-switcher") {
    closeProfileMenu();
    const menu = $("#workspace-menu");
    menu.classList.toggle("hidden");
    target.setAttribute("aria-expanded", String(!menu.classList.contains("hidden")));
  } else if (target.id === "profile-button" || target.id === "top-profile-button") {
    closeWorkspaceMenu();
    const menu = $("#profile-menu");
    menu.classList.toggle("hidden");
    const expanded = String(!menu.classList.contains("hidden"));
    $("#profile-button").setAttribute("aria-expanded", expanded);
    $("#top-profile-button").setAttribute("aria-expanded", expanded);
  } else if (target.dataset.switchWorkspace) {
    switchWorkspace(target.dataset.switchWorkspace);
  } else if (target.id === "add-university-button") {
    closeWorkspaceMenu();
    openCreateUniversity();
  } else if (target.id === "edit-profile-button") {
    closeProfileMenu();
    openEditProfile();
  } else if (target.matches("[data-page]")) {
    event.preventDefault();
    setPage(target.dataset.page);
    return;
  }
  if (target.id === "create-event-button" || target.hasAttribute("data-open-create")) {
    openCreateEvent();
  } else if (target.id === "export-button" || target.id === "analytics-export-button") {
    exportData();
  } else if (target.id === "booking-action") {
    openBooking();
  } else if (target.id === "checkin-action" || target.id === "attendee-checkin-button") {
    openCheckIn();
  } else if (target.id === "sponsor-action") {
    openSponsor();
  } else if (target.id === "modal-close") {
    closeModal();
  } else if (target.id === "modal-backdrop" && event.target === target) {
    closeModal();
  } else if (target.id === "chart-mode-button") {
    chartMode = chartMode === "revenue" ? "tickets" : "revenue";
    renderAnalytics();
  } else if (target.id === "event-filter-button" || target.id === "all-event-filter-button") {
    const menu = target.id === "event-filter-button" ? $("#event-filter-menu") : $("#all-event-filter-menu");
    menu.classList.toggle("hidden");
    target.setAttribute("aria-expanded", String(!menu.classList.contains("hidden")));
  } else if (target.dataset.filter) {
    setFilter(target.dataset.filter);
  } else if (target.dataset.book) {
    openBooking(target.dataset.book);
  } else if (target.dataset.sponsor) {
    openSponsor(target.dataset.sponsor);
  } else if (target.dataset.checkin) {
    const registration = ticketById(target.dataset.checkin);
    if (registration && registration.checkInStatus) {
      notify(`${registration.studentName} is already checked in.`, true);
    } else {
      openCheckIn(target.dataset.checkin);
    }
  } else if (target.dataset.runQuery === "discovery") {
    runDiscoveryQueries();
  } else if (target.id === "download-script-button") {
    const link = document.createElement("a");
    link.href = "mongosh.js";
    link.download = "mongosh.js";
    document.body.append(link);
    link.click();
    link.remove();
    notify("MongoDB seed and query script downloaded.");
  } else if (target.id === "reset-data-button") {
    state = clone(seedData);
    persist();
    render();
    notify("Sample data restored.");
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "event-search") renderEventList($("#event-list"), event.target.value, activeFilter, $("#events-empty"));
  if (event.target.id === "all-event-search") renderEventList($("#all-event-list"), event.target.value, activeFilter, $("#all-events-empty"));
  if (event.target.id === "attendee-search") renderRegistrations(event.target.value);
});

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const overviewVisible = $("#overview-page").classList.contains("visible");
    const search = overviewVisible ? $("#event-search") : $("#all-event-search");
    if (!overviewVisible && !$("#events-page").classList.contains("visible")) setPage("events");
    window.setTimeout(() => search.focus(), 0);
  }
  if (event.key === "Escape") {
    if (!$("#modal-backdrop").classList.contains("hidden")) closeModal();
    closeWorkspaceMenu();
    closeProfileMenu();
  }
});

$("#modal-backdrop").addEventListener("click", (event) => {
  if (event.target === $("#modal-backdrop")) closeModal();
});

render();
const initialPage = window.location.hash.slice(1);
if (pageNames[initialPage]) setPage(initialPage);
if (savedDataError) notify("Saved data was unreadable; sample data has been restored.", true);
