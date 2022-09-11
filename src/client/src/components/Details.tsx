import Note from "../models/Note"

type Props = {
    details: Partial<Note>
}

const Details = (props: Props) => {
    const note = props.details

    return (
        <div className="details">
            {Object.entries(props.details).map(([key, value]) => {
                if(key.endsWith("Date")) {
                    value = new Date(value).toISOString()
                }
                return <p key={key}>{key}: {value}</p>
            })}
        </div>
    )
}

export default Details