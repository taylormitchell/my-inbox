import { useState, useRef } from "react";
import Note from "../models/Note"
import React from "react";

type Props = {
  noteForm: Partial<Note>;
  updateNoteForm: (values: Partial<Note>) => void;
  submitNoteForm: () => void;
  closeEntry: () => void;
};
const Entry = (props: Props) => {
  const initialHeight = "auto"
  const [height, setHeight] = useState<string>(initialHeight);
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  const changeHandler = () => {
    let textArea = textAreaRef.current!;
    props.updateNoteForm({text: textArea.value });
    // setEntry(textArea.value);
    if(textArea.clientHeight < textArea.scrollHeight) {
      setHeight(textArea.scrollHeight + "px")
    } else if(textArea.value === "") {
      setHeight(initialHeight)
    }
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.submitNoteForm();
    setHeight(initialHeight)
    props.closeEntry();
  };

  const blurHandler = () => {
    if(props.noteForm.text === "") {
      props.closeEntry();
    }
  }

  return (
      <div className="entry"> 
        <button className="close-button" onClick={props.closeEntry}>x</button>
        <form onSubmit={submitHandler}>
          <textarea
            className="text"
            ref={textAreaRef}
            id="text"
            value={props.noteForm.text || ""}
            onChange={changeHandler}
            style={{height: height, overflowY: "hidden"}}
            autoFocus={true}
            onBlur={blurHandler}
          />
          <input type="submit" value="↑" />
        </form>
      </div>
  );
};

export default Entry;
