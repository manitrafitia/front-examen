import { Examen, Matiere } from '@/services/type';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import PickerInput from '../../components/PickerInput';
import { useApi } from '../../hooks/useApi';

interface FormData {
  eleve_id: number;
  examen_id: number;
  valeur: number;
  matiere_id: number;
}

export default function NoteDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { getNote, updateNote, deleteNote, getExamens, getMatieres } = useApi();

  const { control, handleSubmit, reset, formState: { isSubmitting }, setValue } = useForm<FormData>();

  // Fetch note data and related data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [noteResponse, examResponse, matieresResponse] = await Promise.all([
          getNote(Number(id)),
          getExamens(),
          getMatieres()
        ]);
        
        setExamens(examResponse.data);
        setMatieres(matieresResponse.data);
        reset(noteResponse.data);
      } catch (error) {
        Alert.alert('Error', 'Failed to load note details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validateForm = (data: FormData) => {
    const errors: Record<string, string> = {};
    
    if (!data.eleve_id || isNaN(data.eleve_id)) {
      errors.eleve_id = "ID de l'élève requis";
    } else if (data.eleve_id < 1) {
      errors.eleve_id = "ID doit être supérieur à 0";
    }
    
    if (!data.examen_id || isNaN(data.examen_id)) {
      errors.examen_id = "Examen requis";
    } else if (data.examen_id < 1) {
      errors.examen_id = "Sélectionnez un examen";
    }
    
    if (!data.valeur || isNaN(data.valeur)) {
      errors.valeur = "Note requise";
    } else if (data.valeur < 0) {
      errors.valeur = "La note ne peut pas être négative";
    } else if (data.valeur > 20) {
      errors.valeur = "La note ne peut pas dépasser 20";
    }
    
    if (!data.matiere_id || isNaN(data.matiere_id)) {
      errors.matiere_id = "Matière requise";
    } else if (data.matiere_id < 1) {
      errors.matiere_id = "Sélectionnez une matière";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (data: FormData) => {
    if (!validateForm(data)) return;
    
    try {
      await updateNote(Number(id), {
        ...data,
        eleve_id: Number(data.eleve_id),
        examen_id: Number(data.examen_id),
        matiere_id: Number(data.matiere_id),
        valeur: Number(data.valeur)
      });
      setIsEditing(false);
      Alert.alert('Success', 'Note updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteNote(Number(id));
              router.back();
              Alert.alert('Success', 'Note deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete note');
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
            name="eleve_id"
            label="ID de l'élève *"
            placeholder="123"
            error={formErrors.eleve_id}
            keyboardType="number-pad"
            editable={isEditing}
          />

          <PickerInput
            control={control}
            name="examen_id"
            label="Examen *"
            items={examens.map(e => ({
              label: `${e.matiere?.nom || 'Inconnu'} - ${new Date(e.date).toLocaleDateString()}`,
              value: e.id
            }))}
            error={formErrors.examen_id}
          />

          <PickerInput
            control={control}
            name="matiere_id"
            label="Matière *"
            items={matieres.map(m => ({ label: m.nom, value: m.id }))}
            error={formErrors.matiere_id}
          />

          <FormInput
            control={control}
            name="valeur"
            label="Note (0-20) *"
            placeholder="15.5"
            error={formErrors.valeur}
            keyboardType="decimal-pad"
            editable={isEditing}
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
              name="eleve_id"
              label="ID de l'élève"
              editable={false}
            />

            <FormInput
              control={control}
              name="examen_id"
              label="Examen"
              value={examens.find(e => e.id === control._formValues.examen_id)?.matiere?.nom || ''}
              editable={false}
            />

            <FormInput
              control={control}
              name="matiere_id"
              label="Matière"
              value={matieres.find(m => m.id === control._formValues.matiere_id)?.nom || ''}
              editable={false}
            />

            <FormInput
              control={control}
              name="valeur"
              label="Note"
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
    gap: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
    gap: 16,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
});