import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Eleve } from '../../services/type';

// Define the available class options
const CLASS_OPTIONS = ['All', 'L1', 'L2', 'L3', 'M1', 'M2'];

export default function ElevesScreen() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [filteredEleves, setFilteredEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const { getEleves } = useApi();
  const router = useRouter();

  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const response = await getEleves();
        setEleves(response.data);
        setFilteredEleves(response.data); // Initialize filtered list with all students
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, []);

  // Filter students when selectedClass changes
  useEffect(() => {
    if (selectedClass === 'All') {
      setFilteredEleves(eleves);
    } else {
      setFilteredEleves(eleves.filter(eleve => eleve.classe === selectedClass));
    }
  }, [selectedClass, eleves]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getEleves();
      setEleves(response.data);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && eleves.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <CustomButton 
          title="Retry" 
          onPress={handleRefresh} 
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Class filter selector */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtre par niveau:</Text>
        <View style={styles.filterButtons}>
          {CLASS_OPTIONS.map((classOption) => (
            <Pressable
              key={classOption}
              style={[
                styles.filterButton,
                selectedClass === classOption && styles.filterButtonActive
              ]}
              onPress={() => setSelectedClass(classOption)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedClass === classOption && styles.filterButtonTextActive
              ]}>
                {classOption}
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
            <Pressable>
              <ListItem 
                title={`${item.prenom} ${item.nom}`}
                subtitle={`Niveau: ${item.classe}`}
                rightContent={
                  <Text style={styles.date}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                  </Text>
                }
              />
            </Pressable>
          </Link>
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text>No students found{selectedClass !== 'All' ? ` in ${selectedClass}` : ''}</Text>
          </View>
        }
      />

      <Link href="/eleves/create" asChild>
        <Pressable style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  date: {
    color: '#666',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'blue',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  addButtonText: {
    color: 'white',
    fontSize: 24,
    lineHeight: 28,
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: 'blue',
  },
  filterButtonText: {
    color: '#333',
  },
  filterButtonTextActive: {
    color: 'white',
  },
});