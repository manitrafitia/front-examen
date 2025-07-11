import { useFocusEffect } from '@react-navigation/native';
import { Link, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import { useApi } from '../../hooks/useApi';
import { Eleve } from '../../services/type';

const NIVEAUX = ['Tous', 'L1', 'L2', 'L3', 'M1', 'M2'];

export default function ElevesScreen() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [filteredEleves, setFilteredEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNiveau, setSelectedNiveau] = useState<string>('Tous');
  const { getEleves } = useApi();
  const router = useRouter();

  const fetchEleves = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getEleves();
      setEleves(response.data);
      setError(null);
    } catch (err) {
      setError('Échec du chargement des élèves');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getEleves]);

  useFocusEffect(
    useCallback(() => {
      fetchEleves();
    }, [fetchEleves])
  );

  useEffect(() => {
    if (selectedNiveau === 'Tous') {
      setFilteredEleves(eleves);
    } else {
      setFilteredEleves(eleves.filter(eleve => eleve.classe === selectedNiveau));
    }
  }, [selectedNiveau, eleves]);

  const handleRefresh = async () => {
    await fetchEleves();
  };

  if (loading && eleves.length === 0) {
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
      <View style={styles.header}>
        <Text style={styles.title}>Élèves</Text>
        <View style={styles.filterContainer}>
          {NIVEAUX.map((niveau) => (
            <Pressable
              key={niveau}
              style={[
                styles.filterPill,
                selectedNiveau === niveau && styles.filterPillActive,
              ]}
              onPress={() => setSelectedNiveau(niveau)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedNiveau === niveau && styles.filterTextActive,
                ]}
              >
                {niveau}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredEleves}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/eleves/${item.id}`} asChild>
            <Pressable style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <View style={styles.initialCircle}>
                  <Text style={styles.initialText}>
                    {item.prenom.charAt(0)}
                    {item.nom.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.studentName}>
                    {item.prenom} {item.nom}
                  </Text>
                  <Text style={styles.studentLevel}>{item.classe}</Text>
                </View>
              </View>
              <View style={styles.idBadge}>
                <Text style={styles.idText}>#{item.id}</Text>
              </View>
            </Pressable>
          </Link>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Aucun élève trouvé</Text>
          </View>
        }
      />

      <Link href="/eleves/create" asChild>
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
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDF2F7',
  },
  filterPillActive: {
    backgroundColor: '#2D3748',
  },
  filterText: {
    color: '#4A5568',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  studentCard: {
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
  studentInfo: {
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
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2D3748',
    marginBottom: 4,
  },
  studentLevel: {
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
