import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Matiere } from '../../services/type';

export default function MatieresScreen() {
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getMatieres } = useApi();
  const router = useRouter();

  useEffect(() => {
    const fetchMatieres = async () => {
      try {
        const response = await getMatieres();
        setMatieres(response.data);
      } catch (err) {
        setError('Failed to load subjects');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatieres();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await getMatieres();
      setMatieres(response.data);
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  if (loading && matieres.length === 0) {
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
      <FlatList
        data={matieres}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/matieres/${item.id}`} asChild>
            <Pressable>
              <ListItem 
                title={item.nom}
                subtitle={`${item.examens?.length || 0} examens`}
                rightContent={
                  <Text style={styles.count}>
                    {item.notes?.length || 0} notes
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
            <Text>No subjects found</Text>
          </View>
        }
      />

      <Link href="/matieres/create" asChild>
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
  count: {
    color: '#666',
    fontSize: 12,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'green', // Différent de la couleur des élèves
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
});