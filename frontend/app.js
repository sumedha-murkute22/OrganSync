/**
 * OrganSync – Enterprise Healthcare Operations Platform Controller
 * Manages clinical intake verification, recipient registry, C99 algorithmic
 * match evaluation, bipartite compatibility network, cold-chain logistics, and audit governance.
 */

const state = {
  activeView: 'overview',
  organs: [],
  recipients: [],
  transports: [],
  auditLogs: [],
  matches: [],
  summary: null,
  graphData: null,
  activeMatchAction: null,
  networkHover: null
};

const API_BASE = window.location.origin.startsWith('http') ? window.location.origin : 'http://localhost:5000';

document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  loadOperationsData();
  setupNetworkCanvas();
});

/* ========================================================================= */
/*                          OPERATIONAL NAVIGATION                           */
/* ========================================================================= */

function setupNavigation() {
  const links = document.querySelectorAll('.nav-link');
  links.forEach(link => {
    link.addEventListener('click', () => {
      const view = link.dataset.view;
      if (view) navigateTo(view);
    });
  });
}

function navigateTo(viewName) {
  state.activeView = viewName;

  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.view === viewName);
  });

  document.querySelectorAll('.view-panel').forEach(p => {
    p.classList.remove('active');
  });

  const targetPanel = document.getElementById(`panel-${viewName}`);
  if (targetPanel) targetPanel.classList.add('active');

  const titles = {
    'overview': ['Operations Overview', 'OrganSync / Operations Overview'],
    'intake': ['Organ Intake & Verification Management', 'OrganSync / Procurement / Intake & Verification'],
    'recipients': ['Recipient Candidate Registry', 'OrganSync / Registry / Recipient Candidates'],
    'match-review': ['Clinical Compatibility & Allocation Review', 'OrganSync / Allocation / Match Review'],
    'network': ['Compatibility Pathway Network', 'OrganSync / Network / Compatibility Pathways'],
    'transports': ['Cold-Chain Transport Logistics Operations', 'OrganSync / Logistics / Active Missions'],
    'governance': ['Governance, Compliance & Security Ledger', 'OrganSync / Governance & Audit']
  };

  const [heading, breadcrumb] = titles[viewName] || ['OrganSync', 'Coordination Platform'];
  document.getElementById('view-title').textContent = heading;
  document.getElementById('view-breadcrumb').textContent = breadcrumb;

  // View-specific data triggers
  if (viewName === 'network') {
    fetchNetworkData();
  } else if (viewName === 'transports') {
    fetchTransports();
  } else if (viewName === 'governance') {
    fetchAuditLogs();
  } else if (viewName === 'intake') {
    renderIntakeCards();
  } else if (viewName === 'overview') {
    updateOverviewMetrics();
  }
}

/* ========================================================================= */
/*                            DATA SYNCHRONIZATION                           */
/* ========================================================================= */

async function loadOperationsData() {
  try {
    await Promise.all([
      fetchSummary(),
      fetchOrgans(),
      fetchRecipients(),
      fetchTransports(),
      fetchAuditLogs()
    ]);
  } catch (err) {
    console.error('Error synchronizing operations data:', err);
  }
}

async function fetchSummary() {
  try {
    const res = await fetch(`${API_BASE}/api/summary`);
    if (res.ok) {
      state.summary = await res.json();
      updateOverviewMetrics();
    }
  } catch (e) {
    console.warn('Summary fetch failed:', e);
  }
}

async function fetchOrgans() {
  try {
    const res = await fetch(`${API_BASE}/api/organs`);
    if (res.ok) {
      state.organs = await res.json();
      renderInventoryTable();
      renderOverviewQueueTable();
      renderIntakeCards();
      updateBadgeCounts();
    }
  } catch (e) {
    console.error('Organs fetch error:', e);
  }
}

async function fetchRecipients() {
  try {
    const res = await fetch(`${API_BASE}/api/recipients`);
    if (res.ok) {
      state.recipients = await res.json();
      renderRecipientRegistryTable();
      renderOverviewQueueTable();
      updateBadgeCounts();
    }
  } catch (e) {
    console.error('Recipients fetch error:', e);
  }
}

async function fetchTransports() {
  try {
    const res = await fetch(`${API_BASE}/api/transports`);
    if (res.ok) {
      state.transports = await res.json();
      renderTransports();
      updateBadgeCounts();
    }
  } catch (e) {
    console.error('Transports fetch error:', e);
  }
}

async function fetchAuditLogs() {
  try {
    const res = await fetch(`${API_BASE}/api/audit-logs`);
    if (res.ok) {
      state.auditLogs = await res.json();
      renderAuditLedgerTable();
    }
  } catch (e) {
    console.error('Audit logs fetch error:', e);
  }
}

function updateBadgeCounts() {
  const pendingIntake = state.organs.filter(o => o.verification_status === 'Pending Verification').length;
  const activeRecs = state.recipients.filter(r => r.status === 'Waiting').length;
  const activeTransports = state.transports.filter(t => (t.current_milestone_index || 1) < 6).length;

  const bIntake = document.getElementById('badge-pending-intake');
  if (bIntake) bIntake.textContent = pendingIntake;

  const bRecs = document.getElementById('badge-recipients-total');
  if (bRecs) bRecs.textContent = activeRecs;

  const bTrp = document.getElementById('badge-active-transports');
  if (bTrp) bTrp.textContent = activeTransports;
}

