import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Eleve } from '../../services/type';

export default function ElevesScreen() {
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getEleves } = useApi();
  const router = useRouter();

  useEffect(() => {
    const fetchEleves = async () => {
      try {
        const response = await getEleves();
        setEleves(response.data);
      } catch (err) {
        setError('Failed to load students');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEleves();
  }, []);

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
      <FlatList
        data={eleves}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Link href={`/eleves/${item.id}`} asChild>
            <Pressable>
              <ListItem 
                title={`${item.prenom} ${item.nom}`}
                subtitle={`Class: ${item.classe}`}
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
            <Text>No students found</Text>
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
});