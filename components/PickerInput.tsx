import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Text, View } from 'react-native';

type PickerInputProps = {
  control: Control<any>;
  name: string;
  label: string;
  items: { label: string; value: any }[];
  error?: string;
  onValueChange?: (value: any) => void;
};

const PickerInput: React.FC<PickerInputProps> = ({
  control,
  name,
  label,
  items,
  error,
  onValueChange,
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <View>
          <Text>{label}</Text>
          <Picker
            selectedValue={value}
            onValueChange={(itemValue) => {
              onChange(itemValue);
              if (onValueChange) {
                onValueChange(itemValue);
              }
            }}
          >
            {items.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
          {error && <Text style={{ color: 'red' }}>{error}</Text>}
        </View>
      )}
    />
  );
};

export default PickerInput;