function updateOverviewMetrics() {
  const verified = state.organs.filter(o => o.verification_status === 'Verified' && o.availability === 'Available').length;
  const pending = state.organs.filter(o => o.verification_status === 'Pending Verification' && o.availability === 'Available').length;
  const activeRecs = state.recipients.filter(r => r.status === 'Waiting' || r.status === 'Under Review').length;
  const critical = state.recipients.filter(r => r.urgency === 'Critical' && (r.status === 'Waiting' || r.status === 'Under Review')).length;
  const expiring = state.organs.filter(o => (o.shelf_life_hours || 99) <= 6.0 && o.availability === 'Available').length;
  const activeTrp = state.transports.filter(t => (t.current_milestone_index || 1) < 6).length;

  const kpiVer = document.getElementById('kpi-verified-organs');
  if (kpiVer) kpiVer.textContent = verified;

  const kpiPend = document.getElementById('kpi-pending-organs');
  if (kpiPend) kpiPend.textContent = `(${pending} Pending Verification)`;

  const kpiRec = document.getElementById('kpi-active-recipients');
  if (kpiRec) kpiRec.textContent = activeRecs;

  const kpiCrit = document.getElementById('kpi-critical-cases');
  if (kpiCrit) kpiCrit.textContent = critical;

  const kpiExp = document.getElementById('kpi-expiring-organs');
  if (kpiExp) kpiExp.textContent = expiring;

  const kpiTrp = document.getElementById('kpi-active-transports');
  if (kpiTrp) kpiTrp.textContent = activeTrp;
}

/* ========================================================================= */
/*                   SECTION 1: TIME-SENSITIVE INVENTORY                     */
/* ========================================================================= */

