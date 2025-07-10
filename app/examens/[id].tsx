import { zodResolver } from '@hookform/resolvers/zod';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import PickerInput from '../../components/PickerInput';
import { useApi } from '../../hooks/useApi';

const schema = z.object({
  matiere_id: z.number().min(1, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof schema>;

export default function ExamenDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [matieres, setMatieres] = useState<{id: number, nom: string}[]>([]);
  const { getExamen, updateExamen, deleteExamen, getMatieres } = useApi();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examResponse, matieresResponse] = await Promise.all([
          getExamen(Number(id)),
          getMatieres()
        ]);
        
        reset({
          matiere_id: examResponse.data.matiere_id,
          date: examResponse.data.date.split('T')[0]
        });
        
        setMatieres(matieresResponse.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load exam details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleUpdate = async (data: FormData) => {
    try {
      await updateExamen(Number(id), data);
      setIsEditing(false);
      Alert.alert('Success', 'Exam updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update exam');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this exam? All associated grades will also be deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteExamen(Number(id));
              router.back();
              Alert.alert('Success', 'Exam deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete exam');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isEditing ? (
        <>
          <PickerInput
            control={control}
            name="matiere_id"
            label="Subject"
            items={matieres.map(m => ({ label: m.nom, value: m.id }))}
            error={errors.matiere_id?.message}
          />

          <Controller
            control={control}
            name="date"
            render={({ field: { value, onChange } }) => (
              <View style={styles.datePickerContainer}>
                <Text style={styles.label}>Date</Text>
                <CustomButton
                  title={value || 'Select date'}
                  onPress={() => setShowDatePicker(true)}
                  variant="outline"
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(value || Date.now())}
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

          <View style={styles.buttonGroup}>
            <CustomButton
              title="Save"
              onPress={handleSubmit(handleUpdate)}
              loading={isSubmitting}
              variant="primary"
            />
            <CustomButton
              title="Cancel"
              onPress={() => setIsEditing(false)}
              variant="outline"
            />
          </View>
        </>
      ) : (
        <>
          <View style={styles.infoContainer}>
            <FormInput
              control={control}
              name="matiere_id"
              label="Subject"
              editable={false}
              value={matieres.find(m => m.id === control._formValues.matiere_id)?.nom || 'Unknown'}
            />
            <FormInput
              control={control}
              name="date"
              label="Date"
              editable={false}
            />
          </View>

          <View style={styles.buttonGroup}>
            <CustomButton
              title="Edit"
              onPress={() => setIsEditing(true)}
              variant="primary"
            />
            <CustomButton
              title="Delete"
              onPress={handleDelete}
              loading={deleting}
              disabled={deleting}
              variant="danger"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
  datePickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
});