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
  const [examens, setExamens] = useState<(Examen & { matiereName: string; dateFormatted: string })[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const { getNote, updateNote, deleteNote, getExamens, getMatieres, getMatiere } = useApi();

  const { control, handleSubmit, reset, formState: { isSubmitting }, setValue, watch } = useForm<FormData>();

  // Fetch note data and related data
  useEffect(() => {
    const getExamenDetails = async (examen: Examen) => {
      let matiereName = 'Matière inconnue';
      if (examen.matiere_id) {
        try {
          const matiereResponse = await getMatiere(examen.matiere_id);
          matiereName = matiereResponse.data?.nom || matiereName;
        } catch (error) {
          console.error('Failed to fetch matiere:', error);
        }
      }
      
      return {
        ...examen,
        matiereName,
        dateFormatted: examen.date ? new Date(examen.date).toLocaleDateString() : 'Date inconnue'
      };
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [noteResponse, examResponse, matieresResponse] = await Promise.all([
          getNote(Number(id)),
          getExamens(),
          getMatieres()
        ]);
        
        // Enhance examens with matiere data
        const enhancedExamens = await Promise.all(
          examResponse.data.map(getExamenDetails)
        );

        setExamens(enhancedExamens);
        setMatieres(matieresResponse.data);
        
        // Set form values with fallbacks
        const noteData = noteResponse.data || {};
        reset({
          eleve_id: noteData.eleve_id || 0,
          examen_id: noteData.examen_id || (enhancedExamens[0]?.id || 0),
          valeur: noteData.valeur || 0,
          matiere_id: noteData.matiere_id || (matieresResponse.data[0]?.id || 0)
        });
      } catch (error) {
        console.error(error);
        Alert.alert('Erreur', 'Échec du chargement des détails de la note');
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
      Alert.alert('Succès', 'Note mise à jour avec succès');
    } catch (error) {
      console.error(error);
      Alert.alert('Erreur', 'Échec de la mise à jour de la note');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmer la suppression',
      'Êtes-vous sûr de vouloir supprimer cette note ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteNote(Number(id));
              router.back();
              Alert.alert('Succès', 'Note supprimée avec succès');
            } catch (error) {
              console.error(error);
              Alert.alert('Erreur', 'Échec de la suppression de la note');
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

  const currentValues = watch();
  const currentExamen = examens.find(e => e.id === currentValues.examen_id);
  const currentMatiere = matieres.find(m => m.id === currentValues.matiere_id);

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
            items={examens.map((e) => ({
              label: `${e.matiereName} - ${e.dateFormatted}`,
              value: e.id
            }))}
            error={formErrors.examen_id}
            onValueChange={(value: number) => {
              const selectedExamen = examens.find((e) => e.id === value);
              if (selectedExamen?.matiere_id) {
                setValue('matiere_id', selectedExamen.matiere_id);
              }
            }}
          />

          <PickerInput
            control={control}
            name="matiere_id"
            label="Matière *"
            items={matieres.map((m) => ({ 
              label: m.nom || 'Matière inconnue', 
              value: m.id 
            }))}
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
              title="Enregistrer"
              onPress={handleSubmit(handleUpdate)}
              loading={isSubmitting}
              variant="primary"
            />
            <CustomButton
              title="Annuler"
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
              value={currentValues.eleve_id?.toString() || 'Non spécifié'}
              editable={false}
            />

            <FormInput
              control={control}
              name="examen_id"
              label="Examen"
              value={currentExamen 
                ? `${currentExamen.matiereName} - ${currentExamen.dateFormatted}`
                : 'Examen inconnu'}
              editable={false}
            />

            <FormInput
              control={control}
              name="matiere_id"
              label="Matière"
              value={currentMatiere?.nom || 'Matière inconnue'}
              editable={false}
            />

            <FormInput
              control={control}
              name="valeur"
              label="Note"
              value={currentValues.valeur?.toString() || '0'}
              editable={false}
            />
          </View>

          <View style={styles.buttonGroup}>
            <CustomButton
              title="Modifier"
              onPress={() => setIsEditing(true)}
              variant="primary"
            />
            <CustomButton
              title="Supprimer"
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