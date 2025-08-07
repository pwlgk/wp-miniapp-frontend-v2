// components/ui/ErrorMessage.tsx
type ErrorMessageProps = {
    message: string;
  };
  
  export default function ErrorMessage({ message }: ErrorMessageProps) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 rounded-lg">
        <p>Ой! Что-то пошло не так.</p>
        <p className="text-sm">{message}</p>
      </div>
    );
  }