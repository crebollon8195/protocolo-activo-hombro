import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function Logo({ size = "md", href = "/" }: LogoProps) {
  const sizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  return (
    <Link href={href} className="flex items-center gap-2 group">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-primary font-bold text-sm group-hover:bg-dark transition-colors">
        CR
      </div>
      <div className="flex flex-col leading-none">
        <span className={`font-primary font-semibold text-dark ${sizes[size]}`}>
          Dr. Carlos Rebollón
        </span>
        <span className="text-xs text-text-secondary font-body">
          Protocolo Activo de Hombro
        </span>
      </div>
    </Link>
  );
}
