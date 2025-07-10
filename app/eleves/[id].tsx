import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import { useApi } from '../../hooks/useApi';

// Form validation schema
const schema = z.object({
  nom: z.string().min(1, 'Nom est requis'),
  prenom: z.string().min(1, 'Prénom est requis'),
  classe: z.string().min(1, 'Classe est requise'),
});

type FormData = z.infer<typeof schema>;

export default function EleveDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { getEleve, updateEleve, deleteEleve } = useApi();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Fetch student data
  useEffect(() => {
    const fetchEleve = async () => {
      try {
        const response = await getEleve(Number(id));
        reset(response.data); // Pre-fill form with student data
      } catch (error) {
        Alert.alert('Error', 'Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    fetchEleve();
  }, [id]);

  const handleUpdate = async (data: FormData) => {
    try {
      await updateEleve(Number(id), data);
      setIsEditing(false);
      Alert.alert('Success', 'Student updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update student');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteEleve(Number(id));
              router.back();
              Alert.alert('Success', 'Student deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
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
          <FormInput
            control={control}
            name="nom"
            label="Nom"
            error={errors.nom?.message}
          />
          <FormInput
            control={control}
            name="prenom"
            label="Prénom"
            error={errors.prenom?.message}
          />
          <FormInput
            control={control}
            name="classe"
            label="Classe"
            error={errors.classe?.message}
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
              name="nom"
              label="Nom"
              editable={false}
            />
            <FormInput
              control={control}
              name="prenom"
              label="Prénom"
              editable={false}
            />
            <FormInput
              control={control}
              name="classe"
              label="Classe"
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
});