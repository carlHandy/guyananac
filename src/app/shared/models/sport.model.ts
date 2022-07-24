import { Association } from './association.model';
import { Athlete } from './athlete.model';

export interface Sport {
    id: number;
    name: string;
    association: Association;
    athletes: Athlete[];
}