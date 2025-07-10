// app/matieres/create.tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import { useApi } from '../../hooks/useApi';

const schema = z.object({
  nom: z.string().min(1, 'Le nom de la matière est requis'),
});

type FormData = z.infer<typeof schema>;

export default function CreateMatiere() {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { createMatiere } = useApi();
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    try {
      await createMatiere(data);
      router.back(); // Retour à la liste après création
      // Optionnel : Ajouter une notification de succès
    } catch (error) {
      console.error('Erreur création matière:', error);
      // Optionnel : Afficher une alerte d'erreur
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <FormInput
        control={control}
        name="nom"
        label="Nom de la matière"
        placeholder="Mathématiques"
        error={errors.nom?.message}
        autoCapitalize="words"
      />

      <CustomButton
        title="Créer Matière"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}