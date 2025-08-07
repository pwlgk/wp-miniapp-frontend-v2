// app/profile/edit/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation'; // Импортируем хуки
import { getMyInfo, updateMyInfo } from '@/services/api';
import { CustomerUpdatePayload } from '@/types';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Button from '@/components/ui/Button';
import { useTelegramButtons } from '@/hooks/useTelegramButtons';
import { useNotifier } from '@/hooks/useNotifier';
import InputField from '@/components/ui/InputField'; 
import { useNavigation } from '@/context/NavigationContext';
import { useTelegram } from '@/hooks/useTelegram'; // Убедитесь, что это ваш хук

export default function EditProfilePage() {
  const { push } = useNavigation();
  const { notify } = useNotifier();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({ first_name: '', phone: '', city: '' });
  const [formErrors, setFormErrors] = useState({ first_name: '', phone: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setupBackButton, hideMainButton } = useTelegramButtons();
  const { initData } = useTelegram(); // 1. Получаем initData

  useEffect(() => {
    setupBackButton(true);
    hideMainButton();
  }, [setupBackButton, hideMainButton]);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      if (!initData) return;
      try {
        const data = await getMyInfo(initData); 
        setFormData({
          first_name: data.first_name || '',
          phone: data.billing.phone || '',
          city: data.billing.city || '',
        });
      } catch (e: any) {
        setError(e.message || "Не удалось загрузить данные профиля");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  
    // Валидация номера на лету
    if (name === 'phone') {
      const cleanedPhone = value.replace(/[\s-()]/g, '');
      const phoneRegex = /^(?:\+7|8|9)\d{10}$/;
      if (value.trim() && !phoneRegex.test(cleanedPhone)) {
        setFormErrors(prev => ({ ...prev, phone: 'Неверный формат номера телефона.' }));
      } else {
        setFormErrors(prev => ({ ...prev, phone: '' }));
      }
    }
  
    // Очистка других ошибок
    if (formErrors[name as keyof typeof formErrors] && name !== 'phone') {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors = { first_name: '', phone: '' };
    let isValid = true;

    if (!formData.first_name.trim()) {
      errors.first_name = "Имя обязательно для заполнения.";
      isValid = false;
    }
    
    const phoneRegex = /^(?:\+7|8|9)\d{10}$/;
    if (formData.phone.trim() && !phoneRegex.test(formData.phone.replace(/[\s-()]/g, ''))) {
      errors.phone = "Неверный формат номера телефона.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);
    try {
      const payload: CustomerUpdatePayload = {
        first_name: formData.first_name,
        billing: { phone: formData.phone, city: formData.city }
      };
      await updateMyInfo(payload, initData); 
      
      notify('Ваши данные успешно сохранены!', 'success');
      
      // --- КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ ---
      // Получаем текущий URL и передаем его в push
      const currentPath = `${pathname}?${searchParams.toString()}`;
      push('/profile');

    } catch (e: any) {
      setError(e.message || "Не удалось сохранить данные");
      notify("Ошибка сохранения данных", 'error');
    } finally {
      setIsSaving(false);
    }
  };
  
  const isFormValid = useMemo(() => {
    const isNameValid = formData.first_name.trim() !== '';
    const isPhoneValid = !formData.phone.trim() || /^(?:\+7|8|9)\d{10}$/.test(formData.phone.replace(/[\s-()]/g, ''));
    return isNameValid && isPhoneValid;
  }, [formData]);

  if (isLoading) return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (error && !isSaving) return <ErrorMessage message={error} />;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Редактирование профиля</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField label="Имя" name="first_name" value={formData.first_name} onChange={handleChange} required error={formErrors.first_name} />
        <InputField label="Телефон" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+7 (999) 123-45-67" error={formErrors.phone} />
        <InputField label="Город" name="city" value={formData.city} onChange={handleChange} />

        <div className="pt-4">
          <Button type="submit" disabled={isSaving || !isFormValid}>
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </Button>
        </div>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
      </form>
    </div>
  );
}