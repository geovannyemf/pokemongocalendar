import { CalendarPlus, CalendarCheck } from "lucide-react";

interface CheckboxCalendarProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function CheckboxCalendar({ checked, onChange, disabled }: CheckboxCalendarProps) {
  return (
    <button
      type="button"
      className={`rounded-full w-12 h-12 flex items-center justify-center shadow-md transition-colors
        ${checked ? "bg-blue-500" : "bg-gray-100"} ${disabled ? "opacity-50 cursor-not-allowed" : checked ? "hover:bg-blue-600" : "hover:bg-gray-200"}`}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-label={checked ? "Quitar de calendario" : "Agregar a calendario"}
    >
      {checked ? (
        <CalendarCheck className="w-7 h-7 text-white" />
      ) : (
        <CalendarPlus className="w-7 h-7 text-gray-500" />
      )}
    </button>
  );
}