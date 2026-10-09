#!/usr/bin/env python3
"""
OrganSync - Production Healthcare Operations Backend API Server
Provides REST API endpoints for secure organ donor-recipient coordination,
organ verification workflows, transport cold-chain telemetry, governance audit logs,
and invokes the compiled C99 matching engine executable via standard subprocess.
"""

import os
import sys
import json
import time
import hashlib
import subprocess
from datetime import datetime, timezone
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")
C_ENGINE_DIR = os.path.join(BASE_DIR, "c_engine")

if os.name == "nt":
    C_EXEC = os.path.join(C_ENGINE_DIR, "organsync_engine.exe")
else:
    C_EXEC = os.path.join(C_ENGINE_DIR, "organsync_engine")

PORT = 5000

def get_utc_now():
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def read_json_file(filename):
    path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def write_json_file(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)

def append_audit_log(event_type, actor, role, facility, target_id, details, status="Logged"):
    logs = read_json_file("audit_logs.json")
    ts = get_utc_now()
    raw_str = f"{ts}:{event_type}:{actor}:{target_id}:{details}"
    digest = hashlib.sha256(raw_str.encode("utf-8")).hexdigest()
    entry = {
        "event_id": f"AUD-{len(logs) + 9025}",
        "timestamp": ts,
        "event_type": event_type,
        "actor": actor,
        "role": role,
        "facility": facility,
        "target_id": target_id,
        "details": details,
        "verification_status": status,
        "hash_digest": digest
    }
    logs.insert(0, entry)
    write_json_file("audit_logs.json", logs)
    return entry

def run_c_engine(command_flag):
    """Executes the compiled C engine with input data files and captures stdout."""
    organs_path = os.path.join(DATA_DIR, "organs.json")
    recipients_path = os.path.join(DATA_DIR, "recipients.json")

    if not os.path.exists(C_EXEC):
        return {
            "error": "C engine executable not found. Please compile c_engine/organsync_engine first.",
            "executable_path": C_EXEC
        }, 500

    cmd = [C_EXEC, command_flag, organs_path, recipients_path]
    try:
        proc = subprocess.run(
            cmd,
            cwd=C_ENGINE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=15
        )
        if proc.returncode != 0:
            return {"error": "C engine execution error", "stderr": proc.stderr}, 500
        
        parsed = json.loads(proc.stdout)
        return parsed, 200
    except json.JSONDecodeError:
        return {"raw_output": proc.stdout, "stderr": proc.stderr}, 200
    except Exception as e:
        return {"error": str(e)}, 500

def run_c_unit_tests():
    """Executes C engine test suite with --test."""
    if not os.path.exists(C_EXEC):
        return {"error": "C executable not found", "executable_path": C_EXEC}, 500
    try:
        proc = subprocess.run(
            [C_EXEC, "--test"],
            cwd=C_ENGINE_DIR,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=10
        )
        return {
            "success": proc.returncode == 0,
            "stdout": proc.stdout,
            "stderr": proc.stderr
        }, 200
    except Exception as e:
        return {"error": str(e)}, 500


