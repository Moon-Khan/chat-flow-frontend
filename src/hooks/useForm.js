import { useState, useCallback } from 'react';

// Custom hook for form state management and validation
export const useForm = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouchedState] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle field blur (mark as touched)
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouchedState(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Set field as touched manually
  const setFieldTouched = useCallback((name) => {
    setTouchedState(prev => ({
      ...prev,
      [name]: true
    }));
  }, []);

  // Validate a single field
  const validateField = useCallback((name, value) => {
    if (!validationSchema[name]) {
      return '';
    }

    const rules = validationSchema[name];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        return error;
      }
    }

    return '';
  }, [validationSchema]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationSchema, values, validateField]);

  // Set form values
  const updateValues = useCallback((newValues) => {
    setValues(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouchedState({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Submit form
  const handleSubmit = useCallback(async (onSubmit) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: error.message || 'Something went wrong' });
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, values]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldTouched,
    setValues: updateValues,
    resetForm,
    validateForm,
    validateField,
    handleSubmit
  };
};

export default useForm;
