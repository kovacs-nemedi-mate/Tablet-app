import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useState, useEffect } from 'react';

export default function Edit({ visible, onClose, currentValue, onSave }) {
	const [editText, setEditText] = useState(currentValue || '');

	useEffect(() => {
		if (visible) {
			setEditText(currentValue || '');
		}
	}, [visible, currentValue]);

	const handleSave = () => {
		if (onSave) {
			onSave(editText);
		} else {
			onClose();
		}
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.modalCard}>
					<Text style={styles.title}>Edit Text</Text>
					<TextInput
						style={styles.input}
						placeholder="Type updated text..."
						value={editText}
						onChangeText={setEditText}
					/>
					<View style={styles.actions}>
						<Pressable style={[styles.button, styles.cancelButton]} onPress={onClose}>
							<Text style={styles.cancelText}>Cancel</Text>
						</Pressable>
						<Pressable style={[styles.button, styles.saveButton]} onPress={handleSave}>
							<Text style={styles.saveText}>Save</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.35)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalCard: {
		width: '100%',
		maxWidth: 360,
		backgroundColor: '#fff',
		borderRadius: 14,
		padding: 16,
		gap: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: '700',
	},
	input: {
		borderWidth: 1,
		borderColor: '#d0d7de',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	actions: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		gap: 10,
	},
	button: {
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 8,
	},
	cancelButton: {
		backgroundColor: '#eaeef2',
	},
	saveButton: {
		backgroundColor: '#1f6feb',
	},
	cancelText: {
		color: '#24292f',
		fontWeight: '600',
	},
	saveText: {
		color: '#fff',
		fontWeight: '600',
	},
});
