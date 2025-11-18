// Validation utilities for form fields

// Helper function to compose validation rules
export const compose = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return '';
};

// Basic validation rules
export const validationRules = {
  required: (message = 'This field is required') => (value) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message;
    }
    return '';
  },

  minLength: (min, message) => (value) => {
    if (value && value.length < min) {
      return message || `Must be at least ${min} characters`;
    }
    return '';
  },

  maxLength: (max, message) => (value) => {
    if (value && value.length > max) {
      return message || `Must be no more than ${max} characters`;
    }
    return '';
  },

  email: (message = 'Please enter a valid email address') => (value) => {
    if (value && !/\S+@\S+\.\S+/.test(value)) {
      return message;
    }
    return '';
  },

  password: (message = 'Password must be at least 8 characters') => (value) => {
    if (value && value.length < 8) {
      return message;
    }
    return '';
  },

  strongPassword: (message = 'Password must contain at least 8 characters, including uppercase, lowercase, and numbers') => (value) => {
    if (!value) return '';
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (value.length < 8 || !hasUpperCase || !hasLowerCase || !hasNumbers) {
      return message;
    }
    return '';
  },

  match: (fieldName, message) => (value, allValues) => {
    if (value !== allValues[fieldName]) {
      return message || `Must match ${fieldName}`;
    }
    return '';
  },

  phone: (message = 'Please enter a valid phone number') => (value) => {
    if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
      return message;
    }
    return '';
  },

  url: (message = 'Please enter a valid URL') => (value) => {
    if (value && !/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(value)) {
      return message;
    }
    return '';
  },

  numeric: (message = 'Please enter a valid number') => (value) => {
    if (value && isNaN(Number(value))) {
      return message;
    }
    return '';
  },

  alpha: (message = 'Please enter only letters') => (value) => {
    if (value && !/^[a-zA-Z\s]+$/.test(value)) {
      return message;
    }
    return '';
  },

  alphaNumeric: (message = 'Please enter only letters and numbers') => (value) => {
    if (value && !/^[a-zA-Z0-9\s]+$/.test(value)) {
      return message;
    }
    return '';
  },

  noSpaces: (message = 'Spaces are not allowed') => (value) => {
    if (value && /\s/.test(value)) {
      return message;
    }
    return '';
  }
};

// Pre-defined validation schemas
export const authValidation = {
  email: [
    validationRules.required('Email is required'),
    validationRules.email()
  ],

  password: [
    validationRules.required('Password is required'),
    validationRules.password()
  ],

  confirmPassword: [
    validationRules.required('Please confirm your password'),
    validationRules.match('password', 'Passwords do not match')
  ],

  fullName: [
    validationRules.required('Full name is required'),
    validationRules.minLength(2, 'Name must be at least 2 characters'),
    validationRules.maxLength(50, 'Name must be no more than 50 characters'),
    validationRules.alpha('Name can only contain letters')
  ],

  username: [
    validationRules.required('Username is required'),
    validationRules.minLength(3, 'Username must be at least 3 characters'),
    validationRules.maxLength(20, 'Username must be no more than 20 characters'),
    validationRules.alphaNumeric('Username can only contain letters and numbers'),
    validationRules.noSpaces('Username cannot contain spaces')
  ]
};

// ChatFlow specific validation schemas
export const chatFlowValidation = {
  // Login form validation
  login: {
    email: authValidation.email,
    password: [
      validationRules.required('Password is required'),
      validationRules.minLength(6, 'Password must be at least 6 characters')
    ]
  },

  // Signup form validation
  signup: {
    fullName: authValidation.fullName,
    email: authValidation.email,
    password: [
      validationRules.required('Password is required'),
      validationRules.minLength(8, 'Password must be at least 8 characters'),
      validationRules.strongPassword()
    ],
    confirmPassword: authValidation.confirmPassword,
    agreeToTerms: [
      validationRules.required('You must agree to the terms and conditions')
    ]
  },

  // Chat room validation
  chatRoom: {
    roomName: [
      validationRules.required('Room name is required'),
      validationRules.minLength(3, 'Room name must be at least 3 characters'),
      validationRules.maxLength(30, 'Room name must be no more than 30 characters')
    ],
    description: [
      validationRules.maxLength(200, 'Description must be no more than 200 characters')
    ]
  },

  // Message validation
  message: {
    content: [
      validationRules.required('Message cannot be empty'),
      validationRules.maxLength(1000, 'Message must be no more than 1000 characters')
    ]
  }
};

export default {
  compose,
  validationRules,
  authValidation,
  chatFlowValidation
};
