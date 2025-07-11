import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import CustomButton from '../../components/CustomButton';
import { useApi } from '../../hooks/useApi';
import { Eleve, Examen, Note } from '../../services/type';

export default function NotesScreen() {
  const [notes, setNotes] = useState<
    (Note & {
      eleve?: Partial<Eleve> & { fullName: string };
      examen?: Partial<Examen> & { matiereName: string; dateFormatted: string };
    })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const { getNotes, getEleve, getExamen, getMatiere } = useApi();
  const router = useRouter();

  const getEleveById = useCallback(async (id: number) => {
    try {
      const response = await getEleve(id);
      return {
        ...(response.data || {}),
        fullName: response.data
          ? `${response.data.prenom || ''} ${response.data.nom || ''}`.trim()
          : 'Élève inconnu',
      };
    } catch (error) {
      console.error('Failed to fetch student:', error);
      return { fullName: 'Élève inconnu' };
    }
  }, [getEleve]);

  const getExamenById = useCallback(async (id: number) => {
    try {
      const response = await getExamen(id);
      const examen = response.data;
      let matiereName = 'Matière inconnue';

      if (examen?.matiere_id) {
        try {
          const matiereResponse = await getMatiere(examen.matiere_id);
          matiereName = matiereResponse.data?.nom || matiereName;
        } catch (error) {
          console.error('Failed to fetch matiere:', error);
        }
      }

      return {
        ...(examen || {}),
        matiereName,
        dateFormatted: examen?.date
          ? new Date(examen.date).toLocaleDateString()
          : 'Date inconnue',
      };
    } catch (error) {
      console.error('Failed to fetch exam:', error);
      return {
        matiereName: 'Matière inconnue',
        dateFormatted: 'Date inconnue',
      };
    }
  }, [getExamen, getMatiere]);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNotes();
      const notesData = response.data;

      const notesWithDetails = await Promise.all(
        notesData.map(async (note: Note) => {
          const [eleve, examen] = await Promise.all([
            getEleveById(note.eleve_id),
            getExamenById(note.examen_id),
          ]);

          return {
            ...note,
            eleve,
            examen,
          };
        })
      );

      setNotes(notesWithDetails);
    } catch (err) {
      console.error(err);
      setError('Échec du chargement des notes');
    } finally {
      setLoading(false);
    }
  }, [getNotes, getEleveById, getExamenById]);

  // Rafraîchir à chaque focus d'écran 
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [fetchNotes])
  );

  // Rafraîchissement manuel
  const handleRefresh = async () => {
    await fetchNotes();
  };

  // Filtrage frontend
  const filteredNotes = notes.filter((note) => {
    const eleveName = note.eleve?.fullName?.toLowerCase() || '';
    const matiereName = note.examen?.matiereName?.toLowerCase() || '';
    const search = filter.toLowerCase();
    return eleveName.includes(search) || matiereName.includes(search);
  });

  // Initiales pour affichage
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading && notes.length === 0) {
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
        <Text style={styles.title}>Notes</Text>
      </View>

      {/* Filtre */}
      <TextInput
        style={styles.filterInput}
        placeholder="Filtrer par élève ou matière"
        value={filter}
        onChangeText={setFilter}
        clearButtonMode="while-editing"
      />

      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/notes/${item.id}`} asChild>
            <Pressable style={styles.noteCard}>
              <View style={styles.noteInfo}>
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {item.eleve?.fullName ? getInitials(item.eleve.fullName) : 'EI'}
                  </Text>
                </View>
                <View>
                  <Text style={styles.noteTitle}>{item.eleve?.fullName || 'Élève inconnu'}</Text>
                  <Text style={styles.noteSubtitle}>
                    {item.examen?.matiereName || 'Matière inconnue'} - {item.valeur}/20
                  </Text>
                </View>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>{item.examen?.dateFormatted}</Text>
              </View>
            </Pressable>
          </Link>
        )}
        contentContainerStyle={filteredNotes.length === 0 ? styles.emptyState : styles.listContent}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucune note trouvée</Text>
          </View>
        }
      />

      <Link href="/notes/create" asChild>
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
  filterInput: {
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
    fontSize: 16,
    color: '#2D3748',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  noteCard: {
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
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  noteTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  noteSubtitle: {
    fontSize: 14,
    color: '#718096',
  },
  dateBadge: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  dateText: {
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
