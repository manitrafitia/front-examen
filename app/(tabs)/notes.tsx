import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import CustomButton from '../../components/CustomButton';
import ListItem from '../../components/ListItem';
import { useApi } from '../../hooks/useApi';
import { Eleve, Examen, Note } from '../../services/type';

export default function NotesScreen() {
    const [notes, setNotes] = useState<(Note & {
        eleve?: Partial<Eleve> & { fullName: string };
        examen?: Partial<Examen> & { matiereName: string; dateFormatted: string };
    })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('');
    const { getNotes, getEleve, getExamen, getMatiere } = useApi();
    const router = useRouter();

    const getEleveById = async (id: number) => {
        try {
            const response = await getEleve(id);
            return {
                ...(response.data || {}),
                fullName: response.data
                    ? `${response.data.prenom || ''} ${response.data.nom || ''}`.trim()
                    : 'Élève inconnu'
            };
        } catch (error) {
            console.error('Failed to fetch student:', error);
            return { fullName: 'Élève inconnu' };
        }
    };

    const getExamenById = async (id: number) => {
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
                    : 'Date inconnue'
            };
        } catch (error) {
            console.error('Failed to fetch exam:', error);
            return {
                matiereName: 'Matière inconnue',
                dateFormatted: 'Date inconnue'
            };
        }
    };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getNotes();
                const notesData = response.data;

                const notesWithDetails = await Promise.all(
                    notesData.map(async (note: Note) => {
                        const [eleve, examen] = await Promise.all([
                            getEleveById(note.eleve_id),
                            getExamenById(note.examen_id)
                        ]);

                        return {
                            ...note,
                            eleve,
                            examen
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
        };

        fetchNotes();
    }, []);

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const response = await getNotes();
            const notesData = response.data;

            const notesWithDetails = await Promise.all(
                notesData.map(async (note: Note) => {
                    const [eleve, examen] = await Promise.all([
                        getEleveById(note.eleve_id),
                        getExamenById(note.examen_id)
                    ]);

                    return {
                        ...note,
                        eleve,
                        examen
                    };
                })
            );

            setNotes(notesWithDetails);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Échec du rafraîchissement des données');
        } finally {
            setLoading(false);
        }
    };

    // FRONTEND FILTERING
    const filteredNotes = notes.filter(note => {
        const eleveName = note.eleve?.fullName?.toLowerCase() || '';
        const matiereName = note.examen?.matiereName?.toLowerCase() || '';
        const search = filter.toLowerCase();
        return eleveName.includes(search) || matiereName.includes(search);
    });

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
                    title="Réessayer"
                    onPress={handleRefresh}
                    variant="primary"
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.filterInput}
                placeholder="Filtrer par élève ou matière"
                value={filter}
                onChangeText={setFilter}
            />
            <FlatList
                data={filteredNotes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Link href={`/notes/${item.id}`} asChild>
                        <Pressable>
                            <ListItem
                                title={item.eleve?.fullName || 'Élève inconnu'}
                                subtitle={`${item.examen?.matiereName || 'Matière inconnue'} - ${item.valeur}/20`}
                                rightContent={
                                    <View style={styles.rightContent}>
                                        <Text style={styles.date}>
                                            {item.examen?.dateFormatted}
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
                        <Text>Aucune note trouvée</Text>
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
    filterInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        margin: 10,
        padding: 8,
        borderRadius: 5,
    },
});
