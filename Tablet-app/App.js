import { StatusBar } from 'expo-status-bar';
import { useRef, useState, useEffect } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';
import SignatureScreen from 'react-native-signature-canvas';
import Edit from './src/components/Edit';
import Settings from './src/components/Settings';
import ProgressModal from './src/components/ProgressModal';
import { exportPdf } from './src/functions/exportPdf';
import { uploadPdf } from './src/functions/uploadPdf';

export default function App() {
  const signatureRef = useRef(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [permanentText, setPermanentText] = useState('Permanent text');
  const [progressStatus, setProgressStatus] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Memory fallback for permanent text
  const permanentTextMemory = useRef({});

  useEffect(() => {
    loadPermanentText();
  }, []);

  const loadPermanentText = async () => {
    try {
      const saved = await SecureStore.getItemAsync('permanentText');
      if (saved) {
        setPermanentText(saved);
        permanentTextMemory.current.value = saved;
        return;
      }
    } catch (error) {
      // SecureStore might fail, fall back to memory
    }

    // Check memory fallback
    if (permanentTextMemory.current.value) {
      setPermanentText(permanentTextMemory.current.value);
    }
  };

  const savePermanentText = async (text) => {
    permanentTextMemory.current.value = text;
    try {
      await SecureStore.setItemAsync('permanentText', text);
    } catch (error) {
      // If SecureStore fails, value is still in memory fallback
    }
  };

  const handleSignatureSave = (signature) => {
    setSignatureData(signature);
    console.log('Signature saved:', signature.slice(0, 40) + '...');
  };

  const handleSaveSignaturePress = () => {
    signatureRef.current?.readSignature();
  };

  const handleDeleteSignaturePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    signatureRef.current?.clearSignature();
    setSignatureData('');
  };

  const handleButtonPress = (callback) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    callback();
  };

  const handleExportPdf = async () => {
    setIsProcessing(true);
    setProgressStatus('generating');
    try {
      const uri = await exportPdf({ inputValue, signatureData });
      setProgressStatus('uploading');
      const result = await uploadPdf(uri);
      setProgressStatus('complete');
      setTimeout(() => {
        Alert.alert('Success', `PDF uploaded successfully!`, [
          { text: 'OK', onPress: () => {
            setIsProcessing(false);
            setInputValue('');
            setSignatureData('');
            signatureRef.current?.clearSignature();
          } },
        ]);
      }, 300);
    } catch (error) {
      setProgressStatus('error');
      setTimeout(() => {
        Alert.alert('Error', error.message || 'Failed to export or upload PDF', [
          { text: 'OK', onPress: () => setIsProcessing(false) },
        ]);
      }, 300);
      console.error('PDF export/upload error:', error);
    }
  };

  const handleEditSave = (newText) => {
    setPermanentText(newText);
    savePermanentText(newText);
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.appTitle}>Tablet App</Text>
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && { opacity: 0.7 }]}
          onPress={() => handleButtonPress(() => setIsSettingsVisible(true))}
        >
          <Text style={styles.settingsButtonText}>⚙️</Text>
        </Pressable>
      </View>
      <TextInput 
        placeholder="Type here..." 
        value={inputValue}
        onChangeText={setInputValue}
        style={styles.input}
      />
      <View style={styles.row}>
        <Text style={styles.permanentText}>{permanentText}</Text>
        <Pressable
          style={({ pressed }) => [styles.editButton, pressed && { opacity: 0.7 }]}
          onPress={() => handleButtonPress(() => setIsEditModalVisible(true))}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
      </View>
      <Edit
        visible={isEditModalVisible}
        currentValue={permanentText}
        onClose={() => setIsEditModalVisible(false)}
        onSave={handleEditSave}
      />
      <View style={styles.signatureActionsRow}>
        <Pressable style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.7 }]} onPress={handleDeleteSignaturePress}>
          <Text style={styles.deleteButtonText}>Delete Signature</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.7 }]} onPress={() => handleButtonPress(handleSaveSignaturePress)}>
          <Text style={styles.saveButtonText}>Save Signature</Text>
        </Pressable>
      </View>
      <View style={styles.signatureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleSignatureSave}
          onEmpty={() => console.log('Please provide a signature first.')}
          descriptionText="Sign in the box"
          clearText="Clear"
          confirmText="Save"
          autoClear={false}
          penColor="#111"
          backgroundColor="#fff"
          dotSize={1}
          maxWidth={2}
          minWidth={1}
          minDistance={0}
          webStyle={`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            html, body {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
            }
            .m-signature-pad {
              display: flex;
              flex-direction: column;
              width: 100%;
              height: 100%;
              flex: 1;
            }
            .m-signature-pad--body {
              flex: 1;
              display: flex;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            .m-signature-pad--footer {
              display: none !important;
            }
            .m-signature-pad canvas {
              display: block;
              width: 100% !important;
              height: 100% !important;
              flex: 1;
              touch-action: none;
              image-rendering: pixelated;
            }
          `}
          style={styles.signaturePad}
        />
      </View>
      <Pressable style={({ pressed }) => [styles.exportButton, pressed && { opacity: 0.7 }, isProcessing && { opacity: 0.6 }]} onPress={() => !isProcessing && handleButtonPress(handleExportPdf)} disabled={isProcessing}>
        <Text style={styles.exportButtonText}>{isProcessing ? 'Processing...' : 'Export PDF'}</Text>
      </Pressable>
      <ProgressModal visible={isProcessing} status={progressStatus} />
      <Settings
        visible={isSettingsVisible}
        onClose={() => setIsSettingsVisible(false)}
        onUrlUpdated={() => console.log('Server URL updated')}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f6f8fa',
  },
  settingsButtonText: {
    fontSize: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  permanentText: {
    fontSize: 18,
    fontWeight: '600',
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1f6feb',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  exportButton: {
    marginTop: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: '#1a7f37',
    marginBottom: 30,
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  signatureContainer: {
    flex: 1,
    width: '100%',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 10,
    overflow: 'hidden',
  },
  signaturePad: {
    flex: 1,
  },
  signatureActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  deleteButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#d1242f',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#1f6feb',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d0d7de',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
