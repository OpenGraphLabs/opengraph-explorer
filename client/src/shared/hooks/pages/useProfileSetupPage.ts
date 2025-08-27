import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/data/AuthContext";
import { useCompleteProfile } from "@/shared/api/endpoints/auth";

export interface UseProfileSetupPageOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface ProfileFormData {
  nickname: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  age: string;
  country: string;
}

export interface ProfileFormErrors {
  nickname?: string;
  gender?: string;
  age?: string;
  country?: string;
  general?: string;
}

// Country list with code and name
export const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "JP", name: "Japan" },
  { code: "KR", name: "South Korea" },
  { code: "CN", name: "China" },
  { code: "IN", name: "India" },
  { code: "BR", name: "Brazil" },
  { code: "RU", name: "Russia" },
  { code: "IT", name: "Italy" },
  { code: "ES", name: "Spain" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "CH", name: "Switzerland" },
  { code: "SG", name: "Singapore" },
  { code: "TH", name: "Thailand" },
  { code: "VN", name: "Vietnam" },
  { code: "MY", name: "Malaysia" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "TW", name: "Taiwan" },
  { code: "HK", name: "Hong Kong" },
  { code: "MX", name: "Mexico" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "ZA", name: "South Africa" },
  { code: "OTHER", name: "Other (Not Listed)" },
];

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

export function useProfileSetupPage(options: UseProfileSetupPageOptions = {}) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProfileFormData>({
    nickname: "",
    gender: "MALE",
    age: "",
    country: "US",
  });
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hook for profile completion
  const { mutateAsync: completeProfile, isPosting: isApiLoading, error: apiError } = useCompleteProfile();

  const validateForm = useCallback((): boolean => {
    const newErrors: ProfileFormErrors = {};
    
    // Nickname validation
    if (!formData.nickname.trim()) {
      newErrors.nickname = "Please enter a nickname.";
    } else if (formData.nickname.trim().length < 2) {
      newErrors.nickname = "Nickname must be at least 2 characters.";
    } else if (formData.nickname.trim().length > 50) {
      newErrors.nickname = "Nickname must be 50 characters or less.";
    }

    // Age validation
    if (!formData.age.trim()) {
      newErrors.age = "Please enter your age.";
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 100) {
        newErrors.age = "Please enter an age between 13 and 100.";
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender.";
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = "Please select your country.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const updateFormData = useCallback((field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  }, [errors]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const requestData = {
        nickname: formData.nickname.trim(),
        gender: formData.gender,
        age: parseInt(formData.age),
        country: formData.country,
      };

      await completeProfile(requestData);
      
      options.onSuccess?.();
    } catch (error: any) {
      console.error("Profile completion error:", error);
      
      const errorMessage = error?.response?.data?.detail || 
                          error?.message || 
                          "An error occurred while completing your profile.";
      
      setErrors({ general: errorMessage });
      options.onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, validateForm, completeProfile, options]);

  const isLoading = isApiLoading || isSubmitting;

  return {
    // Form data
    formData,
    errors,
    
    // Form actions
    updateFormData,
    handleSubmit,
    validateForm,
    
    // States
    isLoading,
    isSubmitting,
    apiError,
    
    // User data
    user,
    
    // Options data
    countries: COUNTRIES,
    genderOptions: GENDER_OPTIONS,
  };
}