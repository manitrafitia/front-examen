// app/matieres/[id].tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import { useApi } from '../../hooks/useApi';

// Schéma de validation simplifié pour une matière
const schema = z.object({
  nom: z.string().min(1, 'Le nom de la matière est requis'),
//   coefficient: z.number().min(0.1).max(5),
});

type FormData = z.infer<typeof schema>;

export default function MatiereDetail() {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { getMatiere, updateMatiere, deleteMatiere } = useApi();

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Chargement des données de la matière
  useEffect(() => {
    const fetchMatiere = async () => {
      try {
        const response = await getMatiere(Number(id));
        reset({
          nom: response.data.nom,
        //   coefficient: response.data.coefficient || 1
        });
      } catch (error) {
        Alert.alert('Erreur', 'Impossible de charger la matière');
      } finally {
        setLoading(false);
      }
    };

    fetchMatiere();
  }, [id]);

  const handleUpdate = async (data: FormData) => {
    try {
      await updateMatiere(Number(id), data);
      setIsEditing(false);
      Alert.alert('Succès', 'Mise à jour réussie');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la mise à jour');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Confirmation',
      'Supprimer cette matière ? Les examens et notes associés seront aussi supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteMatiere(Number(id));
              router.back();
              Alert.alert('Succès', 'Matière supprimée');
            } catch (error) {
              Alert.alert('Erreur', 'Suppression échouée');
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
            label="Nom de la matière"
            error={errors.nom?.message}
            autoCapitalize="words"
          />
          
          {/* <FormInput
            control={control}
            name="coefficient"
            label="Coefficient"
            keyboardType="numeric"
            error={errors.coefficient?.message}
          /> */}

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
              name="nom"
              label="Nom"
              editable={false}
            />
            {/* <FormInput
              control={control}
              name="coefficient"
              label="Coefficient"
              editable={false}
            /> */}
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    marginBottom: 20,
    gap: 15,
  },
  buttonGroup: {
    marginTop: 20,
    gap: 10,
  },
});