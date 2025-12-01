import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'
import { IAssistance } from '../../../src/features/attendance/domain/types/assistance.interface'

type HourListProps = {
  hours: IAssistance[]
  onClose: () => void
  dateString: string
}

export default function HourList({ hours, onClose, dateString }: HourListProps) {
  const { t } = useTranslation()

  const displayDate = dateString.charAt(0).toUpperCase() + dateString.slice(1)

  return (
    <View style={styles.wrapper}>
      <Text style={styles.dateText}>{displayDate}</Text>

      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {hours.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('screens.attendanceCheck.noRecords')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list}>
          {hours.map((item, index) => {
            const formattedHour = new Date(item.assistPunchTime).toLocaleTimeString(
              undefined,
              {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }
            )

            return (
              <View key={index} style={styles.row}>
                <Svg width={20} height={20} viewBox='0 0 24 24' fill='none'>
                  <Path
                    d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2ZM12 20a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z'
                    fill='#88a4bf'
                  />
                  <Path
                    d='M12.75 7h-1.5v5l4 2.4.75-1.23-3.25-1.92V7Z'
                    fill='#88a4bf'
                  />
                </Svg>
                <Text style={styles.hourText}>{formattedHour}</Text>
              </View>
            )
          })}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    padding: 20
  },
  dateText: {
    fontSize: 18,
    color: '#5F7FA6',
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 8
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: 6
  },
  closeText: {
    fontSize: 24,
    color: '#88a4bf',
    fontWeight: 'bold'
  },
  list: {
    marginTop: 10
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12
  },
  hourText: {
    marginLeft: 12,
    fontSize: 18,
    color: '#5F7FA6',
    fontWeight: '500'
  },
  emptyContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A0A0',
    fontStyle: 'italic'
  }
})
