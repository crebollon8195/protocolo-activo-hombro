"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Send } from "lucide-react";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function AccessRequestForm() {
  const t = useTranslations("landing");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [howFound, setHowFound] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [serverError, setServerError] = useState("");
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    phone: false,
    privacy: false,
  });

  // Inline validation errors
  const errors = {
    firstName: touched.firstName && !firstName.trim()
      ? "Por favor ingresa tu nombre" : "",
    lastName: touched.lastName && !lastName.trim()
      ? "Por favor ingresa tu apellido" : "",
    email: touched.email && !isValidEmail(email)
      ? "Por favor ingresa un correo electrónico válido" : "",
    phone: touched.phone && (!phone || !isValidPhoneNumber(phone))
      ? "Por favor ingresa un número de teléfono válido" : "",
    privacy: touched.privacy && !privacy
      ? "Debes aceptar la política de privacidad" : "",
  };

  const isFormValid =
    firstName.trim() &&
    lastName.trim() &&
    isValidEmail(email) &&
    phone && isValidPhoneNumber(phone) &&
    privacy;

  function touch(field: keyof typeof touched) {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    // Touch all fields to show errors
    setTouched({ firstName: true, lastName: true, email: true, phone: true, privacy: true });

    if (!isFormValid) return;

    setStatus("sending");

    try {
      const res = await fetch("/api/access-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email,
          phone: phone || null,
          how_found: howFound || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error || t("access_error"));
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setServerError(t("access_error"));
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="text-center py-10">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-primary font-semibold text-dark mb-2">
          {t("access_success_title")}
        </h3>
        <p className="text-sm text-text-secondary font-body max-w-sm mx-auto leading-relaxed">
          {t("access_success_desc")}
        </p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .phone-input-wrapper .PhoneInput {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .phone-input-wrapper .PhoneInputCountry {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 10px;
          height: 36px;
          border: 1px solid hsl(var(--input));
          border-radius: calc(var(--radius) - 2px);
          background: white;
          cursor: pointer;
          flex-shrink: 0;
        }
        .phone-input-wrapper .PhoneInputCountrySelect {
          position: absolute;
          opacity: 0;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          cursor: pointer;
        }
        .phone-input-wrapper .PhoneInputCountrySelectArrow {
          display: block;
          width: 0.3em;
          height: 0.3em;
          margin-left: 4px;
          border-style: solid;
          border-color: #808285;
          border-top-width: 0;
          border-bottom-width: 0.1em;
          border-left-width: 0;
          border-right-width: 0.1em;
          transform: rotate(45deg);
          opacity: 0.7;
        }
        .phone-input-wrapper .PhoneInputInput {
          flex: 1;
          height: 36px;
          padding: 0 12px;
          border: 1px solid hsl(var(--input));
          border-radius: calc(var(--radius) - 2px);
          font-size: 14px;
          font-family: var(--font-body, sans-serif);
          color: #3A3A3A;
          background: white;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
        }
        .phone-input-wrapper .PhoneInputInput:focus {
          border-color: #0170B9;
          box-shadow: 0 0 0 2px rgba(1,112,185,0.15);
        }
        .phone-input-wrapper .PhoneInputCountryIcon {
          width: 1.4em;
          height: 1em;
        }
      `}</style>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Nombre + Apellido */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("access_first_name")} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => touch("firstName")}
              placeholder={t("access_first_name_placeholder")}
              className={errors.firstName ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.firstName && (
              <p className="text-xs text-red-600 font-body">{errors.firstName}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("access_last_name")} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => touch("lastName")}
              placeholder={t("access_last_name_placeholder")}
              className={errors.lastName ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.lastName && (
              <p className="text-xs text-red-600 font-body">{errors.lastName}</p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            {t("access_email")} <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            placeholder={t("access_email_placeholder")}
            className={errors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-600 font-body">{errors.email}</p>
          )}
        </div>

        {/* Teléfono — required */}
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            {t("access_phone")} <span className="text-red-500">*</span>
          </Label>
          <div className="phone-input-wrapper">
            <PhoneInput
              defaultCountry="PA"
              value={phone}
              onChange={(val) => { setPhone(val); }}
              onBlur={() => touch("phone")}
              international
              countryCallingCodeEditable={false}
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-red-600 font-body">{errors.phone}</p>
          )}
        </div>

        {/* ¿Cómo llegaste? — optional */}
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            {t("access_how")}
            <span className="text-text-secondary font-normal ml-1">(opcional)</span>
          </Label>
          <Input
            type="text"
            value={howFound}
            onChange={(e) => setHowFound(e.target.value)}
            placeholder={t("access_how_placeholder")}
          />
        </div>

        {/* Privacidad */}
        <div className="flex items-start gap-3 pt-1">
          <input
            id="privacy"
            type="checkbox"
            checked={privacy}
            onChange={(e) => { setPrivacy(e.target.checked); touch("privacy"); }}
            className="mt-0.5 w-4 h-4 accent-primary cursor-pointer"
          />
          <label htmlFor="privacy" className="text-sm text-text-secondary font-body cursor-pointer leading-relaxed">
            {t("access_privacy")}{" "}
            <a
              href={t("access_privacy_url")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold hover:underline"
            >
              {t("access_privacy_link")}
            </a>
          </label>
        </div>
        {errors.privacy && (
          <p className="text-xs text-red-600 font-body -mt-2">{errors.privacy}</p>
        )}

        {serverError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-body">{serverError}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={status === "sending"}
          className="w-full bg-primary hover:bg-dark text-white font-primary font-semibold py-3 rounded-xl transition-colors"
        >
          {status === "sending" ? (
            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {t("access_submit")}
            </span>
          )}
        </Button>
        <p className="text-xs text-text-secondary font-body text-center mt-3 leading-relaxed">
          Revisa tu bandeja de spam o correo no deseado si no recibes el email en 24 horas.
        </p>
      </form>
    </>
  );
}
