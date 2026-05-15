"use client";
import { useState, useRef, useEffect } from "react";
import { MessageSquare, Mail, ChevronDown } from "lucide-react";
import { SendMessageModal } from "./SendMessageModal";

interface SendMessageButtonProps {
  patientEmail: string;
  patientName: string;
  patientPhone?: string | null;
}

export function SendMessageButton({ patientEmail, patientName, patientPhone }: SendMessageButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleWhatsApp() {
    setShowDropdown(false);
    if (!patientPhone) return;
    const firstName = patientName.split(" ")[0];
    const phone = patientPhone.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hola ${firstName}, le escribe el Dr. Carlos Rebollón sobre su Protocolo Activo de Hombro.`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  }

  return (
    <>
      {showEmailModal && (
        <SendMessageModal
          patientEmail={patientEmail}
          patientName={patientName}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      <div ref={ref} className="relative">
        <button
          onClick={() => setShowDropdown((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-primary font-semibold rounded-xl hover:bg-dark transition-colors"
          title="Enviar mensaje al paciente"
        >
          <MessageSquare className="w-3 h-3" />
          Enviar mensaje
          <ChevronDown className={`w-3 h-3 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 top-full mt-1.5 bg-white border border-bg-subtle rounded-xl shadow-soft py-1 z-20 min-w-[160px]">
            <button
              onClick={() => { setShowDropdown(false); setShowEmailModal(true); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-primary font-semibold text-dark hover:bg-bg-subtle transition-colors text-left"
            >
              <Mail className="w-4 h-4 text-primary" />
              Email
            </button>
            <button
              onClick={handleWhatsApp}
              disabled={!patientPhone}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-primary font-semibold text-dark hover:bg-bg-subtle transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
              title={!patientPhone ? "No hay número de teléfono registrado" : undefined}
            >
              {/* WhatsApp icon as inline SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
              {!patientPhone && (
                <span className="ml-auto text-xs text-text-secondary font-normal">sin tel.</span>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
