import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { seedAppointments, seedInquiries, vehicles } from "@/data/catalog";
import { verifyAdminLogin } from "@/lib/security.server";
import type { Appointment, Inquiry } from "@/data/types";

/**
 * Enquiries and appointments, saved in files so they survive restarts.
 *
 * Why: this used to live only in server memory, so every restart or redeploy erased every
 * customer enquiry. Now they are written to data/inquiries.json and data/appointments.json
 * (the same "data" folder as the cars, so your backups cover them too).
 *
 * Needs a writable disk (a VPS, your own PC). If the disk is read-only the site still works,
 * but enquiries are only kept until the next restart (a warning is printed in the server log).
 */

const DATA_DIR = join(process.cwd(), "data");
const INQUIRIES_FILE = join(DATA_DIR, "inquiries.json");
const APPOINTMENTS_FILE = join(DATA_DIR, "appointments.json");

// Cache on globalThis so dev-server hot reloads do not create two diverging copies.
const g = globalThis as typeof globalThis & {
  __kingsInquiries__?: Inquiry[];
  __kingsAppointments__?: Appointment[];
};

function readList<T>(file: string, seed: T[]): T[] {
  if (!existsSync(file)) return seed.map((item) => ({ ...item }));
  try {
    const list = JSON.parse(readFileSync(file, "utf8")) as T[];
    if (!Array.isArray(list)) throw new Error("not a list");
    return list;
  } catch (error) {
    // Refuse to guess: starting empty would overwrite the real file on the next save.
    throw new Error(
      `${file} is unreadable (${(error as Error).message}). Restore it from a backup or fix it.`,
    );
  }
}

function writeList<T>(file: string, list: T[]) {
  mkdirSync(DATA_DIR, { recursive: true });
  // Write to a temp file then rename: rename is atomic, so a crash can never leave half a file.
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(list, null, 2), "utf8");
  renameSync(tmp, file);
}

function inquiryList(): Inquiry[] {
  if (!g.__kingsInquiries__) g.__kingsInquiries__ = readList(INQUIRIES_FILE, seedInquiries);
  return g.__kingsInquiries__;
}

function appointmentList(): Appointment[] {
  if (!g.__kingsAppointments__) {
    g.__kingsAppointments__ = readList(APPOINTMENTS_FILE, seedAppointments);
  }
  return g.__kingsAppointments__;
}

export function listVehicles() {
  return vehicles;
}

export function listInquiries() {
  return [...inquiryList()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listAppointments() {
  return [...appointmentList()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
  );
}

export function addInquiry(input: Omit<Inquiry, "id" | "status" | "createdAt">) {
  const list = inquiryList();
  const row: Inquiry = {
    ...input,
    id: `inq_${crypto.randomUUID().slice(0, 8)}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const next = [row, ...list];
  writeList(INQUIRIES_FILE, next);
  g.__kingsInquiries__ = next;
  return row;
}

export function addAppointment(input: Omit<Appointment, "id" | "status" | "createdAt">) {
  const list = appointmentList();
  const row: Appointment = {
    ...input,
    id: `apt_${crypto.randomUUID().slice(0, 8)}`,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  const next = [row, ...list];
  writeList(APPOINTMENTS_FILE, next);
  g.__kingsAppointments__ = next;
  return row;
}

export function updateInquiry(id: string, status: Inquiry["status"]) {
  const list = inquiryList();
  const current = list.find((item) => item.id === id);
  if (!current) return null;
  const row = { ...current, status };
  const next = list.map((item) => (item.id === id ? row : item));
  writeList(INQUIRIES_FILE, next);
  g.__kingsInquiries__ = next;
  return row;
}

export function updateAppointment(id: string, status: Appointment["status"]) {
  const list = appointmentList();
  const current = list.find((item) => item.id === id);
  if (!current) return null;
  const row = { ...current, status };
  const next = list.map((item) => (item.id === id ? row : item));
  writeList(APPOINTMENTS_FILE, next);
  g.__kingsAppointments__ = next;
  return row;
}

export function stats() {
  const inquiries = inquiryList();
  return {
    inquiries: inquiries.length,
    openInquiries: inquiries.filter((item) => item.status !== "closed").length,
    appointments: appointmentList().length,
  };
}

export function checkCurator(email: string, password: string) {
  // Credentials come from environment variables (see .env.example), compared in constant time.
  return verifyAdminLogin(email, password);
}