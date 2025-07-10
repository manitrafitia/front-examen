import { Picker } from '@react-native-picker/picker';
import { Controller } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

type PickerItem = {
  label: string;
  value: string | number;
};

type PickerInputProps = {
  control: any;
  name: string;
  label: string;
  items: PickerItem[];
  error?: string;
};

export default function PickerInput({ control, name, label, items, error }: PickerInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={onChange}
              style={styles.picker}
            >
              <Picker.Item label="Sélectionner..." value="" />
              {items.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        )}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});