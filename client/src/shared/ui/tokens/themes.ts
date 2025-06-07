import { brandColors, statusColors, neutralColors, gradients } from './colors';

export const lightTheme = {
  colors: {
    // Background colors
    background: {
      primary: '#FFFFFF',
      secondary: '#FAFBFC',
      tertiary: '#F8F9FA',
      card: '#FFFFFF',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    
    // Text colors
    text: {
      primary: '#212529',
      secondary: '#6C757D',
      tertiary: '#ADB5BD',
      inverse: '#FFFFFF',
      brand: brandColors.primary[500],
      success: statusColors.success[800],
      warning: statusColors.warning[800],
      error: statusColors.error[700],
      info: statusColors.info[800],
    },
    
    // Border colors
    border: {
      primary: '#DEE2E6',
      secondary: '#E9ECEF',
      brand: brandColors.primary[200],
      success: statusColors.success[200],
      warning: statusColors.warning[200],
      error: statusColors.error[200],
      info: statusColors.info[200],
    },
    
    // Interactive colors
    interactive: {
      primary: brandColors.primary[500],
      primaryHover: brandColors.primary[600],
      primaryActive: brandColors.primary[700],
      secondary: neutralColors[200],
      secondaryHover: neutralColors[300],
      secondaryActive: neutralColors[400],
    },
    
    // Status colors
    status: {
      success: statusColors.success[500],
      successBg: statusColors.success[50],
      warning: statusColors.warning[500],
      warningBg: statusColors.warning[50],
      error: statusColors.error[500],
      errorBg: statusColors.error[50],
      info: statusColors.info[500],
      infoBg: statusColors.info[50],
    },
    
    // Data type specific colors
    dataType: {
      image: {
        bg: '#E8F5E9',
        text: '#2E7D32',
        border: '#A5D6A7'
      },
      text: {
        bg: '#E3F2FD',
        text: '#1565C0',
        border: '#90CAF9'
      },
      csv: {
        bg: '#E0F7FA',
        text: '#00838F',
        border: '#80DEEA'
      },
      zip: {
        bg: '#FFF3E0',
        text: '#E65100',
        border: '#FFCC80'
      },
      default: {
        bg: '#F3E8FD',
        text: '#7E22CE',
        border: '#D0BCFF'
      }
    }
  },
  
  gradients: {
    primary: gradients.primary,
    primaryLight: gradients.primaryLight,
    secondary: gradients.secondary,
    success: gradients.success,
    error: gradients.error,
    neutral: gradients.neutral,
    warm: gradients.warm,
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  }
} as const;

export const darkTheme = {
  colors: {
    // Background colors
    background: {
      primary: '#1A1A1A',
      secondary: '#212529',
      tertiary: '#343A40',
      card: '#212529',
      overlay: 'rgba(0, 0, 0, 0.7)',
    },
    
    // Text colors
    text: {
      primary: '#F8F9FA',
      secondary: '#ADB5BD',
      tertiary: '#6C757D',
      inverse: '#212529',
      brand: brandColors.primary[400],
      success: statusColors.success[400],
      warning: statusColors.warning[400],
      error: statusColors.error[400],
      info: statusColors.info[400],
    },
    
    // Border colors
    border: {
      primary: '#495057',
      secondary: '#343A40',
      brand: brandColors.primary[600],
      success: statusColors.success[600],
      warning: statusColors.warning[600],
      error: statusColors.error[600],
      info: statusColors.info[600],
    },
    
    // Interactive colors
    interactive: {
      primary: brandColors.primary[400],
      primaryHover: brandColors.primary[300],
      primaryActive: brandColors.primary[200],
      secondary: neutralColors[700],
      secondaryHover: neutralColors[600],
      secondaryActive: neutralColors[500],
    },
    
    // Status colors
    status: {
      success: statusColors.success[400],
      successBg: statusColors.success[900],
      warning: statusColors.warning[400],
      warningBg: statusColors.warning[900],
      error: statusColors.error[400],
      errorBg: statusColors.error[900],
      info: statusColors.info[400],
      infoBg: statusColors.info[900],
    },
    
    // Data type specific colors (adjusted for dark theme)
    dataType: {
      image: {
        bg: 'rgba(76, 175, 80, 0.1)',
        text: '#81C784',
        border: '#388E3C'
      },
      text: {
        bg: 'rgba(33, 150, 243, 0.1)',
        text: '#64B5F6',
        border: '#1976D2'
      },
      csv: {
        bg: 'rgba(0, 188, 212, 0.1)',
        text: '#4DD0E1',
        border: '#00838F'
      },
      zip: {
        bg: 'rgba(255, 152, 0, 0.1)',
        text: '#FFB74D',
        border: '#E65100'
      },
      default: {
        bg: 'rgba(156, 39, 176, 0.1)',
        text: '#BA68C8',
        border: '#7E22CE'
      }
    }
  },
  
  gradients: {
    primary: 'linear-gradient(90deg, #FF8C66 0%, #FF5733 100%)',
    primaryLight: 'linear-gradient(135deg, #343A40 0%, #212529 100%)',
    secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    success: 'linear-gradient(135deg, rgba(76, 175, 80, 0.2) 0%, rgba(76, 175, 80, 0.1) 100%)',
    error: 'linear-gradient(135deg, rgba(244, 67, 54, 0.2) 0%, rgba(244, 67, 54, 0.1) 100%)',
    neutral: 'linear-gradient(135deg, #343A40 0%, #212529 100%)',
    warm: 'linear-gradient(135deg, rgba(255, 229, 220, 0.1) 0%, rgba(255, 206, 191, 0.1) 100%)',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
  }
} as const;

// Base theme structure
type BaseTheme = {
  colors: {
    background: {
      primary: string;
      secondary: string;
      tertiary: string;
      card: string;
      overlay: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
      inverse: string;
      brand: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    border: {
      primary: string;
      secondary: string;
      brand: string;
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    interactive: {
      primary: string;
      primaryHover: string;
      primaryActive: string;
      secondary: string;
      secondaryHover: string;
      secondaryActive: string;
    };
    status: {
      success: string;
      successBg: string;
      warning: string;
      warningBg: string;
      error: string;
      errorBg: string;
      info: string;
      infoBg: string;
    };
    dataType: {
      image: { bg: string; text: string; border: string };
      text: { bg: string; text: string; border: string };
      csv: { bg: string; text: string; border: string };
      zip: { bg: string; text: string; border: string };
      default: { bg: string; text: string; border: string };
    };
  };
  gradients: {
    primary: string;
    primaryLight: string;
    secondary: string;
    success: string;
    error: string;
    neutral: string;
    warm: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
};

export type Theme = BaseTheme;
export type ThemeMode = 'light' | 'dark'; 