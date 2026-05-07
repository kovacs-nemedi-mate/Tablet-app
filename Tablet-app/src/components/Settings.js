import { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { getServerUrl, setServerUrl, resetServerUrl } from '../config/serverConfig';

export default function Settings({ visible, onClose, onUrlUpdated }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadServerUrl();
    }
  }, [visible]);

  const loadServerUrl = async () => {
    try {
      const currentUrl = await getServerUrl();
      setUrl(currentUrl);
    } catch (error) {
      Alert.alert('Error', 'Failed to load server URL');
    }
  };

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Server URL cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await setServerUrl(url);
      Alert.alert('Success', `Server URL updated to:\n${url}`);
      onUrlUpdated?.(url);
      onClose();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to save server URL');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset to Default',
      'Are you sure you want to reset to the default server URL?',
      [
        { text: 'Cancel', onPress: () => {} },
        {
          text: 'Reset',
          onPress: async () => {
            setLoading(true);
            try {
              await resetServerUrl();
              await loadServerUrl();
              Alert.alert('Success', 'Server URL has been reset to default');
              onUrlUpdated?.();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset server URL');
            } finally {
              setLoading(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEmulatorPreset = () => {
    Alert.alert(
      'Use Android emulator URL?',
      'The Android emulator address (10.0.2.2) only works from the emulator. This will not work from a physical device. Do you want to use it anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use Emulator', onPress: () => setUrl('http://10.0.2.2:3000') },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Server Settings</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>Server URL</Text>
            <Text style={styles.helperText}>
              Current value: {url || 'not set'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., http://192.168.1.100:3000"
              placeholderTextColor="#999"
              value={url}
              onChangeText={setUrl}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.hint}>
              If the app and server are on different devices, use the server device's LAN IP like http://192.168.x.x:3000 or a public URL.
            </Text>

            <View style={styles.presetRow}>
              <Pressable
                style={({ pressed }) => [styles.presetButton, pressed && { opacity: 0.7 }, loading && { opacity: 0.6 }]}
                onPress={handleEmulatorPreset}
                disabled={loading}
              >
                <Text style={styles.presetButtonText}>Android Emulator</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.presetButton, pressed && { opacity: 0.7 }, loading && { opacity: 0.6 }]}
                onPress={() => setUrl('http://localhost:3000')}
                disabled={loading}
              >
                <Text style={styles.presetButtonText}>Localhost</Text>
              </Pressable>
            </View>

            <Text style={styles.hint}>
              If you're on a phone or tablet, the URL must point to the server device on the same network or a public tunnel.
            </Text>

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.saveButton,
                  pressed && { opacity: 0.7 },
                  loading && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Save</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.resetButton,
                  pressed && { opacity: 0.7 },
                  loading && { opacity: 0.6 },
                ]}
                onPress={handleReset}
                disabled={loading}
              >
                <Text style={styles.resetButtonText}>Reset to Default</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#999',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111',
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    alignItems: 'center',
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  presetButtonText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonRow: {
    gap: 10,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#1a7f37',
  },
  resetButton: {
    backgroundColor: '#f6f8fa',
    borderWidth: 1,
    borderColor: '#d0d7de',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  resetButtonText: {
    color: '#d1242f',
    fontWeight: '600',
    fontSize: 14,
  },
});
