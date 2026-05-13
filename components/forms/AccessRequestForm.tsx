"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, Send } from "lucide-react";

export function AccessRequestForm() {
  const t = useTranslations("landing");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [howFound, setHowFound] = useState("");
  const [privacy, setPrivacy] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setErrorMsg(t("access_required"));
      return;
    }
    if (!privacy) {
      setErrorMsg(t("access_privacy_required"));
      return;
    }

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
        setErrorMsg(data.error || t("access_error"));
        setStatus("error");
        return;
      }

      setStatus("done");
    } catch {
      setErrorMsg(t("access_error"));
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

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder={t("access_first_name_placeholder")}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm font-primary font-semibold text-dark">
              {t("access_last_name")} <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("access_last_name_placeholder")}
              required
            />
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
            placeholder={t("access_email_placeholder")}
            required
          />
        </div>

        {/* Teléfono con banderas */}
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            {t("access_phone")}
          </Label>
          <div className="phone-input-wrapper">
            <PhoneInput
              defaultCountry="PA"
              value={phone}
              onChange={setPhone}
              international
              countryCallingCodeEditable={false}
            />
          </div>
        </div>

        {/* ¿Cómo llegaste? */}
        <div className="space-y-1.5">
          <Label className="text-sm font-primary font-semibold text-dark">
            {t("access_how")}
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
            onChange={(e) => setPrivacy(e.target.checked)}
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

        {(status === "error" || errorMsg) && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3">
            <p className="text-sm text-red-700 font-body">{errorMsg}</p>
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
      </form>
    </>
  );
}
