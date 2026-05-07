import { Modal, View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function ProgressModal({ visible, status }) {
  const statusMessages = {
    generating: 'Generating PDF...',
    uploading: 'Uploading to server...',
    complete: 'Upload complete!',
    error: 'Something went wrong',
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {status !== 'complete' && status !== 'error' && (
            <ActivityIndicator size="large" color="#1f6feb" style={styles.spinner} />
          )}
          <Text style={styles.statusText}>{statusMessages[status] || 'Processing...'}</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 200,
  },
  spinner: {
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    textAlign: 'center',
  },
});
