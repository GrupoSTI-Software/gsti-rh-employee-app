import { JSX, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Image, Linking, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Path, Svg } from 'react-native-svg'
import { IException } from '../../../src/features/attendance/domain/types/exception.interface'
import useAttendanceExceptionsListStyles from './attendance-exceptions-list.style'
type ExceptionListProps = {
  exceptions: IException[]
  onClose: () => void
  dateString: string
}

/**
 * Componente para mostrar la lista de excepciones de asistencia
 * @param {ExceptionListProps} props - Propiedades del componente
 * @returns {JSX.Element} Componente de lista de excepciones
 */
/**
 * Tipos de archivos soportados
 */
type FileType = 'image' | 'pdf' | 'word' | 'excel' | 'powerpoint' | 'text' | 'other'

export default function ExceptionList({ exceptions, onClose, dateString }: ExceptionListProps) {
  const styles = useAttendanceExceptionsListStyles()
  const { t } = useTranslation()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const displayDate = dateString.charAt(0).toUpperCase() + dateString.slice(1)

  /**
   * Formatea una hora en formato legible
   * @param {string | null} timeString - Hora en formato ISO o null
   * @returns {string} Hora formateada o texto por defecto
   */
  const formatTime = (timeString: string | null): string => {
    if (!timeString) return t('screens.attendanceCheck.notAvailable')
    return timeString
  }

  /**
   * Construye la URL completa de la evidencia
   * @param {string} filePath - Ruta del archivo de evidencia
   * @returns {string} URL completa de la evidencia
   */
  const getEvidenceUrl = (filePath: string): string => {
    // Si ya es una URL completa, retornarla directamente
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }
    // Si es una ruta relativa, construir la URL completa
    // Nota: Ajusta esta lógica según cómo se almacenen las evidencias en tu API
    return filePath
  }

  /**
   * Detecta el tipo de archivo basándose en su extensión o URL
   * @param {string} fileUrl - URL del archivo
   * @returns {FileType} Tipo de archivo detectado
   */
  const getFileType = (fileUrl: string): FileType => {
    const url = fileUrl.toLowerCase()
    
    // Extensiones de imagen
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico']
    if (imageExtensions.some(ext => url.includes(ext))) return 'image'
    
    // Extensiones de PDF
    if (url.includes('.pdf') || url.includes('application/pdf')) return 'pdf'
    
    // Extensiones de Word
    const wordExtensions = ['.doc', '.docx', '.rtf']
    if (wordExtensions.some(ext => url.includes(ext)) || url.includes('application/msword') || url.includes('application/vnd.openxmlformats-officedocument.wordprocessingml')) return 'word'
    
    // Extensiones de Excel
    const excelExtensions = ['.xls', '.xlsx', '.csv']
    if (excelExtensions.some(ext => url.includes(ext)) || url.includes('application/vnd.ms-excel') || url.includes('application/vnd.openxmlformats-officedocument.spreadsheetml')) return 'excel'
    
    // Extensiones de PowerPoint
    const powerpointExtensions = ['.ppt', '.pptx']
    if (powerpointExtensions.some(ext => url.includes(ext)) || url.includes('application/vnd.ms-powerpoint') || url.includes('application/vnd.openxmlformats-officedocument.presentationml')) return 'powerpoint'
    
    // Extensiones de texto
    const textExtensions = ['.txt', '.text', '.md']
    if (textExtensions.some(ext => url.includes(ext)) || url.includes('text/plain')) return 'text'
    
    // Verificar por tipo MIME en la URL
    if (url.includes('image/')) return 'image'
    if (url.includes('application/pdf')) return 'pdf'
    
    // Por defecto, tipo desconocido
    return 'other'
  }

  /**
   * Obtiene el nombre del archivo desde la URL
   * @param {string} fileUrl - URL del archivo
   * @returns {string} Nombre del archivo
   */
  const getFileName = (fileUrl: string): string => {
    try {
      const urlParts = fileUrl.split('/')
      const fileName = urlParts[urlParts.length - 1].split('?')[0]
      return fileName || 'archivo'
    } catch {
      return 'archivo'
    }
  }

  /**
   * Abre el modal para visualizar la imagen en tamaño completo
   * @param {string} imageUrl - URL de la imagen a mostrar
   */
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  /**
   * Cierra el modal de imagen
   */
  const closeImageModal = () => {
    setSelectedImage(null)
  }

  /**
   * Abre un archivo externo (PDF, Word, Excel, etc.) usando el navegador o aplicación externa
   * @param {string} fileUrl - URL del archivo a abrir
   * @param {FileType} fileType - Tipo de archivo
   */
  const openExternalFile = async (fileUrl: string, fileType: FileType) => {
    try {
      const canOpen = await Linking.canOpenURL(fileUrl)
      if (canOpen) {
        await Linking.openURL(fileUrl)
      } else {
        Alert.alert(
          t('screens.attendanceCheck.cannotOpenFile'),
          t('screens.attendanceCheck.fileTypeNotSupported', { type: fileType })
        )
      }
    } catch (error) {
      console.error('Error abriendo archivo:', error)
      Alert.alert(
        t('common.error'),
        t('screens.attendanceCheck.errorOpeningFile')
      )
    }
  }

  /**
   * Renderiza el icono según el tipo de archivo
   * @param {FileType} fileType - Tipo de archivo
   * @param {number} size - Tamaño del icono
   * @returns {JSX.Element} Icono SVG del tipo de archivo
   */
  const renderFileIcon = (fileType: FileType, size: number = 48): JSX.Element => {
    const iconColor = '#5F7FA6'
    
    switch (fileType) {
    case 'pdf':
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
            fill={iconColor}
          />
        </Svg>
      )
    case 'word':
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-4 16H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V8h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z'
            fill={iconColor}
          />
        </Svg>
      )
    case 'excel':
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V8h4v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z'
            fill={iconColor}
          />
        </Svg>
      )
    case 'powerpoint':
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16H8v-2h4v2zm0-4H8v-2h4v2zm0-4H8V8h4v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V8h2v2z'
            fill={iconColor}
          />
        </Svg>
      )
    case 'text':
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'
            fill={iconColor}
          />
        </Svg>
      )
    default:
      return (
        <Svg width={size} height={size} viewBox='0 0 24 24' fill='none'>
          <Path
            d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
            fill={iconColor}
          />
        </Svg>
      )
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.dateText}> {t('screens.attendanceCheck.exceptions')}: {displayDate}</Text>
      <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>

      {exceptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {t('screens.attendanceCheck.noExceptions')}
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {exceptions.map((exception, index) => (
            <View key={exception.shiftExceptionId || index} style={styles.exceptionCard}>
              {/* Tipo de excepción */}
              <View style={styles.exceptionHeader}>
                <Svg width={24} height={24} viewBox='0 0 24 24' fill='none'>
                  {/* Icono de nota/documento */}
                  <Path
                    d='M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
                    fill='#5F7FA6'
                  />
                </Svg>
                <Text style={styles.exceptionType}>{exception.type || t('screens.attendanceCheck.unknownException')}</Text>
              </View>

              {/* Descripción */}
              {exception.shiftExceptionsDescription && (
                <View style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>
                    {t('screens.attendanceCheck.description')}:
                  </Text>
                  <Text style={styles.descriptionText}>
                    {exception.shiftExceptionsDescription}
                  </Text>
                </View>
              )}

              {/* Horas de entrada y salida - Solo se muestran si tienen datos */}
              {(exception.shiftExceptionCheckInTime || exception.shiftExceptionCheckOutTime) && (
                <View style={styles.timeContainer}>
                  {exception.shiftExceptionCheckInTime && (
                    <View style={styles.timeRow}>
                      <Svg width={18} height={18} viewBox='0 0 24 24' fill='none'>
                        <Path
                          d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2ZM12 20a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z'
                          fill='#88a4bf'
                        />
                        <Path
                          d='M12.75 7h-1.5v5l4 2.4.75-1.23-3.25-1.92V7Z'
                          fill='#88a4bf'
                        />
                      </Svg>
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>
                          {t('screens.attendanceCheck.checkInTime')}:
                        </Text>
                        <Text style={styles.timeValue}>
                          {formatTime(exception.shiftExceptionCheckInTime)}
                        </Text>
                      </View>
                    </View>
                  )}

                  {exception.shiftExceptionCheckOutTime && (
                    <View style={styles.timeRow}>
                      <Svg width={18} height={18} viewBox='0 0 24 24' fill='none'>
                        <Path
                          d='M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2ZM12 20a8 8 0 1 1 8-8 8 8 0 0 1-8 8Z'
                          fill='#88a4bf'
                        />
                        <Path
                          d='M12.75 7h-1.5v5l4 2.4.75-1.23-3.25-1.92V7Z'
                          fill='#88a4bf'
                        />
                      </Svg>
                      <View style={styles.timeInfo}>
                        <Text style={styles.timeLabel}>
                          {t('screens.attendanceCheck.checkOutTime')}:
                        </Text>
                        <Text style={styles.timeValue}>
                          {formatTime(exception.shiftExceptionCheckOutTime)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {/* Evidencias */}
              {exception.evidences && exception.evidences.length > 0 && (
                <View style={styles.evidencesContainer}>
                  <Text style={styles.evidencesTitle}>
                    {t('screens.attendanceCheck.evidences')} ({exception.evidences.length}):
                  </Text>
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.evidencesScroll}
                  >
                    {exception.evidences.map((evidence, evidenceIndex) => {
                      const fileUrl = getEvidenceUrl(evidence.file)
                      const fileType = getFileType(fileUrl)
                      const fileName = getFileName(fileUrl)
                      const isImage = fileType === 'image'
                      
                      return (
                        <TouchableOpacity
                          key={evidenceIndex}
                          style={styles.evidenceItem}
                          onPress={async () => {
                            if (isImage) {
                              openImageModal(fileUrl)
                            } else {
                              await openExternalFile(fileUrl, fileType)
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          {isImage ? (
                            <Image
                              source={{ uri: fileUrl }}
                              style={styles.evidenceThumbnail}
                              resizeMode="cover"
                              onError={() => {
                                console.error('Error cargando evidencia:', fileUrl)
                              }}
                            />
                          ) : (
                            <View style={styles.fileThumbnailContainer}>
                              {renderFileIcon(fileType, 48)}
                              <Text style={styles.fileNameText} numberOfLines={2}>
                                {fileName}
                              </Text>
                              <View style={styles.fileTypeBadge}>
                                <Text style={styles.fileTypeText}>{fileType.toUpperCase()}</Text>
                              </View>
                            </View>
                          )}
                        </TouchableOpacity>
                      )
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Modal para visualizar imagen en tamaño completo */}
      <Modal
        visible={selectedImage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.imageModalContainer}>
          <TouchableOpacity
            style={styles.imageModalBackdrop}
            activeOpacity={1}
            onPress={closeImageModal}
          >
            <View style={styles.imageModalContent}>
              <TouchableOpacity
                style={styles.imageModalCloseBtn}
                onPress={closeImageModal}
              >
                <Text style={styles.imageModalCloseText}>✕</Text>
              </TouchableOpacity>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.imageModalImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  )
}

