"use client";
import { useState } from "react";
import Link from "next/link";
import { AdminPatientRow, AccessRequest } from "@/lib/data/admin";
import { getStatusColor, getStatusDot, formatDaysAgo } from "@/lib/utils/recovery";
import { InviteModal } from "./InviteModal";
import {
  Users, Activity, Target, CheckSquare, TrendingUp, Clock,
  Eye, Send, FileText, UserPlus, CheckCircle, XCircle, AlertTriangle
} from "lucide-react";

interface AdminPanelProps {
  patients: AdminPatientRow[];
  requests: AccessRequest[];
}

const statusLabels: Record<string, string> = {
  excellent: "Excelente",
  stable: "Estable",
  alert: "Alerta",
  critical: "Requiere seguimiento",
};

export function AdminPanel({ patients, requests }: AdminPanelProps) {
  const [showInvite, setShowInvite] = useState(false);
  const [invitePrefill, setInvitePrefill] = useState<{ email: string; name: string; requestId?: string }>({ email: "", name: "" });

  const totalActive = patients.filter((p) => p.access_active).length;
  const highPain = patients.filter((p) => p.current_pain > 7).length;
  const lowAdherence = patients.filter((p) => p.adherence_percentage < 50).length;
  const completing = patients.filter((p) => p.current_week === 6).length;
  const weeklyActivity = patients.filter((p) => {
    if (!p.last_log_date) return false;
    const diff = Math.floor((new Date().getTime() - new Date(p.last_log_date).getTime()) / (1000 * 60 * 60 * 24));
    return diff <= 7;
  }).length;
  const avgRecovery = patients.length > 0
    ? Math.round(patients.reduce((s, p) => s + p.recovery_score, 0) / patients.length)
    : 0;

  const kpis = [
    { icon: Users, label: "Pacientes activos", value: totalActive, color: "#0170B9" },
    { icon: Activity, label: "Dolor alto (>7)", value: highPain, color: "#ef4444" },
    { icon: Target, label: "Baja adherencia", value: lowAdherence, color: "#f97316" },
    { icon: CheckSquare, label: "Completando S6", value: completing, color: "#22c55e" },
    { icon: Clock, label: "Activos esta semana", value: weeklyActivity, color: "#5072AC" },
    { icon: TrendingUp, label: "Recovery Score prom.", value: avgRecovery, color: "#314C8B" },
  ];

  const pendingRequests = requests.filter((r) => r.status === "pending");

  function openInvite(email = "", name = "", requestId?: string) {
    setInvitePrefill({ email, name, requestId });
    setShowInvite(true);
  }

  return (
    <>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          prefillEmail={invitePrefill.email}
          prefillName={invitePrefill.name}
          requestId={invitePrefill.requestId}
        />
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {kpis.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-4">
            <Icon className="w-4 h-4 mb-2" style={{ color }} />
            <div className="text-xs text-text-secondary font-primary font-semibold mb-1 leading-tight">{label}</div>
            <div className="text-2xl font-primary font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* New invite button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openInvite()}
          className="flex items-center gap-2 bg-primary hover:bg-dark text-white font-primary font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invitar paciente
        </button>
      </div>

      {/* Pending access requests */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h2 className="text-base font-primary font-semibold text-dark">
              Solicitudes de acceso pendientes ({pendingRequests.length})
            </h2>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-primary font-semibold text-dark truncate">
                      {req.first_name && req.last_name
                        ? `${req.first_name} ${req.last_name}`
                        : req.full_name}
                    </span>
                    <span className="text-xs text-text-secondary font-body">{formatDaysAgo(req.created_at)}</span>
                  </div>
                  <div className="text-xs text-text-secondary font-body mt-0.5">
                    {req.email}
                    {req.phone && ` · ${req.phone}`}
                    {req.how_found && ` · ${req.how_found}`}
                  </div>
                </div>
                <button
                  onClick={() => openInvite(req.email, req.first_name && req.last_name ? `${req.first_name} ${req.last_name}` : req.full_name, req.id)}
                  className="flex items-center gap-1.5 bg-primary text-white font-primary font-semibold text-xs px-3 py-2 rounded-lg hover:bg-dark transition-colors flex-shrink-0"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Aprobar y enviar acceso
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts for high-pain or inactive patients */}
      {(highPain > 0 || patients.some((p) => p.status === "critical")) && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="text-base font-primary font-semibold text-dark">Pacientes que requieren atención</h2>
          </div>
          <div className="space-y-3">
            {patients
              .filter((p) => p.current_pain > 7 || p.status === "critical")
              .map((p) => (
                <div key={p.id} className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex-1">
                    <span className="text-sm font-primary font-semibold text-dark">{p.full_name}</span>
                    <div className="text-xs text-text-secondary font-body mt-0.5">
                      Dolor: {p.current_pain}/10 · Adherencia: {p.adherence_percentage}% · Último registro: {formatDaysAgo(p.last_log_date)}
                    </div>
                  </div>
                  <Link
                    href={`/admin/patient/${p.id}`}
                    className="text-xs text-primary hover:text-dark font-primary font-semibold flex-shrink-0"
                  >
                    Ver
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Patients table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-bg-subtle flex items-center justify-between">
          <h2 className="text-base font-primary font-semibold text-dark">
            Pacientes ({patients.length})
          </h2>
        </div>
        {patients.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-40" />
            <p className="text-text-secondary font-body text-sm">
              Aún no hay pacientes registrados. Usa el botón &ldquo;Invitar paciente&rdquo; para comenzar.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-bg-subtle">
                <tr>
                  {["Nombre", "Semana", "Dolor", "Adherencia", "Score", "Estado", "Último registro", "Acciones"].map((col) => (
                    <th key={col} className="px-4 py-3 text-left text-xs font-primary font-semibold text-text-secondary uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-subtle">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-bg-subtle/50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <div className="text-sm font-primary font-semibold text-dark">{patient.full_name}</div>
                        <div className="text-xs text-text-secondary font-body">{patient.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-primary font-semibold text-dark">{patient.current_week}/6</span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="text-sm font-primary font-bold"
                        style={{
                          color: patient.current_pain <= 3 ? "#22c55e" : patient.current_pain <= 6 ? "#eab308" : "#ef4444",
                        }}
                      >
                        {patient.current_pain}/10
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-body text-dark">{patient.adherence_percentage}%</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-body text-dark">{patient.recovery_score}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-primary font-semibold px-2.5 py-1 rounded-full ${getStatusColor(patient.status)}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(patient.status)}`} />
                        {statusLabels[patient.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs text-text-secondary font-body">{formatDaysAgo(patient.last_log_date)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/patient/${patient.id}`}
                          className="p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Ver progreso"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openInvite(patient.email, patient.full_name)}
                          className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors"
                          title="Reenviar acceso"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/report?patient=${patient.id}`}
                          className="p-1.5 rounded-lg hover:bg-bg-subtle text-text-secondary transition-colors"
                          title="Ver informe"
                        >
                          <FileText className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
