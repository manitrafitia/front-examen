import { Examen, Matiere } from '@/services/type';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
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

  const { getMatiere, createNote, getExamens, getMatieres } = useApi();
  const [examens, setExamens] = useState<(Examen & { matiereNom: string; dateFormatted: string })[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getMatiereById = async (id: number): Promise<{ nom: string }> => {
    try {
      const response = await getMatiere(id);
      return response.data || { nom: 'Matière inconnue' };
    } catch (error) {
      console.error('Failed to fetch matiere:', error);
      return { nom: 'Matière inconnue' };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [examResponse, matieresResponse] = await Promise.all([
          getExamens(),
          getMatieres()
        ]);

        // Charger les noms de matières pour chaque examen
        const examensWithMatiere = await Promise.all(
          examResponse.data.map(async (examen: Examen) => {
            const matiere = await getMatiereById(examen.matiere_id);
            return { 
              ...examen, 
              matiereNom: matiere.nom,
              dateFormatted: examen.date ? new Date(examen.date).toLocaleDateString() : 'Date inconnue'
            };
          })
        );

        setExamens(examensWithMatiere);
        setMatieres(matieresResponse.data);

        // Définir les valeurs par défaut
        if (examensWithMatiere.length > 0) {
          setValue('examen_id', examensWithMatiere[0].id);
          // Définir automatiquement la matière correspondante à l'examen sélectionné
          setValue('matiere_id', examensWithMatiere[0].matiere_id);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Échec du chargement des données');
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
      setError("Échec de la création de la note");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    // Définition de fetchData pour recharger les données lors d'une erreur
    const fetchData = async () => {
      try {
      setLoading(true);
      setError(null);

      const [examResponse, matieresResponse] = await Promise.all([
        getExamens(),
        getMatieres()
      ]);

      const examensWithMatiere = await Promise.all(
        examResponse.data.map(async (examen: Examen) => {
        const matiere = await getMatiereById(examen.matiere_id);
        return { 
          ...examen, 
          matiereNom: matiere.nom,
          dateFormatted: examen.date ? new Date(examen.date).toLocaleDateString() : 'Date inconnue'
        };
        })
      );

      setExamens(examensWithMatiere);
      setMatieres(matieresResponse.data);

      if (examensWithMatiere.length > 0) {
        setValue('examen_id', examensWithMatiere[0].id);
        setValue('matiere_id', examensWithMatiere[0].matiere_id);
      }
      } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Échec du chargement des données');
      } finally {
      setLoading(false);
      }
    };

    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <CustomButton
          title="Réessayer"
          onPress={() => {
            setError(null);
            setLoading(true);
            fetchData();
          }}
        />
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
          label: `${e.matiereNom} - ${e.dateFormatted}`,
          value: e.id
        }))}
        error={errors.examen_id?.message}
      />

      <PickerInput
        control={control}
        name="matiere_id"
        label="Matière"
        items={matieres.map(m => ({ 
          label: m.nom || 'Matière inconnue', 
          value: m.id 
        }))}
        error={errors.matiere_id?.message}
      />

      <FormInput
        control={control}
        name="valeur"
        label="Note (0-20)"
        placeholder="Entrez une note entre 0 et 20"
        error={errors.valeur?.message}
        keyboardType="decimal-pad"
      />

      {error && <Text style={styles.error}>{error}</Text>}

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
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  }
});z