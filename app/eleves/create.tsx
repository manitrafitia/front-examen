import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ScrollView } from 'react-native';
import { z } from 'zod';
import CustomButton from '../../components/CustomButton';
import FormInput from '../../components/FormInput';
import { useApi } from '../../hooks/useApi';

const schema = z.object({
  nom: z.string().min(1, 'Nom est requis'),
  prenom: z.string().min(1, 'Prénom est requis'),
  classe: z.string().min(1, 'Classe est requise'),
});

type FormData = z.infer<typeof schema>;

export default function CreateEleve() {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });
  const { createEleve } = useApi();

  const onSubmit = async (data: FormData) => {
    try {
      await createEleve(data);
      // Navigate back or show success message
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
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
      <CustomButton
        title="Créer Élève"
        onPress={handleSubmit(onSubmit)}
      />
    </ScrollView>
  );
}