import { useState } from "react";
import "./App.css";
import { Note, create as createNote } from "./models/Note";
import All from "./components/All";
import Inbox from "./components/Inbox";
import Entry from "./components/Entry";
import { usePersistedObjects } from "./usePersistedObjects";

function App() {
  const [objects, mergeIntoObjects] = usePersistedObjects();
  const [noteForm, setNoteForm] = useState<{ text: string } & Partial<Note>>({ text: "" });

  const notes = Object.values(objects) as Note[];

  const updateNote = (id: string, fn: (n: Note) => Note) => {
    mergeIntoObjects((objects) => {
      let note = objects[id] as Note;
      if (!note) throw new Error("Note not found");
      return { [id]: fn(note) };
    });
  };

  const addNote = (partialNote: Partial<Note>) => {
    mergeIntoObjects((objects) => {
      const note = createNote(partialNote);
      return { [note.id]: note };
    });
  };

  const updateNoteForm = (values: Partial<Note>) => {
    setNoteForm((noteForm) => {
      return { ...noteForm, ...values };
    });
  };
  const submitNoteForm = () => {
    addNote(noteForm);
    setNoteForm({ text: "" });
  };

  type View = "all" | "inbox" | "entry";
  const [view, setView] = useState<View>("all");

  // Set inbox notes
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  const inboxNotes = notes.filter((n) => n.dueDate <= tomorrow && n.state === "Active");

  const [entryOpen, setEntryOpen] = useState(false);
  // if (!notesConnected) {
  //   return <div>Can't connect to server, no app for you :(</div>;
  // }
  return (
    <div className="App">
      <main>
        {view === "all" && <All notes={notes} updateNote={updateNote} />}
        {view === "inbox" && <Inbox inboxNotes={inboxNotes} updateNote={updateNote} />}
        {entryOpen ? (
          <Entry
            noteForm={noteForm}
            updateNoteForm={updateNoteForm}
            submitNoteForm={submitNoteForm}
            closeEntry={() => setEntryOpen(false)}
          />
        ) : (
          <div id="create-button" onClick={() => setEntryOpen(true)}>
            +
          </div>
        )}
      </main>
      {!entryOpen && (
        <nav>
          <button className={view === "all" ? "selected" : ""} onClick={() => setView("all")}>
            All
          </button>
          <button className={view === "inbox" ? "selected" : ""} onClick={() => setView("inbox")}>
            Inbox
          </button>
        </nav>
      )}
    </div>
  );
}

export default App;
