import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { useApi } from '../../hooks/useApi';
import { Examen, Matiere, Note } from '../../services/type';

export default function MatieresScreen() {
  const [matieres, setMatieres] = useState<(Matiere & { examens?: Examen[]; notes?: Note[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMatieres, getExamens, getNotes } = useApi();
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Récupérer toutes les matières
      const matieresResponse = await getMatieres();
      const matieresData: Matiere[] = matieresResponse.data;

      // 2. Récupérer tous les examens
      const examensResponse = await getExamens();
      const examensData: Examen[] = examensResponse.data;

      // 3. Récupérer toutes les notes
      const notesResponse = await getNotes();
      const notesData: Note[] = notesResponse.data;

      // 4. Construire un mapping matiereId => examens[]
      const examensByMatiereId: Record<number, Examen[]> = {};
      examensData.forEach((examen) => {
        if (examen.matiere_id) {
          if (!examensByMatiereId[examen.matiere_id]) {
            examensByMatiereId[examen.matiere_id] = [];
          }
          examensByMatiereId[examen.matiere_id].push(examen);
        }
      });

      // 5. Construire un mapping matiereId => notes[]
      const notesByMatiereId: Record<number, Note[]> = {};
      // Construire un mapping examenId => matiereId pour accélérer
      const matiereIdByExamenId: Record<number, number> = {};
      examensData.forEach((examen) => {
        if (examen.matiere_id) {
          matiereIdByExamenId[examen.id] = examen.matiere_id;
        }
      });

      notesData.forEach((note) => {
        const matiereId = matiereIdByExamenId[note.examen_id];
        if (matiereId) {
          if (!notesByMatiereId[matiereId]) {
            notesByMatiereId[matiereId] = [];
          }
          notesByMatiereId[matiereId].push(note);
        }
      });

      // 6. Associer examens et notes à chaque matière
      const matieresWithDetails = matieresData.map((matiere) => ({
        ...matiere,
        examens: examensByMatiereId[matiere.id] || [],
        notes: notesByMatiereId[matiere.id] || [],
      }));

      setMatieres(matieresWithDetails);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Échec du chargement des matières');
    } finally {
      setLoading(false);
    }
  }, [getMatieres, getExamens, getNotes]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleRefresh = async () => {
    await fetchData();
  };

  if (loading && matieres.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4A5568" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <CustomButton title="Réessayer" onPress={handleRefresh} variant="primary" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Matières</Text>
        {/* Ajoutez des filtres ici si besoin */}
      </View>

      <FlatList
        data={matieres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/matieres/${item.id}`} asChild>
            <Pressable style={styles.subjectCard}>
              <View style={styles.subjectInfo}>
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {item.nom.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.subjectName}>{item.nom}</Text>
                  <Text style={styles.subjectDetails}>
                    {item.examens?.length || 0} examens • {item.notes?.length || 0} notes
                  </Text>
                </View>
              </View>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>#{item.id}</Text>
              </View>
            </Pressable>
          </Link>
        )}
        contentContainerStyle={matieres.length === 0 ? styles.emptyState : styles.listContent}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune matière trouvée</Text>
          </View>
        }
      />

      <Link href="/matieres/create" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addIcon}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#2D3748',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  subjectInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  initialCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialText: {
    color: '#4A5568',
    fontSize: 16,
    fontWeight: '500',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  subjectDetails: {
    fontSize: 14,
    color: '#718096',
  },
  idBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  idText: {
    color: '#718096',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#A0AEC0',
    fontSize: 16,
  },
  addButton: {
    position: 'absolute',
    bottom: 32,
    right: 32,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2D3748',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: '#E53E3E',
    fontSize: 16,
    marginBottom: 16,
  },
});
