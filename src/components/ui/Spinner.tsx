// components/ui/Spinner.tsx
export default function Spinner() {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-gray-200 dark:border-dark-secondary border-t-light-accent dark:border-t-dark-accent rounded-full animate-spin"></div>
      </div>
    );
  }