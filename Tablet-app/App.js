import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View, TextInput } from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import Edit from './src/components/Edit';
import { exportPdf } from './src/functions/exportPdf';

export default function App() {
  const signatureRef = useRef(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [signatureData, setSignatureData] = useState('');
  const [permanentText, setPermanentText] = useState('Permanent text');

  const handleSignatureSave = (signature) => {
    setSignatureData(signature);
    console.log('Signature saved:', signature.slice(0, 40) + '...');
  };

  const handleSaveSignaturePress = () => {
    signatureRef.current?.readSignature();
  };

  const handleDeleteSignaturePress = () => {
    signatureRef.current?.clearSignature();
    setSignatureData('');
  };

  const handleExportPdf = async () => {
    try {
      const uri = await exportPdf({ inputValue, signatureData });
      Alert.alert('PDF created', `Saved to:\n${uri}`);
    } catch (error) {
      Alert.alert('Export failed', 'Could not generate the PDF.');
      console.error('PDF export error:', error);
    }
  };

  const handleEditSave = (newText) => {
    setPermanentText(newText);
    setIsEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TextInput 
        placeholder="Type here..." 
        value={inputValue}
        onChangeText={setInputValue}
        style={styles.input}
      />
      <View style={styles.row}>
        <Text style={styles.permanentText}>{permanentText}</Text>
        <Pressable
          style={styles.editButton}
          onPress={() => setIsEditModalVisible(true)}
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
        <Pressable style={styles.deleteButton} onPress={handleDeleteSignaturePress}>
          <Text style={styles.deleteButtonText}>Delete Signature</Text>
        </Pressable>
        <Pressable style={styles.saveButton} onPress={handleSaveSignaturePress}>
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
          webStyle={`
            .m-signature-pad--footer {
              display: none;
            }
          `}
          style={styles.signaturePad}
        />
      </View>
      <Pressable style={styles.exportButton} onPress={handleExportPdf}>
        <Text style={styles.exportButtonText}>Export PDF</Text>
      </Pressable>
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
