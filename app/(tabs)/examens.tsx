import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Examen } from '../../services/type';

export default function ExamensScreen() {
    const [examens, setExamens] = useState<(Examen & { matiere?: { nom: string } })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getExamens, getMatiere } = useApi();
    const router = useRouter();
        const getMatiereById = async (id: number) => {
            try {
                const response = await getMatiere(id);
                return response.data;
            } catch (error) {
                console.error('Failed to fetch matiere:', error);
                return { nom: 'Matière inconnue' }; // Retourne un objet par défaut
            }
        };
    useEffect(() => {
        const fetchExamens = async () => {
            try {
                setLoading(true);
                const response = await getExamens();
                const examensData = response.data;

                // On récupère les matières pour chaque examen
                const examensWithMatieres = await Promise.all(
                    examensData.map(async (examen: Examen) => {
                        const matiere = examen.matiere_id ? await getMatiereById(examen.matiere_id) : null;
                        return {
                            ...examen,
                            matiere: matiere || { nom: 'Sans matière' }, // Valeur par défaut
                        };
                    })
                );

                setExamens(examensWithMatieres);
                setError(null);
            } catch (err) {
                console.error('Fetch examens error:', err);
                setError('Échec du chargement des examens');
            } finally {
                setLoading(false);
            }
        };

        fetchExamens();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await getExamens();
            const examensData = response.data;

            const examensWithMatieres = await Promise.all(
                examensData.map(async (examen: Examen) => {
                    const matiere = examen.matiere_id ? await getMatiereById(examen.matiere_id) : null;
                    return {
                        ...examen,
                        matiere: matiere || { nom: 'Sans matière' },
                    };
                })
            );

            setExamens(examensWithMatieres);
            setError(null);
        } catch (err) {
            console.error('Refresh error:', err);
            setError('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    if (loading && examens.length === 0) {
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
                data={examens}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Link href={`/examens/${item.id}`} asChild>
                        <Pressable>
                            <ListItem
                                title={item.matiere?.nom || 'Sans matière'}
                                subtitle={`Date: ${item.date ? new Date(item.date).toLocaleDateString() : 'N/A'}`}
                                rightContent={
                                    <Text style={styles.date}>
                                        {item.notes?.length || 0} participants
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
                        <Text>Aucun examen trouvé</Text>
                    </View>
                }
            />

            <Link href="/examens/create" asChild>
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