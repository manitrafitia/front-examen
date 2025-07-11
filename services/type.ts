export interface Eleve {
    id: number;
    nom: string;
    prenom: string;
    classe: string;
    createdAt?: string; 
    updatedAt?: string;
}

export interface EleveCreate {
    nom: string;
    prenom: string;
    classe: string;
}

export interface EleveUpdate extends Partial<EleveCreate> { }

export interface Matiere {
    id: number;
    nom: string;
    examens?: Examen[];
    notes?: Note[];
}

export interface MatiereCreate {
    nom: string;
}

export interface MatiereUpdate extends Partial<MatiereCreate> { }

export interface Examen {
    id: number;
    matiere_id: number;
    matiere: Matiere;
    date: string;
    notes?: Note[];
}

export interface ExamenCreate {
    matiere_id: number;
    date: string;
}

export interface ExamenUpdate extends Partial<ExamenCreate> { }

export interface Note {
    id: number;
    eleve_id: number;
    examen_id: number;
    valeur: number;
    matiere_id: number;
}

export interface NoteCreate {
    eleve_id: number;
    examen_id: number;
    valeur: number;
    matiere_id: number;
}

export interface NoteUpdate extends Partial<NoteCreate> { }

export interface ApiResponse<T> {
    data: T;
    message?: string;
}