import Note from "../models/Note";
import Card from "./Card";

type Props = {
  notes: Note[];
  updateNote: (id: string, fn: (n: Note) => Note) => void;
};

const All = (props: Props) => {
  return (
    <div className="all column">
      {props.notes
        .slice()
        .reverse()
        .map((n) => (
          <Card key={n.id} note={n} updateNote={props.updateNote} />
        ))}
    </div>
  );
};

export default All;
