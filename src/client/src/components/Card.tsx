import { Note } from "../models/Note";

type CardProps = {
  note: Note;
  updateNote: (id: string, fn: (n: Note) => Note) => void;
  quickActions?: JSX.Element;
};

function Card(props: CardProps) {
  const { note } = props;
  
  function displayTimestamp(timestamp: number) {
    const today = new Date();
    const thisYear = today.getFullYear();
    const thisMonth = today.getMonth();
    const thisDay = today.getDate();
    const noteDate = new Date(timestamp);
    const noteYear = noteDate.getFullYear();
    const noteMonth = noteDate.getMonth();
    const noteDay = noteDate.getDate();

    let months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]
    if (noteYear === thisYear && noteMonth === thisMonth && noteDay === thisDay) {
      return `${noteDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })}`;
    } else if (noteYear === thisYear) {
      return `${months[noteMonth]} ${noteDay}`;
    } else {
      return `${months[noteMonth]} ${noteDay}, ${noteYear}`;
    }
  }

  return (
    <div id={note.id} className="card">
      <header>
          <div className="details">
            <p className="date">{displayTimestamp(note.createdDate)}</p>
          </div>
      </header>
      <main>
        <p className="text">{note.text}</p>
      </main>
      <footer>
        {props.quickActions}
      </footer>
    </div>
  );
}

export default Card;
