// components/ui/InputField.tsx
"use client"; // Компоненты UI с обработчиками событий должны быть клиентскими

// Определяем пропсы в интерфейсе для лучшей читаемости
interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function InputField({ label, error, ...props }: InputFieldProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input 
        {...props}
        className={`w-full h-12 px-4 rounded-lg bg-gray-100 border transition-colors ${
          error 
          ? 'border-red-500 focus:border-red-500' 
          : 'border-gray-300 focus:border-accent'
        } focus:ring-0`}
      />
      {error && <div className="mt-2 text-sm text-red-700 bg-red-100 p-2 rounded-md">{error}</div>}
    </div>
  );
}