import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import PickerInput from '../../components/PickerInput';
import { useApi } from '../../hooks/useApi';

const schema = z.object({
  matiere_id: z.number().min(1, 'Matière requise'),
  date: z.string().min(1, 'Date requise'),
});

export default function CreateExamen() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });
  const { createExamen, getMatieres } = useApi();
  type Matiere = { id: number; nom: string };
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadMatieres = async () => {
      const response = await getMatieres();
      setMatieres(response.data);
    };
    loadMatieres();
  }, []);

  const onSubmit = async (data: any) => {
    try {
      await createExamen(data);
      router.back();
      Alert.alert('Succès', 'Examen créé avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PickerInput
        control={control}
        name="matiere_id"
        label="Matière"
        items={matieres.map(m => ({ label: m.nom, value: m.id }))}
        error={errors.matiere_id?.message}
      />

      <Controller
        control={control}
        name="date"
        render={({ field: { value, onChange } }) => (
          <View style={styles.datePickerContainer}>
            <Text style={styles.label}>Date</Text>
            <Button
              title={`Choisir la date: ${value}`}
              onPress={() => setShowDatePicker(true)}
            />
            {showDatePicker && (
              <DateTimePicker
                value={new Date(value)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    const formattedDate = selectedDate.toISOString().split('T')[0];
                    onChange(formattedDate);
                  }
                }}
              />
            )}
            {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
          </View>
        )}
      />

      <CustomButton
        title="Créer Examen"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  error: {
    color: 'red',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 20,
  },
});