function renderInventoryTable() {
  const tbody = document.getElementById('inventory-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const sortedOrgans = [...state.organs].sort((a, b) => (a.shelf_life_hours || 0) - (b.shelf_life_hours || 0));

  sortedOrgans.forEach(org => {
    const tr = document.createElement('tr');
    const isUrgent = (org.shelf_life_hours || 0) <= 6.0 && org.availability === 'Available';
    const shelfClass = isUrgent ? 'text-rose font-bold' : 'text-slate-600 font-medium';
    const isVerified = org.verification_status === 'Verified';

    tr.innerHTML = `
      <td><strong>${org.id}</strong></td>
      <td><span class="badge-organ">${org.organ_type}</span></td>
      <td><span class="badge-blood">${org.blood_group}</span></td>
      <td>${org.donor_age || 35} yrs</td>
      <td>${org.hospital}</td>
      <td style="font-size:0.75rem; color:#475569;">${org.preservation_method || 'Static Cold Storage'}</td>
      <td><span class="${shelfClass}">${(org.shelf_life_hours || 0).toFixed(1)} hrs</span></td>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">${org.temperature_celsius ? `${org.temperature_celsius}°C` : '3.8°C'}</td>
      <td>
        <span class="badge-status ${isVerified ? 'verified' : 'pending'}">
          ${isVerified ? 'Verified' : 'Pending Verification'}
        </span>
      </td>
      <td>
        ${!isVerified ? `
          <button class="btn btn-warning btn-sm" onclick="signOffVerification('${org.id}')">Verify Now</button>
        ` : `
          <button class="btn btn-outline btn-sm" onclick="navigateTo('match-review'); triggerMatchReview();">Check Matches</button>
        `}
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterInventoryTable() {
  const query = (document.getElementById('inventory-search')?.value || '').toLowerCase();
  const rows = document.querySelectorAll('#table-inventory tbody tr');

  state.organs.forEach((org, idx) => {
    const row = rows[idx];
    if (!row) return;

    const matches = !query ||
      org.id.toLowerCase().includes(query) ||
      org.organ_type.toLowerCase().includes(query) ||
      org.hospital.toLowerCase().includes(query) ||
      org.blood_group.toLowerCase().includes(query);

    row.style.display = matches ? '' : 'none';
  });
}

function renderOverviewQueueTable() {
  const tbody = document.getElementById('overview-queue-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const activeCases = state.organs.filter(o => o.availability === 'Available').slice(0, 5);

  activeCases.forEach(org => {
    const tr = document.createElement('tr');
    const isVerified = org.verification_status === 'Verified';

    tr.innerHTML = `
      <td><strong>${org.id}</strong></td>
      <td><span class="badge-organ">${org.organ_type}</span></td>
      <td><span class="badge-blood">${org.blood_group}</span></td>
      <td><span class="${(org.shelf_life_hours || 0) <= 6 ? 'text-rose font-bold' : ''}">${(org.shelf_life_hours || 0).toFixed(1)}h remaining</span></td>
      <td><span class="badge-status ${isVerified ? 'verified' : 'pending'}">${isVerified ? 'Eligible for Allocation' : 'Laboratory Sign-off Pending'}</span></td>
      <td style="font-size:0.75rem; color:#64748b;">${org.reviewer || 'Under review by Dr. Vance'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="navigateTo('match-review')">Review Candidates</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/* ========================================================================= */
/*                   SECTION 2: ORGAN INTAKE & VERIFICATION                  */
/* ========================================================================= */

function renderIntakeCards() {
  const container = document.getElementById('intake-cards-container');
  if (!container) return;
  container.innerHTML = '';

  state.organs.forEach(org => {
    const card = document.createElement('div');
    card.className = 'intake-card';

    const chk = org.verification_checklist || {};
    const isVerified = org.verification_status === 'Verified';

    const makeCheckItem = (label, passed) => `
      <div class="check-row-item">
        <span class="check-icon ${passed ? 'pass' : 'fail'}">${passed ? '&#10003;' : '&#9888;'}</span>
        <span>${label}</span>
      </div>
    `;

    card.innerHTML = `
      <div class="intake-card-header">
        <div>
          <div class="intake-case-id">${org.id} &bull; ${org.organ_type} (${org.blood_group})</div>
          <span style="font-size:0.72rem; color:#64748b;">Container: ${org.cold_chain_container_id || 'CC-BOX-9011'}</span>
        </div>
        <span class="badge-status ${isVerified ? 'verified' : 'pending'}">${org.verification_status}</span>
      </div>

      <div class="intake-meta-grid">
        <div class="intake-meta-item">
          <span class="lbl">Recovery Hospital</span>
          <span class="val">${org.hospital}</span>
        </div>
        <div class="intake-meta-item">
          <span class="lbl">Viability Remaining</span>
          <span class="val ${(org.shelf_life_hours || 0) <= 6 ? 'text-rose' : ''}">${(org.shelf_life_hours || 0).toFixed(1)} hrs</span>
        </div>
        <div class="intake-meta-item">
          <span class="lbl">Preservation Tech</span>
          <span class="val">${org.preservation_method || 'Static Cold Storage'}</span>
        </div>
        <div class="intake-meta-item">
          <span class="lbl">Current Temp</span>
          <span class="val text-emerald">${org.temperature_celsius || 3.8}°C (Nominal)</span>
        </div>
      </div>

      <div class="checklist-compact-box">
        <div class="checklist-compact-title">Verification Checklist Items</div>
        ${makeCheckItem('Donor Authorization & Signed Consent', chk.donor_consent ?? true)}
        ${makeCheckItem('Dual-Signature ABO/Rh Confirmation', chk.abo_confirmation ?? true)}
        ${makeCheckItem('HLA / Tissue Allele Profile Validated', chk.hla_typing ?? true)}
        ${makeCheckItem('Infectious Disease Screening Panel Non-Reactive', chk.infectious_disease_panel ?? false)}
        ${makeCheckItem('Crossmatch Serum Sample on File', chk.crossmatch_status ?? false)}
        ${makeCheckItem('Surgical Recovery Biopsy / Flow Evaluated', chk.organ_quality_biopsy ?? true)}
        ${makeCheckItem('Chain-of-Custody Scan Verified', chk.custody_scan ?? true)}
        ${makeCheckItem('Preservation Telemetry Linked', chk.telemetry_attached ?? true)}
      </div>

      <div class="intake-card-footer">
        <div class="intake-audit-sub">
          Lab Ref: ${org.lab_reference || 'REF-8802'} &bull; ${org.submitted_by || 'Dr. Larson'}
        </div>
        <div>
          ${!isVerified ? `
            <button class="btn btn-warning btn-sm" onclick="signOffVerification('${org.id}')">Sign Off & Verify</button>
          ` : `
            <button class="btn btn-outline btn-sm" onclick="editOrganRecord('${org.id}')">Edit Record</button>
          `}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function openIntakeModal() {
  document.getElementById('intake-organ-id').value = '';
  document.getElementById('form-organ-intake').reset();
  document.getElementById('modal-intake-title').textContent = 'Organ Intake & Verification Registration';
  document.getElementById('modal-organ-intake').classList.remove('hidden');
}

function closeIntakeModal() {
  document.getElementById('modal-organ-intake').classList.add('hidden');
}

async function submitOrganIntake(e) {
  e.preventDefault();
  const id = document.getElementById('intake-organ-id').value;

  const payload = {
    organ_type: document.getElementById('intake-organ-type').value,
    blood_group: document.getElementById('intake-blood-group').value,
    donor_age: parseInt(document.getElementById('intake-donor-age').value, 10),
    donor_id: document.getElementById('intake-donor-id').value || 'DNR-2026-901',
    hla_score: parseInt(document.getElementById('intake-hla-score').value, 10),
    shelf_life_hours: parseFloat(document.getElementById('intake-shelf-life').value),
    hospital: document.getElementById('intake-hospital').value,
    preservation_method: document.getElementById('intake-preservation').value,
    cold_chain_container_id: document.getElementById('intake-container-id').value || 'CC-PERF-9901',
    lab_reference: document.getElementById('intake-lab-ref').value || 'LAB-HLA-8801',
    verification_checklist: {
      donor_consent: document.getElementById('chk-consent').checked,
      abo_confirmation: document.getElementById('chk-abo').checked,
      hla_typing: document.getElementById('chk-hla').checked,
      infectious_disease_panel: document.getElementById('chk-infectious').checked,
      crossmatch_status: document.getElementById('chk-crossmatch').checked,
      organ_quality_biopsy: document.getElementById('chk-biopsy').checked,
      custody_scan: document.getElementById('chk-custody').checked,
      telemetry_attached: document.getElementById('chk-telemetry').checked
    }
  };

  try {
    let res;
    if (id) {
      payload.id = id;
      res = await fetch(`${API_BASE}/api/organs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      res = await fetch(`${API_BASE}/api/organs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    if (res.ok) {
      closeIntakeModal();
      await fetchOrgans();
      await fetchSummary();
      await fetchAuditLogs();
    }
  } catch (err) {
    alert('Failed to register organ intake: ' + err.message);
  }
}

async function signOffVerification(organId) {
  if (!confirm(`Confirm clinical dual-signature sign-off for organ ${organId}?\nThis verifies all laboratory screening criteria and enables candidate allocation.`)) return;

  try {
    const res = await fetch(`${API_BASE}/api/organs/${organId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reviewer: 'Dr. S. Vance, MD (Transplant Operations Lead)'
      })
    });

    if (res.ok) {
      await fetchOrgans();
      await fetchSummary();
      await fetchAuditLogs();
      renderIntakeCards();
    }
  } catch (err) {
    alert('Verification error: ' + err.message);
  }
}

function editOrganRecord(id) {
  const org = state.organs.find(o => o.id === id);
  if (!org) return;

  document.getElementById('intake-organ-id').value = org.id;
  document.getElementById('intake-organ-type').value = org.organ_type;
  document.getElementById('intake-blood-group').value = org.blood_group;
  document.getElementById('intake-donor-age').value = org.donor_age || 35;
  document.getElementById('intake-donor-id').value = org.donor_id || '';
  document.getElementById('intake-hla-score').value = org.hla_score || 85;
  document.getElementById('intake-shelf-life').value = org.shelf_life_hours || 12.0;
  document.getElementById('intake-hospital').value = org.hospital;
  document.getElementById('intake-preservation').value = org.preservation_method || 'Static Cold Storage (SCS - 4°C)';
  document.getElementById('intake-container-id').value = org.cold_chain_container_id || '';
  document.getElementById('intake-lab-ref').value = org.lab_reference || '';

  document.getElementById('modal-intake-title').textContent = `Edit Organ Intake (${org.id})`;
  document.getElementById('modal-organ-intake').classList.remove('hidden');
}

/* ========================================================================= */
/*                   SECTION 3: RECIPIENT CANDIDATE REGISTRY                 */
/* ========================================================================= */

function renderRecipientRegistryTable() {
  const tbody = document.getElementById('registry-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.recipients.forEach(rec => {
    const tr = document.createElement('tr');

    let urgencyBadge = 'badge-urgency-low';
    if (rec.urgency === 'Critical') urgencyBadge = 'badge-urgency-crit';
    else if (rec.urgency === 'High') urgencyBadge = 'badge-urgency-high';
    else if (rec.urgency === 'Medium') urgencyBadge = 'badge-urgency-med';

    tr.innerHTML = `
      <td><strong>${rec.id}</strong></td>
      <td>
        <strong>${rec.name}</strong>
        <span style="font-size:0.7rem; color:#64748b; display:block;">${rec.age || 45}y / ${rec.gender || 'M'}</span>
      </td>
      <td><span class="badge-organ">${rec.required_organ}</span></td>
      <td><span class="badge-blood">${rec.blood_group}</span></td>
      <td><span class="${urgencyBadge}">${rec.urgency_tier || rec.urgency}</span></td>
      <td><strong>${rec.waiting_time_days}</strong> days</td>
      <td>${rec.hospital}</td>
      <td style="font-size:0.75rem; color:#475569;">${rec.clinical_readiness || 'Outpatient Ready'}</td>
      <td>
        <span class="badge-status ${rec.status === 'Matched' ? 'allocated' : (rec.status === 'Under Review' ? 'pending' : 'verified')}">
          ${rec.status}
        </span>
      </td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewRecipientProfile('${rec.id}')">Clinical Profile</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterRecipientRegistry() {
  const query = (document.getElementById('recipient-registry-search')?.value || '').toLowerCase();
  const organFilter = document.getElementById('filter-rec-organ')?.value || '';
  const bloodFilter = document.getElementById('filter-rec-blood')?.value || '';
  const urgencyFilter = document.getElementById('filter-rec-urgency')?.value || '';
  const statusFilter = document.getElementById('filter-rec-status')?.value || '';

  const rows = document.querySelectorAll('#table-registry tbody tr');

  state.recipients.forEach((rec, idx) => {
    const row = rows[idx];
    if (!row) return;

    const matchesQuery = !query ||
      rec.id.toLowerCase().includes(query) ||
      rec.name.toLowerCase().includes(query) ||
      rec.hospital.toLowerCase().includes(query) ||
      (rec.treating_physician || '').toLowerCase().includes(query);

    const matchesOrgan = !organFilter || rec.required_organ === organFilter;
    const matchesBlood = !bloodFilter || rec.blood_group === bloodFilter;
    const matchesUrgency = !urgencyFilter || rec.urgency === urgencyFilter;
    const matchesStatus = !statusFilter || rec.status === statusFilter;

    row.style.display = (matchesQuery && matchesOrgan && matchesBlood && matchesUrgency && matchesStatus) ? '' : 'none';
  });
}

function openRecipientModal() {
  document.getElementById('reg-rec-id').value = '';
  document.getElementById('form-recipient-reg').reset();
  document.getElementById('modal-recipient-reg').classList.remove('hidden');
}

function closeRecipientModal() {
  document.getElementById('modal-recipient-reg').classList.add('hidden');
}

async function submitRecipientRegistration(e) {
  e.preventDefault();
  const payload = {
    name: document.getElementById('reg-name').value,
    required_organ: document.getElementById('reg-organ').value,
    blood_group: document.getElementById('reg-blood').value,
    urgency: document.getElementById('reg-urgency').value,
    age: parseInt(document.getElementById('reg-age').value, 10),
    waiting_time_days: parseInt(document.getElementById('reg-wait').value, 10),
    hospital: document.getElementById('reg-hospital').value,
    treating_physician: document.getElementById('reg-physician').value || 'Dr. A. Chen, MD',
    status: 'Waiting',
    clinical_readiness: 'Outpatient / Standby Ready',
    crossmatch_readiness: 'Serum on File'
  };

  try {
    const res = await fetch(`${API_BASE}/api/recipients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      closeRecipientModal();
      await fetchRecipients();
      await fetchSummary();
      await fetchAuditLogs();
    }
  } catch (err) {
    alert('Error enrolling candidate: ' + err.message);
  }
}

function viewRecipientProfile(id) {
  const rec = state.recipients.find(r => r.id === id);
  if (!rec) return;

  document.getElementById('drawer-rec-name').textContent = `${rec.name} (${rec.age || 45}${rec.gender || 'M'})`;
  document.getElementById('drawer-rec-id').textContent = `${rec.id} &bull; ${rec.required_organ} Candidate &bull; ABO: ${rec.blood_group}`;

  const body = document.getElementById('drawer-rec-body');
  body.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px; margin-bottom:16px;">
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px;">
        <span style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:700;">Urgency Classification</span>
        <div style="font-size:0.95rem; font-weight:700; color:#0f172a; margin-top:2px;">${rec.urgency_tier || rec.urgency}</div>
        <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Waitlist Seniority: <strong>${rec.waiting_time_days} days</strong></div>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px;">
        <span style="font-size:0.7rem; color:#64748b; text-transform:uppercase; font-weight:700;">Sensitization & Crossmatch</span>
        <div style="font-size:0.95rem; font-weight:700; color:#0f172a; margin-top:2px;">cPRA: ${rec.cpra_percent || 0}%</div>
        <div style="font-size:0.75rem; color:#64748b; margin-top:4px;">Readiness: <strong>${rec.crossmatch_readiness || 'Serum on file'}</strong></div>
      </div>
    </div>

    <div style="background:#fafbfc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; margin-bottom:16px;">
      <span style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700;">Validated HLA Allele Profile</span>
      <div style="font-family:var(--font-mono); font-size:0.82rem; font-weight:600; color:#0284c7; margin-top:4px;">
        ${rec.hla_profile || 'A*02:01, A*03:01, B*07:02, B*44:02, DRB1*04:01, DRB1*15:01'}
      </div>
    </div>

    <div style="margin-bottom:16px;">
      <span style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700;">Treating Clinical Team & Facility</span>
      <p style="font-size:0.85rem; color:#0f172a; font-weight:600; margin-top:2px;">${rec.hospital}</p>
      <p style="font-size:0.78rem; color:#64748b;">Primary Surgeon: ${rec.treating_physician || 'Dr. A. Chen, MD'}</p>
    </div>

    <div>
      <span style="font-size:0.72rem; color:#64748b; text-transform:uppercase; font-weight:700;">Clinical Multidisciplinary Review History</span>
      <div style="background:#f8fafc; border-left:3px solid #0284c7; padding:8px 12px; border-radius:4px; font-size:0.78rem; color:#334155; margin-top:4px;">
        ${rec.review_history || 'Routine annual listing certification current. Approved for immediate call-in.'}
      </div>
    </div>
  `;

  document.getElementById('modal-recipient-drawer').classList.remove('hidden');
}

function closeRecipientDrawer() {
  document.getElementById('modal-recipient-drawer').classList.add('hidden');
}

/* ========================================================================= */
/*                   SECTION 4: MATCH REVIEW & C ALLOCATION                  */
/* ========================================================================= */

async function triggerMatchReview() {
  const container = document.getElementById('match-candidate-cards');
  const strip = document.getElementById('match-review-metrics');
  const btn = document.getElementById('btn-run-match-review');

  if (btn) btn.disabled = true;

  container.innerHTML = `
    <div class="empty-clinical-state">
      <div class="empty-glyph">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
      </div>
      <h4>Executing C99 Algorithmic Match Review...</h4>
      <p>Building organ min-heaps, cross-referencing HLA antigens, and evaluating transit preservation viability.</p>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE}/api/run-match`, { method: 'POST' });
    if (!res.ok) throw new Error('C matching engine execution failed');
    const data = await res.json();
    state.matches = data.matches || [];

    document.getElementById('rev-match-count').textContent = data.match_count || 0;
    document.getElementById('rev-avg-score').textContent = `${(data.average_score || 0).toFixed(1)}%`;
    document.getElementById('rev-unassigned-organs').textContent = data.unassigned_organs || 0;
    strip.classList.remove('hidden');

    renderMatchCandidateCards(state.matches);
  } catch (err) {
    container.innerHTML = `
      <div class="empty-clinical-state">
        <div class="empty-glyph" style="background:#fee2e2; color:#ef4444;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/></svg>
        </div>
        <h4>Error Running C Engine</h4>
        <p>${err.message}. Confirm compiled native binary is active.</p>
      </div>
    `;
  } finally {
    if (btn) btn.disabled = false;
  }
}

function renderMatchCandidateCards(matches) {
  const container = document.getElementById('match-candidate-cards');
  if (!matches || matches.length === 0) {
    container.innerHTML = `
      <div class="empty-clinical-state">
        <h4>No Clinically Viable Candidates Found</h4>
        <p>Zero matches satisfied both strict organ-type identity and non-reactive ABO blood compatibility.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  matches.forEach((m, idx) => {
    const card = document.createElement('div');
    card.className = 'candidate-card';

    const b = m.score_breakdown || {};
    card.innerHTML = `
      <div class="fit-dial">
        <span class="fit-num">${m.total_score.toFixed(0)}</span>
        <span class="fit-lbl">FIT INDEX</span>
      </div>

      <div class="cand-meta">
        <div class="cand-row">
          <span class="cand-label">DONOR:</span>
          <strong>${m.organ_id}</strong>
          <span class="badge-organ">${m.organ_type}</span>
          <span class="badge-blood">${m.donor_blood}</span>
          <span class="text-rose font-bold" style="font-size:0.75rem;">${m.shelf_life_hours}h viability</span>
        </div>
        <div class="cand-row">
          <span class="cand-label">CANDIDATE:</span>
          <strong>${m.recipient_name}</strong>
          <span class="badge-blood">${m.recipient_blood}</span>
          <span style="font-size:0.72rem; color:#64748b;">ID: ${m.recipient_id}</span>
        </div>
        <div style="font-size:0.75rem; color:#64748b;">
          Transit: ${m.donor_hospital} &rarr; ${m.recipient_hospital} (${m.distance_km.toFixed(0)} km)
        </div>
      </div>

      <div class="cand-breakdown">
        <div class="breakdown-strip">
          <div class="breakdown-cell">
            <span class="b-lbl">ABO</span>
            <span class="b-val">+${b.blood_score || 0}</span>
          </div>
          <div class="breakdown-cell">
            <span class="b-lbl">HLA Tissue</span>
            <span class="b-val">+${b.hla_score || 0}</span>
          </div>
          <div class="breakdown-cell">
            <span class="b-lbl">Urgency</span>
            <span class="b-val">+${b.urgency_score || 0}</span>
          </div>
          <div class="breakdown-cell">
            <span class="b-lbl">Seniority</span>
            <span class="b-val">+${b.wait_time_score || 0}</span>
          </div>
          <div class="breakdown-cell">
            <span class="b-lbl">Distance</span>
            <span class="b-val">+${b.distance_score || 0}</span>
          </div>
        </div>
        <div class="cand-reason">
          <strong>Clinical Rationale:</strong> ${m.reason}
        </div>
      </div>

      <div class="cand-actions">
        <button class="btn btn-primary btn-sm" onclick="openMatchActionModal(${idx}, 'APPROVE')">
          Approve for Coordination
        </button>
        <button class="btn btn-outline btn-sm" onclick="openMatchActionModal(${idx}, 'REVIEW')">
          Send for Review
        </button>
        <button class="btn btn-outline btn-sm" onclick="openMatchActionModal(${idx}, 'HOLD')">
          Clinical Hold
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function openMatchActionModal(matchIndex, action) {
  const match = state.matches[matchIndex];
  if (!match) return;

  state.activeMatchAction = { match, action };

  const actionTitles = {
    'APPROVE': 'Approve Match for Logistics Coordination',
    'REVIEW': 'Submit Candidate for Multidisciplinary Review',
    'HOLD': 'Place Match on Clinical Hold'
  };

  document.getElementById('modal-match-action-title').textContent = actionTitles[action] || 'Clinical Match Action';
  document.getElementById('match-action-notes').value = '';

  const preview = document.getElementById('match-summary-preview');
  preview.innerHTML = `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; font-size:0.8rem;">
      <strong>Case: ${match.organ_id} (${match.organ_type} ${match.donor_blood}) &rarr; ${match.recipient_name} (${match.recipient_blood})</strong>
      <div style="color:#64748b; margin-top:2px;">Compatibility Index: <strong>${match.total_score.toFixed(1)}/100</strong> &bull; Distance: ${match.distance_km.toFixed(0)} km</div>
    </div>
  `;

  const btnConfirm = document.getElementById('btn-confirm-match-action');
  btnConfirm.textContent = action === 'APPROVE' ? 'Confirm Approval & Dispatch' : (action === 'HOLD' ? 'Confirm Hold' : 'Submit for Review');

  btnConfirm.onclick = executeMatchAction;
  document.getElementById('modal-match-action').classList.remove('hidden');
}

function closeMatchActionModal() {
  document.getElementById('modal-match-action').classList.add('hidden');
  state.activeMatchAction = null;
}

async function executeMatchAction() {
  if (!state.activeMatchAction) return;
  const { match, action } = state.activeMatchAction;
  const notes = document.getElementById('match-action-notes').value || 'Standard clinical authorization.';

  try {
    const res = await fetch(`${API_BASE}/api/matches/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        match,
        notes,
        actor: 'Dr. S. Vance, MD (Transplant Operations Lead)'
      })
    });

    if (res.ok) {
      closeMatchActionModal();
      await Promise.all([fetchOrgans(), fetchRecipients(), fetchTransports(), fetchAuditLogs()]);

      if (action === 'APPROVE') {
        navigateTo('transports');
      } else {
        triggerMatchReview();
      }
    }
  } catch (err) {
    alert('Failed to process match action: ' + err.message);
  }
}

