"use client";
import { useState } from "react";
import { Bell, X } from "lucide-react";

const mockNotifications = [
  { id: 1, text: "Recuerda registrar tu progreso de hoy", time: "Hace 1 hora" },
  { id: 2, text: "Resumen semanal de la semana 3 disponible", time: "Ayer" },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-bg-subtle transition-colors"
      >
        <Bell className="w-5 h-5 text-text-secondary" />
        {mockNotifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-72 bg-white rounded-2xl shadow-soft border border-bg-subtle z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-bg-subtle">
            <span className="text-sm font-primary font-semibold text-dark">Notificaciones</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
          <div className="divide-y divide-bg-subtle">
            {mockNotifications.map((n) => (
              <div key={n.id} className="px-4 py-3 hover:bg-bg-subtle transition-colors">
                <p className="text-sm font-body text-dark">{n.text}</p>
                <p className="text-xs text-text-secondary mt-0.5 font-body">{n.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
