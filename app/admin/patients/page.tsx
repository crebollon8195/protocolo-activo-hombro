import { redirect } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { verifyAdminSession, fetchAllPatients } from "@/lib/data/admin";
import { getStatusColor, getStatusDot, formatDaysAgo } from "@/lib/utils/recovery";
import { Users, Activity, Target, TrendingUp, Eye, ArrowLeft } from "lucide-react";

const statusLabels: Record<string, string> = {
  excellent: "Excelente",
  stable: "Estable",
  alert: "Alerta",
  critical: "Requiere seguimiento",
};

export default async function PatientsPage() {
  const adminId = await verifyAdminSession();
  if (!adminId) redirect("/auth/login");

  const patients = await fetchAllPatients();

  const activeCount = patients.filter((p) => p.access_active).length;
  const highPainCount = patients.filter((p) => p.current_pain > 7).length;
  const lowAdherenceCount = patients.filter((p) => p.adherence_percentage < 50).length;
  const avgRecovery =
    patients.length > 0
      ? Math.round(patients.reduce((s, p) => s + p.recovery_score, 0) / patients.length)
      : 0;

  const kpis = [
    { icon: Users, label: "Pacientes activos", value: activeCount, color: "#0170B9" },
    { icon: Activity, label: "Dolor alto (>7)", value: highPainCount, color: "#ef4444" },
    { icon: Target, label: "Baja adherencia (<50%)", value: lowAdherenceCount, color: "#f97316" },
    { icon: TrendingUp, label: "Recovery Score prom.", value: avgRecovery, color: "#314C8B" },
  ];

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="admin" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary font-primary font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Panel clínico
          </Link>
          <span className="text-text-secondary">/</span>
          <span className="text-sm font-primary font-semibold text-dark">Pacientes</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-primary font-semibold text-dark">Todos los pacientes</h1>
          <p className="text-sm text-text-secondary font-body mt-0.5">
            {patients.length} paciente{patients.length !== 1 ? "s" : ""} registrado{patients.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-white rounded-2xl shadow-card p-4">
              <Icon className="w-4 h-4 mb-2" style={{ color }} />
              <div className="text-xs text-text-secondary font-primary font-semibold mb-1 leading-tight">{label}</div>
              <div className="text-2xl font-primary font-bold" style={{ color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Patients table */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-bg-subtle">
            <h2 className="text-base font-primary font-semibold text-dark">
              Lista de pacientes ({patients.length})
            </h2>
          </div>

          {patients.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-text-secondary mx-auto mb-4 opacity-40" />
              <p className="text-text-secondary font-body text-sm mb-4">
                Aún no hay pacientes registrados.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-dark font-primary font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al panel
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-bg-subtle">
                  <tr>
                    {["Paciente", "Estado", "Semana", "Dolor", "Adherencia", "Recovery Score", "Último registro", "Acciones"].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-xs font-primary font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bg-subtle">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-bg-subtle/50 transition-colors">

                      {/* Paciente */}
                      <td className="px-4 py-4 min-w-[180px]">
                        <div className="text-sm font-primary font-semibold text-dark">{patient.full_name}</div>
                        <div className="text-xs text-text-secondary font-body">{patient.email}</div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-primary font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${getStatusColor(patient.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(patient.status)}`} />
                          {statusLabels[patient.status] ?? patient.status}
                        </span>
                      </td>

                      {/* Semana */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-primary font-semibold text-dark">{patient.current_week}/6</span>
                      </td>

                      {/* Dolor */}
                      <td className="px-4 py-4">
                        <span
                          className="text-sm font-primary font-bold"
                          style={{
                            color:
                              patient.current_pain <= 3
                                ? "#22c55e"
                                : patient.current_pain <= 6
                                ? "#eab308"
                                : "#ef4444",
                          }}
                        >
                          {patient.current_pain}/10
                        </span>
                      </td>

                      {/* Adherencia con barra */}
                      <td className="px-4 py-4 min-w-[130px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-bg-subtle rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full transition-all"
                              style={{
                                width: `${Math.min(100, patient.adherence_percentage)}%`,
                                backgroundColor:
                                  patient.adherence_percentage >= 70
                                    ? "#22c55e"
                                    : patient.adherence_percentage >= 50
                                    ? "#eab308"
                                    : "#ef4444",
                              }}
                            />
                          </div>
                          <span className="text-xs font-body text-dark w-8 text-right">{patient.adherence_percentage}%</span>
                        </div>
                      </td>

                      {/* Recovery Score */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-body text-dark">{patient.recovery_score}</span>
                      </td>

                      {/* Último registro */}
                      <td className="px-4 py-4">
                        <span className="text-xs text-text-secondary font-body whitespace-nowrap">
                          {formatDaysAgo(patient.last_log_date)}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/patient/${patient.id}`}
                          className="inline-flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                          title="Ver progreso"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
