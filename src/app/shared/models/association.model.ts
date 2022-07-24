import { Contact } from "./contact.model";

export interface Association{
    id: number;
    name: string;
    contact: Contact;
}