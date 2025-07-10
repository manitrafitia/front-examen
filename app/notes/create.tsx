import { Examen, Matiere } from '@/services/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import PickerInput from '../../components/PickerInput';
import { useApi } from '../../hooks/useApi';

// Définition du schéma avec des types explicites
const schema = z.object({
  eleve_id: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "ID de l'élève requis")
  ),
  examen_id: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Examen requis")
  ),
  valeur: z.preprocess(
    (val) => Number(val),
    z.number().min(0).max(20, "La note doit être entre 0 et 20")
  ),
  matiere_id: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Matière requise")
  ),
});

// Type déduit du schéma
type FormData = z.infer<typeof schema>;

export default function CreateNote() {
  const { 
    control, 
    handleSubmit, 
    formState: { errors }, 
    setValue 
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      eleve_id: undefined,
      examen_id: undefined,
      matiere_id: undefined,
      valeur: 10
    }
  });

  const { createNote, getExamens, getMatieres } = useApi();
  const [examens, setExamens] = useState<Examen[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examResponse, matieresResponse] = await Promise.all([
          getExamens(),
          getMatieres()
        ]);
        setExamens(examResponse.data);
        setMatieres(matieresResponse.data);
        
        if (examResponse.data.length > 0) {
          setValue('examen_id', examResponse.data[0].id);
        }
        if (matieresResponse.data.length > 0) {
          setValue('matiere_id', matieresResponse.data[0].id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Données soumises:', data);
      await createNote(data);
      router.back();
    } catch (error) {
      console.error("Échec de la création de la note", error);
    }
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
      <FormInput
        control={control}
        name="eleve_id"
        label="ID de l'élève"
        placeholder="Entrez l'ID numérique de l'élève"
        error={errors.eleve_id?.message}
        keyboardType="number-pad"
      />

      <PickerInput
        control={control}
        name="examen_id"
        label="Examen"
        items={examens.map(e => ({
          label: `${e.matiere?.nom || 'Inconnu'} - ${new Date(e.date).toLocaleDateString()}`,
          value: e.id
        }))}
        error={errors.examen_id?.message}
      />

      <PickerInput
        control={control}
        name="matiere_id"
        label="Matière"
        items={matieres.map(m => ({ label: m.nom, value: m.id }))}
        error={errors.matiere_id?.message}
      />

      <FormInput
        control={control}
        name="value"
        label="Note (0-20)"
        placeholder="Entrez une note entre 0 et 20"
        error={errors.valeur?.message}
        keyboardType="decimal-pad"
      />

      <CustomButton
        title="Enregistrer la note"
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitButton: {
    marginTop: 24
  }
});