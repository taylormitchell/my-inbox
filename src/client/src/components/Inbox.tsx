import Note from "../models/Note";
import Card from "../components/Card";
import * as actions from "../models/Note";
import React from "react";

type Props = {
  inboxNotes: Note[];
  updateNote: (id: string, fn: (n: Note) => Note) => void;
};

const Inbox = (props: Props) => {
  const { inboxNotes } = props;

  const keep = (id: string) => props.updateNote(id, actions.keep);
  const archive = (id: string) => props.updateNote(id, actions.archive);
  let quickActions = (id: string) => (
    <div className="quick-actions">
      <button onClick={() => keep(id)}>
        <img src={require("../assets/icons8-return-24.png")} alt="Keep" title="Keep" />
      </button>
      <button onClick={() => archive(id)}>
        <img src={require("../assets/icons8-box-24.png")} alt="Archive" title="Archive" />
      </button>
    </div>
  );

  return (
    <React.Fragment>
      <div className="inbox column">
        <p>Remaining: {inboxNotes.length}</p>
        {props.inboxNotes
          .sort((a, b) => b.dueDate - a.dueDate)
          .map((n) => (
            <Card
              key={n.id}
              note={n}
              updateNote={props.updateNote}
              quickActions={quickActions(n.id)}
            />
          ))}
      {inboxNotes.length === 0 && (
        <div id="done-message">
          <img src={require("../assets/checked.png")} />
          <p>All done!</p>
        </div>
        )}
      </div>
    </React.Fragment>
  );
};

export default Inbox;