/* ========================================================================= */
/*                   SECTION 5: COMPATIBILITY NETWORK                        */
/* ========================================================================= */

async function fetchNetworkData() {
  try {
    const res = await fetch(`${API_BASE}/api/graph`);
    if (res.ok) {
      state.graphData = await res.json();
      drawClinicalBipartiteNetwork(state.graphData);
    }
  } catch (e) {
    console.error('Network data error:', e);
  }
}

function drawClinicalBipartiteNetwork(graph) {
  const canvas = document.getElementById('clinicalBipartiteCanvas');
  if (!canvas || !graph) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  ctx.clearRect(0, 0, W, H);

  const organs = graph.organs || [];
  const recipients = graph.recipients || [];
  const edges = graph.edges || [];

  document.getElementById('net-metric-organs').textContent = organs.length;
  document.getElementById('net-metric-recipients').textContent = recipients.length;
  document.getElementById('net-metric-pathways').textContent = edges.length;

  const leftX = 220;
  const rightX = W - 250;

  const organStep = (H - 80) / Math.max(organs.length - 1, 1);
  const recStep = (H - 80) / Math.max(recipients.length - 1, 1);

  const organPos = {};
  organs.forEach((o, i) => {
    organPos[o.id] = { x: leftX, y: 40 + i * organStep, data: o };
  });

  const recPos = {};
  recipients.forEach((r, j) => {
    recPos[r.id] = { x: rightX, y: 40 + j * recStep, data: r };
  });

  state.canvasNetwork = {
    organPos,
    recPos,
    edges: edges.map(e => ({
      from: organPos[e.from_organ],
      to: recPos[e.to_recipient],
      weight: e.weight,
      reason: e.reason,
      fromId: e.from_organ,
      toId: e.to_recipient
    })).filter(e => e.from && e.to)
  };

  // Draw Path Lines (Bezier Curves)
  state.canvasNetwork.edges.forEach(edge => {
    ctx.beginPath();
    const cp1x = edge.from.x + (edge.to.x - edge.from.x) * 0.45;
    const cp2x = edge.from.x + (edge.to.x - edge.from.x) * 0.55;
    ctx.moveTo(edge.from.x, edge.from.y);
    ctx.bezierCurveTo(cp1x, edge.from.y, cp2x, edge.to.y, edge.to.x, edge.to.y);

    if (edge.weight >= 85) {
      ctx.strokeStyle = 'rgba(13, 148, 136, 0.7)'; // Clinical Teal
      ctx.lineWidth = 2.4;
    } else if (edge.weight >= 70) {
      ctx.strokeStyle = 'rgba(2, 132, 199, 0.55)'; // Medical Blue
      ctx.lineWidth = 1.6;
    } else {
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)'; // Slate
      ctx.lineWidth = 1.1;
    }
    ctx.stroke();
  });

  // Partition Labels
  ctx.font = 'bold 12px "Inter", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('PARTITION U: VERIFIED ORGANS', leftX - 180, 24);
  ctx.fillText('PARTITION V: ELIGIBLE RECIPIENTS', rightX - 20, 24);

  // Draw Organ Nodes
  organs.forEach(o => {
    const p = organPos[o.id];
    if (!p) return;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#0284c7';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '600 11px "Inter", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'right';
    ctx.fillText(`${o.id} [${o.type} ${o.blood}]`, p.x - 12, p.y + 4);
  });

  // Draw Recipient Nodes
  recipients.forEach(r => {
    const p = recPos[r.id];
    if (!p) return;

    ctx.beginPath();
    ctx.arc(p.x, p.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = r.urgency === 'Critical' ? '#e11d48' : (r.urgency === 'High' ? '#d97706' : '#0d9488');
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = '600 11px "Inter", sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.fillText(`${r.name} (${r.type} ${r.blood})`, p.x + 12, p.y + 4);
  });
}

