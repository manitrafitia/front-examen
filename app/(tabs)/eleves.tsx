import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Easing, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
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
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const response = await getEleves();
        setEleves(response.data);
        setFilteredEleves(response.data);
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, []);

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
    console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && eleves.length === 0) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6D28D9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <MaterialIcons name="error-outline" size={48} color="#EF4444" style={styles.errorIcon} />
        <Text style={styles.error}>{error}</Text>
        <CustomButton 
          title="Retry" 
          onPress={handleRefresh} 
          variant="primary"
          icon={<MaterialIcons name="refresh" size={20} color="white" />}
        />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Students List</Text>
      </View>

      {/* Class filter selector */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by class:</Text>
        <View style={styles.filterButtons}>
          {CLASS_OPTIONS.map((classOption) => (
            <Pressable
              key={classOption}
              style={({ pressed }) => [
                styles.filterButton,
                selectedClass === classOption && styles.filterButtonActive,
                pressed && styles.filterButtonPressed
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

      {/* Students list */}
      <FlatList
        data={filteredEleves}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/eleves/${item.id}`} asChild>
            <Pressable>
              {({ pressed }) => (
                <View style={[styles.listItemContainer, pressed && styles.listItemPressed]}>
                  <ListItem 
                    title={`${item.prenom} ${item.nom}`}
                    subtitle={`Class: ${item.classe}`}
                    rightContent={
                      <View style={styles.dateContainer}>
                        <MaterialIcons name="event" size={14} color="#6B7280" />
                        <Text style={styles.date}>
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''}
                        </Text>
                      </View>
                    }
                  />
                </View>
              )}
            </Pressable>
          </Link>
        )}
        refreshing={loading}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="school" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No students found{selectedClass !== 'All' ? ` in ${selectedClass}` : ''}</Text>
          </View>
        }
      />

      {/* Add button */}
      <Link href="/eleves/create" asChild>
        <Pressable style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed]}>
          <MaterialIcons name="add" size={28} color="white" />
        </Pressable>
      </Link>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: '#6D28D9',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 16,
  },
  error: {
    color: '#EF4444',
    fontSize: 18,
    marginBottom: 24,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 20,
  },
  listItemContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  listItemPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    color: '#6B7280',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#6D28D9',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  addButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#5B21B6',
  },
  filterContainer: {
    padding: 16,
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#374151',
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EDE9FE',
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#6D28D9',
  },
  filterButtonPressed: {
    transform: [{ scale: 0.96 }],
  },
  filterButtonText: {
    color: '#6D28D9',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});