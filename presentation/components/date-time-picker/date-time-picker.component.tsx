import React from 'react'
import { Platform, View, StyleSheet, TouchableOpacity, Text } from 'react-native'

// Importar el componente nativo solo si no estamos en web
let NativeDateTimePicker: React.ComponentType<any> | null = null
if (Platform.OS !== 'web') {
   
  NativeDateTimePicker = require('@react-native-community/datetimepicker').default
}

export interface DateTimePickerEvent {
  type: 'set' | 'dismissed'
  nativeEvent: {
    timestamp: number
    utcOffset: number
  }
}

interface DateTimePickerProps {
  value: Date
  mode?: 'date' | 'time' | 'datetime'
  display?: 'default' | 'spinner' | 'calendar' | 'clock'
  onChange?: (event: DateTimePickerEvent, date?: Date) => void
  minimumDate?: Date
  maximumDate?: Date
  style?: any
}

/**
 * Componente DateTimePicker multiplataforma
 * Usa el picker nativo en iOS/Android y un input HTML en web
 */
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  mode = 'date',
  onChange,
  minimumDate,
  maximumDate,
  style,
  ...props
}) => {
  // Formatear fecha para input HTML
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    if (mode === 'time') {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${hours}:${minutes}`
    }
    
    if (mode === 'datetime') {
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    return `${year}-${month}-${day}`
  }

  // Obtiene el offset UTC en minutos
  const getUtcOffset = (): number => {
    return -new Date().getTimezoneOffset()
  }

  const handleWebChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (!newValue) {
      onChange?.({ 
        type: 'dismissed', 
        nativeEvent: { timestamp: Date.now(), utcOffset: getUtcOffset() } 
      }, undefined)
      return
    }
    
    let newDate: Date
    
    if (mode === 'time') {
      const [hours, minutes] = newValue.split(':').map(Number)
      newDate = new Date(value)
      newDate.setHours(hours, minutes)
    } else if (mode === 'datetime') {
      newDate = new Date(newValue)
    } else {
      newDate = new Date(newValue + 'T00:00:00')
    }
    
    onChange?.(
      { 
        type: 'set', 
        nativeEvent: { timestamp: newDate.getTime(), utcOffset: getUtcOffset() } 
      },
      newDate
    )
  }

  const getInputType = (): string => {
    switch (mode) {
    case 'time':
      return 'time'
    case 'datetime':
      return 'datetime-local'
    default:
      return 'date'
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, style]}>
        <input
          type={getInputType()}
          value={formatDateForInput(value)}
          onChange={handleWebChange}
          min={minimumDate ? formatDateForInput(minimumDate) : undefined}
          max={maximumDate ? formatDateForInput(maximumDate) : undefined}
          style={{
            padding: 12,
            fontSize: 16,
            borderRadius: 8,
            border: '1px solid #ccc',
            backgroundColor: '#fff',
            color: '#333',
            outline: 'none',
            cursor: 'pointer',
            minWidth: 200
          }}
        />
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => onChange?.({ 
            type: 'dismissed', 
            nativeEvent: { timestamp: Date.now(), utcOffset: getUtcOffset() } 
          }, undefined)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // En plataformas nativas, usar el componente nativo
  if (NativeDateTimePicker) {
    return (
      <NativeDateTimePicker
        value={value}
        mode={mode}
        onChange={onChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        style={style}
        {...props}
      />
    )
  }

  return null
}

const styles = StyleSheet.create({
  webContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#003366',
    borderRadius: 8
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
})

export default DateTimePicker

