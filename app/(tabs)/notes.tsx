import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Eleve, Examen, Note } from '../../services/type';

export default function NotesScreen() {
    const [notes, setNotes] = useState<(Note & { eleve?: Eleve; examen?: Examen })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { getNotes, getEleve, getExamen } = useApi();
    const router = useRouter();
    const { getMatiere } = useApi();

    useEffect(() => {
        const getEleveById = async (id: number) => {
            try {
                const response = await getEleve(id);
                return response.data;
            } catch (error) {
                console.error('Failed to fetch student:', error);
                return null;
            }
        };

        const getExamenById = async (id: number) => {
            try {
                const response = await getExamen(id);
                return response.data;
            } catch (error) {
                console.error('Failed to fetch exam:', error);
                return null;
            }
        };

        const getMatiereById = async (id: number) => {
            try {
                const response = await getMatiere(id);
                return response.data;
            } catch (error) {
                console.error('Failed to fetch matiere:', error);
                return null;
            }
        };
        const fetchNotes = async () => {
            try {
                const response = await getNotes();
                const notesData = response.data;

                const notesWithDetails = await Promise.all(
                    notesData.map(async (note: Note) => {
                        const [eleve, examen] = await Promise.all([
                            getEleveById(note.eleve_id),
                            getExamenById(note.examen_id)
                        ]);

                        let matiere = null;
                        if (examen?.matiere_id) {
                            matiere = await getMatiereById(examen.matiere_id);
                        }

                        return {
                            ...note,
                            eleve,
                            examen: {
                                ...examen,
                                matiere
                            }
                        };
                    })
                );

                setNotes(notesWithDetails);
            } catch (err) {
                setError('Failed to load grades');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await getNotes();
            setNotes(response.data);
        } catch (err) {
            setError('Failed to refresh data');
        } finally {
            setLoading(false);
        }
    };

    if (loading && notes.length === 0) {
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
                data={notes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Link href={`/notes/${item.id}`} asChild>
                        <Pressable>
                            <ListItem
                                title={`${item.eleve?.prenom || 'Student'} ${item.eleve?.nom || ''}`}
                                subtitle={`Exam: ${item.examen?.matiere?.nom || 'Unknown'} - ${item.valeur}/20`}
                                rightContent={
                                    <View style={styles.rightContent}>
                                        <Text style={styles.date}>
                                            {item.examen?.date ? new Date(item.examen.date).toLocaleDateString() : ''}
                                        </Text>
                                    </View>
                                }
                            />
                        </Pressable>
                    </Link>
                )}
                refreshing={loading}
                onRefresh={handleRefresh}
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text>No grades found</Text>
                    </View>
                }
            />

            <Link href="/notes/create" asChild>
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
    rightContent: {
        alignItems: 'flex-end',
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