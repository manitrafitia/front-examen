// components/FormSelect.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Modal from 'react-native-modal';

interface FormSelectProps {
  control: any;
  name: string;
  label: string;
  items: { label: string; value: any }[];
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function FormSelect({
  control,
  name,
  label,
  items,
  error,
  placeholder = 'Select an option',
  disabled = false,
}: FormSelectProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState<any>(null);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          
          {Platform.OS === 'ios' ? (
            <>
              <Pressable
                style={[styles.input, error ? styles.errorBorder : null, disabled && styles.disabled]}
                onPress={() => !disabled && setModalVisible(true)}
              >
                <Text style={[styles.selectedText, !value && styles.placeholder]}>
                  {items.find(item => item.value === value)?.label || placeholder}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="gray" />
              </Pressable>

              <Modal
                isVisible={modalVisible}
                onBackdropPress={() => setModalVisible(false)}
                style={styles.modal}
              >
                <View style={styles.modalContent}>
                  <View style={styles.pickerHeader}>
                    <Pressable onPress={() => setModalVisible(false)}>
                      <Text style={styles.doneText}>Done</Text>
                    </Pressable>
                  </View>
                  <Picker
                    selectedValue={value}
                    onValueChange={(itemValue) => {
                      onChange(itemValue);
                      setSelectedValue(itemValue);
                    }}
                  >
                    <Picker.Item label={placeholder} value={null} />
                    {items.map((item) => (
                      <Picker.Item key={item.value} label={item.label} value={item.value} />
                    ))}
                  </Picker>
                </View>
              </Modal>
            </>
          ) : (
            <View style={[styles.input, error ? styles.errorBorder : null, disabled && styles.disabled]}>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => onChange(itemValue)}
                enabled={!disabled}
                dropdownIconColor="gray"
              >
                <Picker.Item label={placeholder} value={null} />
                {items.map((item) => (
                  <Picker.Item key={item.value} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 0,
    backgroundColor: 'white',
    height: Platform.OS === 'ios' ? 48 : undefined,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    color: 'black',
  },
  placeholder: {
    color: '#999',
  },
  errorBorder: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  doneText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});