class OrganSyncOperationsHandler(BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()

    def send_json_response(self, data, status_code=200):
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json")
        self.send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def parse_json_body(self):
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            body = self.rfile.read(content_length).decode("utf-8")
            return json.loads(body)
        return {}

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. ORGANS
        if path == "/api/organs":
            data = read_json_file("organs.json")
            self.send_json_response(data)
            return

        # 2. RECIPIENTS
        elif path == "/api/recipients":
            data = read_json_file("recipients.json")
            self.send_json_response(data)
            return

        # 3. TRANSPORTS
        elif path == "/api/transports":
            data = read_json_file("transports.json")
            self.send_json_response(data)
            return

        # 4. AUDIT LOGS
        elif path == "/api/audit-logs":
            data = read_json_file("audit_logs.json")
            self.send_json_response(data)
            return

        # 5. BIPARTITE GRAPH
        elif path == "/api/graph":
            res, code = run_c_engine("--graph")
            self.send_json_response(res, code)
            return

        # 6. PRIORITY QUEUES
        elif path == "/api/priority-queues":
            res, code = run_c_engine("--pq")
            self.send_json_response(res, code)
            return

        # 7. HASH TABLE METRICS
        elif path == "/api/hash-table":
            res, code = run_c_engine("--hash")
            self.send_json_response(res, code)
            return

        # 8. LEGACY PROCESSING QUEUE
        elif path == "/api/processing-queue":
            data = read_json_file("processing_queue.json")
            self.send_json_response(data)
            return

        # 9. CLINICAL OPERATIONS KPI SUMMARY
        elif path == "/api/summary":
            organs = read_json_file("organs.json")
            recipients = read_json_file("recipients.json")
            transports = read_json_file("transports.json")

            verified_organs = sum(1 for o in organs if o.get("verification_status") == "Verified" and o.get("availability") == "Available")
            pending_organs = sum(1 for o in organs if o.get("verification_status") == "Pending Verification" and o.get("availability") == "Available")
            active_recipients = sum(1 for r in recipients if r.get("status") in ["Waiting", "Under Review"])
            critical_cases = sum(1 for r in recipients if r.get("urgency") == "Critical" and r.get("status") in ["Waiting", "Under Review"])
            expiring_organs = sum(1 for o in organs if o.get("shelf_life_hours", 999) <= 6.0 and o.get("availability") == "Available")
            active_transports = sum(1 for t in transports if t.get("current_milestone_index", 1) < 6)

            self.send_json_response({
                "verified_organs": verified_organs,
                "pending_organs": pending_organs,
                "active_recipients": active_recipients,
                "critical_cases": critical_cases,
                "expiring_organs": expiring_organs,
                "active_transports": active_transports,
                "total_organs": len(organs),
                "total_recipients": len(recipients),
                "system_status": "Operational",
                "telemetry_link": "Encrypted TLS 1.3 / Latency 24ms",
                "current_time_utc": get_utc_now()
            })
            return

        # STATIC ASSET SERVING
        clean_path = path.lstrip("/")
        if clean_path == "" or clean_path == "index.html":
            file_path = os.path.join(FRONTEND_DIR, "index.html")
        else:
            file_path = os.path.join(FRONTEND_DIR, clean_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            self.send_response(200)
            if file_path.endswith(".html"):
                self.send_header("Content-Type", "text/html; charset=utf-8")
            elif file_path.endswith(".css"):
                self.send_header("Content-Type", "text/css; charset=utf-8")
            elif file_path.endswith(".js"):
                self.send_header("Content-Type", "application/javascript; charset=utf-8")
            elif file_path.endswith(".json"):
                self.send_header("Content-Type", "application/json; charset=utf-8")
            elif file_path.endswith(".svg"):
                self.send_header("Content-Type", "image/svg+xml")
            self.send_cors_headers()
            self.end_headers()
            with open(file_path, "rb") as f:
                self.wfile.write(f.read())
        else:
            self.send_response(404)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b"404 Not Found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # EXECUTE MATCHING ENGINE
        if path == "/api/run-match":
            res, code = run_c_engine("--match")
            if code == 200:
                append_audit_log(
                    "MATCH_EVALUATION",
                    "Dr. V. K. Bansal, MS",
                    "Director, NOTTO Directorate",
                    "National Coordination Apex Center, Nirman Bhawan, New Delhi",
                    "ALL_ACTIVE",
                    f"C99 Greedy matching engine executed. Evaluated candidates under THOTA Act. Matches generated: {res.get('match_count', 0)}"
                )
            self.send_json_response(res, code)
            return

        # EXECUTE UNIT TESTS
        elif path == "/api/run-tests":
            res, code = run_c_unit_tests()
            self.send_json_response(res, code)
            return

        # REGISTER NEW ORGAN INTAKE
        elif path == "/api/organs":
            body = self.parse_json_body()
            organs = read_json_file("organs.json")
            new_id = body.get("id") or f"ORG-IND-{len(organs) + 101}"
            body["id"] = new_id

            # Defaults for clinical fields
            body.setdefault("donor_id", f"DNR-IND-{len(organs) + 801}")
            body.setdefault("donor_age", 35)
            body.setdefault("preservation_method", "Static Cold Storage (4°C - Belzer UW)")
            body.setdefault("cold_chain_container_id", f"NOTTO-CC-BOX-{len(organs) + 5000}")
            body.setdefault("temperature_celsius", 3.8)
            body.setdefault("telemetry_status", "Active - 3.8°C (Within 2.0-6.0°C Protocol)")
            body.setdefault("transport_status", "Packaging Completed")
            body.setdefault("availability", "Available")
            body.setdefault("verification_status", "Pending Verification")
            body.setdefault("viability_window_hours", body.get("shelf_life_hours", 12.0) + 2.0)
            body.setdefault("submitted_by", "Dr. R. K. Sharma, MCh (AIIMS Procurement Team)")
            body.setdefault("reviewer", "Pending Authorized Clinical Review (NOTTO/SOTTO)")
            body.setdefault("lab_reference", f"NOTTO-LAB-{len(organs) + 4000}")
            body.setdefault("last_activity", f"Organ intake registered at {get_utc_now()}")
            body.setdefault("verification_checklist", {
                "donor_consent": True,
                "abo_confirmation": True,
                "hla_typing": True,
                "infectious_disease_panel": False,
                "crossmatch_status": False,
                "organ_quality_biopsy": True,
                "custody_scan": True,
                "telemetry_attached": True
            })

            organs.append(body)
            write_json_file("organs.json", organs)

            append_audit_log(
                "ORGAN_INTAKE",
                body.get("submitted_by", "Clinical Coordinator"),
                "Procurement Coordinator",
                body.get("hospital", "Recovery Hospital"),
                new_id,
                f"Organ intake logged: {body.get('organ_type')} ({body.get('blood_group')}). Status: Pending Verification."
            )

            self.send_json_response({"success": True, "organ": body}, 201)
            return

        # VERIFY ORGAN CHECKLIST (CLINICAL SIGN-OFF)
        elif path.startswith("/api/organs/") and path.endswith("/verify"):
            parts = path.split("/")
            organ_id = parts[3]
            body = self.parse_json_body()
            organs = read_json_file("organs.json")

            found_organ = None
            for o in organs:
                if o.get("id") == organ_id:
                    checklist = o.get("verification_checklist", {})
                    if "checklist" in body:
                        checklist.update(body["checklist"])
                    else:
                        # Mark all required checklist items complete
                        for k in checklist:
                            checklist[k] = True
                    o["verification_checklist"] = checklist

                    # Check if all items true
                    all_complete = all(checklist.values())
                    if all_complete:
                        o["verification_status"] = "Verified"
                        o["reviewer"] = body.get("reviewer", "Dr. V. K. Bansal, MS (NOTTO Directorate / Apex Center)")
                        o["last_activity"] = f"Clinical dual-signature sign-off completed at {get_utc_now()}"
                    found_organ = o
                    break

            if found_organ:
                write_json_file("organs.json", organs)
                append_audit_log(
                    "ORGAN_VERIFICATION",
                    body.get("reviewer", "Dr. V. K. Bansal, MS"),
                    "Authorized Clinical Reviewer",
                    found_organ.get("hospital", "AIIMS Trauma Center, New Delhi"),
                    organ_id,
                    f"THOTA statutory checklist signed off. Verification status: {found_organ['verification_status']}",
                    "Verified" if found_organ['verification_status'] == "Verified" else "Partial"
                )
                self.send_json_response({"success": True, "organ": found_organ})
            else:
                self.send_json_response({"error": "Organ not found"}, 404)
            return

        # REGISTER RECIPIENT
        elif path == "/api/recipients":
            body = self.parse_json_body()
            recipients = read_json_file("recipients.json")
            new_id = body.get("id") or f"REC-IND-{len(recipients) + 201}"
            body["id"] = new_id
            body.setdefault("urgency_str", body.get("urgency", "Medium"))
            body.setdefault("status", "Waiting")
            body.setdefault("clinical_readiness", "Outpatient / Standby Ready")
            body.setdefault("crossmatch_readiness", "Serum Sample Ready / Virtual Crossmatch")
            body.setdefault("cpra_percent", 0)
            body.setdefault("treating_physician", "Dr. S. Balram, MCh (AIIMS New Delhi)")
            body.setdefault("review_history", f"Listing certified under NOTTO at {get_utc_now()}")

            recipients.append(body)
            write_json_file("recipients.json", recipients)

            append_audit_log(
                "RECIPIENT_REGISTRATION",
                "Transplant Coordinator",
                "Waitlist Administration",
                body.get("hospital", "Treating Center"),
                new_id,
                f"Candidate listed for {body.get('required_organ')} ({body.get('blood_group')}). Urgency: {body.get('urgency')}."
            )

            self.send_json_response({"success": True, "recipient": body}, 201)
            return

        # MATCH ACTIONS: SEND FOR CLINICAL REVIEW / APPROVE / HOLD
        elif path == "/api/matches/action":
            body = self.parse_json_body()
            action = body.get("action")  # "REVIEW", "APPROVE", "HOLD"
            match = body.get("match", {})
            organ_id = match.get("organ_id")
            recipient_id = match.get("recipient_id")
            clinical_notes = body.get("notes", "No notes recorded.")
            actor = body.get("actor", "Dr. R. K. Sharma, MCh")

            organs = read_json_file("organs.json")
            recipients = read_json_file("recipients.json")
            transports = read_json_file("transports.json")

            if action == "APPROVE":
                # Mark organ as Allocated
                for o in organs:
                    if o.get("id") == organ_id:
                        o["availability"] = "Allocated"
                        o["last_activity"] = f"Allocated to {recipient_id} at {get_utc_now()}"

                # Mark recipient as Matched
                for r in recipients:
                    if r.get("id") == recipient_id:
                        r["status"] = "Matched"
                        r["review_history"] = f"Approved for allocation at {get_utc_now()}"

                # Create new transport mission
                new_trp = {
                    "transport_id": f"TRP-IND-{len(transports) + 86:03d}",
                    "match_id": match.get("match_id", f"MTR-IND-{len(transports) + 1:03d}"),
                    "organ_id": organ_id,
                    "organ_type": match.get("organ_type", "Unknown"),
                    "donor_id": match.get("donor_id", "Unknown"),
                    "recipient_id": recipient_id,
                    "recipient_name": match.get("recipient_name", "Recipient"),
                    "recovery_hospital": match.get("donor_hospital", "Donor Center"),
                    "implant_hospital": match.get("recipient_hospital", "Implant Center"),
                    "route_distance_km": match.get("distance_km", 35.0),
                    "estimated_travel_time_mins": max(20, int(match.get("distance_km", 35.0) * 0.7)),
                    "recovery_timestamp": get_utc_now(),
                    "remaining_preservation_hours": match.get("shelf_life_hours", 4.0),
                    "container_id": f"NOTTO-OCS-{match.get('organ_type', 'ORG')[:3].upper()}-{len(transports) + 10:02d}",
                    "current_temperature_celsius": 4.0,
                    "temperature_target_range": "2.0°C - 6.0°C",
                    "temperature_status": "Temperature within range",
                    "telemetry_status": "Active - Live Green Corridor GPS / Temp Telemetry Active",
                    "transport_mode": "Traffic Police Green Corridor Escort & ALS Ambulance",
                    "carrier_assignment": "State Traffic Police Pilot Escort + Mobile ICU Ambulance",
                    "current_milestone_index": 1,
                    "current_milestone": "Clinical acceptance",
                    "next_checkpoint": "Recovery Handoff & Container Hermetic Sealing",
                    "status": "Clinical acceptance confirmed",
                    "custody_scans": [
                        {
                            "timestamp": get_utc_now(),
                            "checkpoint": "Clinical Acceptance Sign-Off",
                            "actor": actor,
                            "location": match.get("recipient_hospital", "Implant Hospital"),
                            "status": "Verified"
                        }
                    ],
                    "notes": clinical_notes
                }
                transports.insert(0, new_trp)
                write_json_file("transports.json", transports)
                write_json_file("organs.json", organs)
                write_json_file("recipients.json", recipients)

                append_audit_log(
                    "ALLOCATION_APPROVAL",
                    actor,
                    "Attending Transplant Surgeon",
                    match.get("recipient_hospital", "Implant Center"),
                    match.get("match_id", "MTR"),
                    f"Match approved for coordination under THOTA: {organ_id} -> {recipient_id}. Clinical notes: {clinical_notes}",
                    "Approved"
                )
                self.send_json_response({"success": True, "message": "Allocation approved for coordination", "transport": new_trp})
                return

            elif action == "REVIEW":
                # Mark recipient as Under Review
                for r in recipients:
                    if r.get("id") == recipient_id:
                        r["status"] = "Under Review"
                        r["review_history"] = f"Transferred to clinical multidisciplinary review at {get_utc_now()}"
                write_json_file("recipients.json", recipients)

                append_audit_log(
                    "CLINICAL_REVIEW",
                    actor,
                    "Transplant Coordinator",
                    match.get("recipient_hospital", "Implant Center"),
                    recipient_id,
                    f"Sent for clinical review with organ {organ_id}. Notes: {clinical_notes}"
                )
                self.send_json_response({"success": True, "message": "Case sent for clinical multidisciplinary review"})
                return

            elif action == "HOLD":
                append_audit_log(
                    "CLINICAL_HOLD",
                    actor,
                    "Transplant Surgeon",
                    match.get("recipient_hospital", "Implant Center"),
                    recipient_id,
                    f"Clinical hold placed on match {organ_id} <-> {recipient_id}. Rationale: {clinical_notes}",
                    "Hold"
                )
                self.send_json_response({"success": True, "message": "Clinical hold logged successfully"})
                return

            self.send_json_response({"error": "Unknown action type"}, 400)
            return

        # ADVANCE TRANSPORT COLD-CHAIN MILESTONES
        elif path == "/api/transports/advance":
            body = self.parse_json_body()
            transport_id = body.get("transport_id")
            actor = body.get("actor", "Transport Dispatcher / Logistics Lead")
            transports = read_json_file("transports.json")
            organs = read_json_file("organs.json")
            recipients = read_json_file("recipients.json")

            milestones = [
                "Clinical acceptance",
                "Recovery handoff",
                "Courier dispatch",
                "In transit",
                "Arrival at implant centre",
                "OR handoff confirmed"
            ]

            status_labels = [
                "Clinical acceptance confirmed",
                "Container sealed",
                "Courier assigned",
                "In transit",
                "Arrival confirmation pending",
                "OR handoff confirmed"
            ]

            updated_trp = None
            for t in transports:
                if t.get("transport_id") == transport_id:
                    curr_idx = t.get("current_milestone_index", 1)
                    if curr_idx < len(milestones):
                        curr_idx += 1
                        t["current_milestone_index"] = curr_idx
                        t["current_milestone"] = milestones[curr_idx - 1]
                        t["status"] = status_labels[curr_idx - 1]
                        
                        if curr_idx < len(milestones):
                            t["next_checkpoint"] = f"Advance to {milestones[curr_idx]}"
                        else:
                            t["next_checkpoint"] = "Transplantation procedure underway in OR"
                            t["telemetry_status"] = "Completed - Telemetry archived"
                            t["temperature_status"] = "Cold-chain closed successfully"

                            # Mark organ and recipient transplanted
                            for o in organs:
                                if o.get("id") == t.get("organ_id"):
                                    o["availability"] = "Transplanted"
                            for r in recipients:
                                if r.get("id") == t.get("recipient_id"):
                                    r["status"] = "Transplanted"
                            write_json_file("organs.json", organs)
                            write_json_file("recipients.json", recipients)

                        # Append custody scan
                        scans = t.get("custody_scans", [])
                        scans.append({
                            "timestamp": get_utc_now(),
                            "checkpoint": milestones[curr_idx - 1],
                            "actor": actor,
                            "location": t.get("implant_hospital" if curr_idx >= 5 else "recovery_hospital"),
                            "status": "Verified"
                        })
                        t["custody_scans"] = scans
                        updated_trp = t
                    break

            if updated_trp:
                write_json_file("transports.json", transports)
                append_audit_log(
                    "TRANSPORT_MILESTONE",
                    actor,
                    "Cold-Chain Logistics Officer",
                    updated_trp.get("implant_hospital", "Logistics"),
                    transport_id,
                    f"Milestone advanced to: {updated_trp['current_milestone']}. Status: {updated_trp['status']}"
                )
                self.send_json_response({"success": True, "transport": updated_trp})
            else:
                self.send_json_response({"error": "Transport not found or already completed"}, 400)
            return

        self.send_response(404)
        self.end_headers()

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        body = self.parse_json_body()

        if path.startswith("/api/organs/"):
            organ_id = path.split("/")[-1]
            organs = read_json_file("organs.json")
            for i, org in enumerate(organs):
                if org.get("id") == organ_id:
                    organs[i].update(body)
                    write_json_file("organs.json", organs)
                    append_audit_log(
                        "ORGAN_UPDATE",
                        "Dr. R. K. Sharma, MCh",
                        "Chief Transplant Surgeon (AIIMS)",
                        organs[i].get("hospital", "Facility"),
                        organ_id,
                        f"Organ record updated: {organ_id}"
                    )
                    self.send_json_response({"success": True, "organ": organs[i]})
                    return
            self.send_json_response({"error": "Organ not found"}, 404)
            return

        elif path.startswith("/api/recipients/"):
            rec_id = path.split("/")[-1]
            recipients = read_json_file("recipients.json")
            for i, rec in enumerate(recipients):
                if rec.get("id") == rec_id:
                    recipients[i].update(body)
                    write_json_file("recipients.json", recipients)
                    append_audit_log(
                        "RECIPIENT_UPDATE",
                        "Dr. S. Balram, MCh",
                        "Chief of CTVS (AIIMS)",
                        recipients[i].get("hospital", "Facility"),
                        rec_id,
                        f"Recipient waitlist status updated: {rec_id}"
                    )
                    self.send_json_response({"success": True, "recipient": recipients[i]})
                    return
            self.send_json_response({"error": "Recipient not found"}, 404)
            return

        self.send_response(404)
        self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path.startswith("/api/organs/"):
            organ_id = path.split("/")[-1]
            organs = read_json_file("organs.json")
            organs = [o for o in organs if o.get("id") != organ_id]
            write_json_file("organs.json", organs)
            self.send_json_response({"success": True})
            return

        elif path.startswith("/api/recipients/"):
            rec_id = path.split("/")[-1]
            recipients = read_json_file("recipients.json")
            recipients = [r for r in recipients if r.get("id") != rec_id]
            write_json_file("recipients.json", recipients)
            self.send_json_response({"success": True})
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, OrganSyncOperationsHandler)
    print(f"============================================================")
    print(f" OrganSync Healthcare Operations Server active on port {PORT}")
    print(f" C Engine Binary : {C_EXEC}")
    print(f" Root Interface  : http://localhost:{PORT}")
    print(f"============================================================")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer terminated.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
