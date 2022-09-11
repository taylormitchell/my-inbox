import { v4 as uuidv4 } from "uuid";

export type Note = {
  id: string;
  text: string;
  interval: number;
  createdDate: number;
  lastModifiedDate: number;
  dueDate: number;
  state: "Active" | "Archive";
};

export function create(note: Partial<Note>): Note {
  const now = Date.now();
  const tomorrow = now + 24*60*60*1000;

  return {
    id: note.id || uuidv4(),
    text: note.text || "",
    interval: note.interval || 1,
    createdDate: note.createdDate || now,
    lastModifiedDate: note.lastModifiedDate || now,
    dueDate: note.dueDate || now,
    state: note.state || "Active",
  };
}

export function keep(note: Note): Note {
  const dayInMilliseconds = 24 * 60 * 60 * 1000;
  const lastModifiedDate = Date.now();
  const interval = (2 + Math.random() / 2) * note.interval;
  const dueDate = Math.round(Date.now() + note.interval*dayInMilliseconds);
  return { ...note, lastModifiedDate, dueDate, interval };
}

export function archive(note: Note): Note {
  return { ...note, state: "Archive" };
}

export default Note;