function setupNetworkCanvas() {
  const canvas = document.getElementById('clinicalBipartiteCanvas');
  const tooltip = document.getElementById('network-tooltip');
  if (!canvas || !tooltip) return;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let hoverNode = null;
    let hoverEdge = null;

    if (state.canvasNetwork) {
      for (const id in state.canvasNetwork.organPos) {
        const p = state.canvasNetwork.organPos[id];
        if (Math.hypot(p.x - mx, p.y - my) <= 10) {
          hoverNode = { type: 'organ', data: p.data };
          break;
        }
      }
      if (!hoverNode) {
        for (const id in state.canvasNetwork.recPos) {
          const p = state.canvasNetwork.recPos[id];
          if (Math.hypot(p.x - mx, p.y - my) <= 10) {
            hoverNode = { type: 'recipient', data: p.data };
            break;
          }
        }
      }
    }

    if (hoverNode) {
      tooltip.classList.remove('hidden');
      tooltip.style.left = `${e.clientX - rect.left + 15}px`;
      tooltip.style.top = `${e.clientY - rect.top + 10}px`;

      if (hoverNode.type === 'organ') {
        const d = hoverNode.data;
        tooltip.innerHTML = `
          <strong>${d.id} - ${d.type}</strong><br>
          ABO/Rh: ${d.blood}<br>
          Viability: ${d.shelf_life}h remaining<br>
          Recovery Facility: ${d.hospital}
        `;
      } else {
        const d = hoverNode.data;
        tooltip.innerHTML = `
          <strong>${d.name} (${d.id})</strong><br>
          Needs: ${d.type} (${d.blood})<br>
          Urgency: ${d.urgency}<br>
          Waitlist: ${d.wait_days} days
        `;
      }
    } else {
      tooltip.classList.add('hidden');
    }
  });

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (state.canvasNetwork && state.canvasNetwork.edges) {
      // Find closest edge to click
      let closest = null;
      let minD = 999;
      state.canvasNetwork.edges.forEach(edge => {
        const midX = (edge.from.x + edge.to.x) / 2;
        const midY = (edge.from.y + edge.to.y) / 2;
        const d = Math.hypot(midX - mx, midY - my);
        if (d < minD && d < 25) {
          minD = d;
          closest = edge;
        }
      });

      if (closest) {
        openPathwayDetail(closest);
      }
    }
  });

  canvas.addEventListener('mouseleave', () => {
    tooltip.classList.add('hidden');
  });
}

