import { DefaultTheme } from 'react-native-paper'
import { IAppTheme } from './app-theme.interface'

export const LIGHT_THEME: IAppTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2818b3',
    accent: '#3922FF',
    warning: '#FF993A',
    success: '#34d4ad',
    danger: '#cd360c',
    background: '#fff',
    backgroundSecondary: '#f1f5f9',
    surface: '#ffffff',
    text: '#303e67',
    textSecondary: '#88a4bf',
    disabled: '#88a4bf',
    placeholder: '#88a4bf',
    backdrop: DefaultTheme.colors.backdrop,
    notification: '#ff4500',
    border: '#e0e7ff',
    indicator: '#f1f5f9',
    indicatorActive: '#f6fdfb',
    button: '#34d4ad',
    buttonText: '#ffffff',
    cardBgColor: '#fff',
    iconColor: '#89a4bf'
  }
}
