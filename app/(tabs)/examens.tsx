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
import { Examen, Note } from '../../services/type';

export default function ExamensScreen() {
  const [examens, setExamens] = useState<(Examen & { matiere?: { nom: string }; notes?: Note[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getExamens, getMatiere, getNotes } = useApi();
  const router = useRouter();

  const getMatiereById = useCallback(async (id: number) => {
    try {
      const response = await getMatiere(id);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch matiere:', error);
      return { nom: 'Matière inconnue' };
    }
  }, [getMatiere]);

  const fetchExamens = useCallback(async () => {
    try {
      setLoading(true);

      const notesResponse = await getNotes();
      const notesData: Note[] = notesResponse.data;

      // Construire un mapping examenId => notes[]
      const notesByExamenId: Record<number, Note[]> = {};
      notesData.forEach(note => {
        if (!notesByExamenId[note.examen_id]) {
          notesByExamenId[note.examen_id] = [];
        }
        notesByExamenId[note.examen_id].push(note);
      });

      // Récupérer les examens
      const examensResponse = await getExamens();
      const examensData = examensResponse.data;

      // Pour chaque examen, récupérer la matière et associer les notes via le mapping
      const examensWithDetails = await Promise.all(
        examensData.map(async (examen: Examen) => {
          const matiere = examen.matiere_id ? await getMatiereById(examen.matiere_id) : null;
          const notes = notesByExamenId[examen.id] || [];
          return {
            ...examen,
            matiere: matiere || { nom: 'Sans matière' },
            notes,
          };
        })
      );

      setExamens(examensWithDetails);
      setError(null);
    } catch (err) {
      console.error('Fetch examens error:', err);
      setError('Échec du chargement des examens');
    } finally {
      setLoading(false);
    }
  }, [getExamens, getMatiereById, getNotes]);

  // Rafraîchir à chaque focus d’écran 
  useFocusEffect(
    useCallback(() => {
      fetchExamens();
    }, [fetchExamens])
  );

  // Rafraîchir manuellement via pull to refresh ou bouton
  const handleRefresh = async () => {
    await fetchExamens();
  };

  if (loading && examens.length === 0) {
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

  // Récupérer les initiales d'une matière
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Examens</Text>
      </View>

      <FlatList
        data={examens}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/examens/${item.id}`} asChild>
            <Pressable style={styles.examCard}>
              <View style={styles.examInfo}>
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {item.matiere?.nom ? getInitials(item.matiere.nom) : 'SM'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.examName}>{item.matiere?.nom || 'Sans matière'}</Text>
                  <Text style={styles.examDate}>
                    Date: {item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
              </View>
              <View style={styles.participantsBadge}>
                <Text style={styles.participantsText}>
                  {item.notes?.length ?? 0} participants
                </Text>
              </View>
            </Pressable>
          </Link>
        )}
        contentContainerStyle={examens.length === 0 ? styles.emptyState : styles.listContent}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun examen trouvé</Text>
          </View>
        }
      />

      <Link href="/examens/create" asChild>
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
  examCard: {
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
  examInfo: {
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
  examName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  examDate: {
    fontSize: 14,
    color: '#718096',
  },
  participantsBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  participantsText: {
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