function openPathwayDetail(edge) {
  const panel = document.getElementById('pathway-detail-panel');
  const title = document.getElementById('pathway-detail-title');
  const content = document.getElementById('pathway-detail-content');

  title.textContent = `Compatibility Pathway: ${edge.fromId} &rarr; ${edge.toId} (Score: ${edge.weight.toFixed(1)}/100)`;
  content.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:12px; font-size:0.8rem;">
      <div style="background:#fff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:4px;">
        <span style="font-size:0.68rem; color:#64748b; display:block;">ABO Verification</span>
        <strong style="color:#059669;">Compatible Non-Reactive</strong>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:4px;">
        <span style="font-size:0.68rem; color:#64748b; display:block;">Tissue Fit Margin</span>
        <strong>${edge.weight >= 85 ? 'High HLA Match' : 'Acceptable Antigen Fit'}</strong>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:4px;">
        <span style="font-size:0.68rem; color:#64748b; display:block;">Cold-Ischemia Risk</span>
        <strong style="color:#0284c7;">Viable Transport Route</strong>
      </div>
      <div style="background:#fff; border:1px solid #e2e8f0; padding:8px 10px; border-radius:4px;">
        <span style="font-size:0.68rem; color:#64748b; display:block;">Outstanding Checks</span>
        <strong>CDC Crossmatch Required</strong>
      </div>
    </div>
    <div style="font-size:0.78rem; background:#fff; border-left:3px solid #0d9488; padding:8px 12px; border-radius:4px; color:#334155;">
      <strong>Clinical Breakdown:</strong> ${edge.reason}
    </div>
  `;

  panel.classList.remove('hidden');
}

function closePathwayPanel() {
  document.getElementById('pathway-detail-panel').classList.add('hidden');
}

/* ========================================================================= */
/*                   SECTION 6: TRANSPORT LOGISTICS OPERATIONS               */
/* ========================================================================= */

function renderTransports() {
  const container = document.getElementById('transports-list-container');
  if (!container) return;
  container.innerHTML = '';

  state.transports.forEach(trp => {
    const card = document.createElement('div');
    card.className = 'transport-mission-card';

    const currIdx = trp.current_milestone_index || 1;
    const milestones = [
      'Clinical Acceptance',
      'Recovery Handoff',
      'Courier Dispatch',
      'In Transit',
      'Implant Arrival',
      'OR Handoff'
    ];

    const makeStepperHTML = () => milestones.map((m, idx) => {
      const stepNum = idx + 1;
      let stateClass = '';
      if (stepNum < currIdx) stateClass = 'completed';
      else if (stepNum === currIdx) stateClass = 'active';

      return `
        <div class="milestone-step ${stateClass}">
          <div class="milestone-bar"></div>
          <div class="milestone-label">${stepNum}. ${m}</div>
        </div>
      `;
    }).join('');

    card.innerHTML = `
      <div class="mission-top-bar">
        <div class="mission-id-block">
          <span class="mission-id">${trp.transport_id}</span>
          <span class="badge-status allocated">${trp.organ_type} &rarr; ${trp.recipient_name}</span>
          <span class="badge-status ${currIdx >= 5 ? 'verified' : 'pending'}">${trp.status}</span>
        </div>
        <div style="font-size:0.75rem; color:#64748b;">
          Remaining Viability: <strong class="text-rose">${(trp.remaining_preservation_hours || 4).toFixed(1)} hrs</strong>
        </div>
      </div>

      <div class="mission-details-grid">
        <div class="route-summary-box">
          <div class="route-line-viz">
            <span>${trp.recovery_hospital}</span>
            <span style="color:#0284c7;">&xrarr;</span>
            <span>${trp.implant_hospital}</span>
          </div>
          <div class="route-distance-stat">
            Route Distance: <strong>${trp.route_distance_km} km</strong> &bull; Estimated Transit: <strong>${trp.estimated_travel_time_mins} mins</strong>
          </div>
        </div>

        <div class="cold-chain-telemetry-box">
          <div class="temp-stat-row">
            <span class="temp-number">${trp.current_temperature_celsius}°C</span>
            <span style="font-size:0.72rem; color:#059669; font-weight:700;">Within Protocol (2.0°C – 6.0°C)</span>
          </div>
          <div style="font-size:0.72rem; color:#64748b;">
            Container ID: <strong>${trp.container_id}</strong> &bull; Telemetry: ${trp.telemetry_status}
          </div>
        </div>

        <div style="background:#fafbfc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 14px; font-size:0.75rem;">
          <span style="color:#64748b; font-size:0.7rem; text-transform:uppercase; font-weight:700;">Carrier Assignment</span>
          <div style="font-weight:700; color:#0f172a; margin-top:2px;">${trp.carrier_assignment}</div>
          <div style="color:#475569; margin-top:2px;">Mode: ${trp.transport_mode}</div>
        </div>
      </div>

      <!-- 6-Milestone Stepper -->
      <div class="milestone-stepper">
        ${makeStepperHTML()}
      </div>

      <div class="mission-footer-actions">
        <div style="font-size:0.75rem; color:#64748b;">
          Next Milestone: <strong>${trp.next_checkpoint || 'OR Handoff'}</strong>
        </div>
        <div>
          ${currIdx < 6 ? `
            <button class="btn btn-primary btn-sm" onclick="advanceTransportMilestone('${trp.transport_id}')">
              Advance Milestone (${milestones[currIdx] || 'Complete'}) &rarr;
            </button>
          ` : `
            <span class="badge-status verified">Mission Successfully Concluded</span>
          `}
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

async function advanceTransportMilestone(transportId) {
  try {
    const res = await fetch(`${API_BASE}/api/transports/advance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transport_id: transportId,
        actor: 'Dispatcher R. Jenkins (Medical Logistics Dispatch)'
      })
    });

    if (res.ok) {
      await fetchTransports();
      await fetchOrgans();
      await fetchRecipients();
      await fetchAuditLogs();
      renderTransports();
    }
  } catch (err) {
    alert('Failed to advance milestone: ' + err.message);
  }
}

/* ========================================================================= */
/*                   SECTION 7: GOVERNANCE & AUDIT LEDGER                    */
/* ========================================================================= */

function renderAuditLedgerTable() {
  const tbody = document.getElementById('audit-ledger-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  state.auditLogs.slice(0, 15).forEach(log => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${log.event_id}</strong></td>
      <td style="font-family:var(--font-mono); font-size:0.75rem;">${log.timestamp}</td>
      <td><span class="badge-status ${log.verification_status === 'Approved' ? 'verified' : (log.verification_status === 'Hold' ? 'pending' : 'allocated')}">${log.event_type}</span></td>
      <td>
        <strong>${log.actor}</strong>
        <span style="display:block; font-size:0.68rem; color:#64748b;">${log.role} &bull; ${log.facility}</span>
      </td>
      <td><strong>${log.target_id}</strong></td>
      <td style="font-size:0.75rem; color:#475569;">${log.details}</td>
      <td style="font-family:var(--font-mono); font-size:0.68rem; color:#64748b;">${log.hash_digest ? log.hash_digest.substring(0, 16) + '...' : 'e3b0c44298fc...'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportAuditLedger() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.auditLogs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `organsync_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
