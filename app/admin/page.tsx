import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { verifyAdminSession, fetchAllPatients, fetchAccessRequests } from "@/lib/data/admin";

export default async function AdminPage() {
  const adminId = await verifyAdminSession();
  if (!adminId) redirect("/auth/login");

  const [patients, requests] = await Promise.all([
    fetchAllPatients(),
    fetchAccessRequests(),
  ]);

  return (
    <div className="min-h-screen bg-bg-subtle flex flex-col">
      <Header role="admin" />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-primary font-semibold text-dark">Panel clínico</h1>
          <p className="text-sm text-text-secondary font-body mt-0.5">
            Protocolo Activo de Hombro — Vista clínica
          </p>
        </div>
        <AdminPanel patients={patients} requests={requests} />
      </main>
    </div>
  );
}
