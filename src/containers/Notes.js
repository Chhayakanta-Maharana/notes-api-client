import React, { useRef, useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { API, Storage } from "aws-amplify";
import { onError } from "../libs/errorLib";
import LoaderButton from "../components/LoaderButton";
import { s3Upload } from "../libs/awsLib";
import config from "../config";
import Form from "react-bootstrap/Form"; // Ensure this import is present
import "./Notes.css";

export default function Notes() {
    const file = useRef(null);
    const { id } = useParams();
    const history = useHistory();
    const [note, setNote] = useState(null);
    const [content, setContent] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async function onLoad() {
            try {
                const fetchedNote = await API.get("notes", `/notes/${id}`);
                const { content, attachment } = fetchedNote;

                if (attachment) {
                    fetchedNote.attachmentURL = await Storage.vault.get(attachment);
                }

                setContent(content);
                setNote(fetchedNote);
            } catch (e) {
                onError(e);
            }
        }
        onLoad();
    }, [id]);

    function validateForm() {
        return content.length > 0;
    }

    function handleFileChange(event) {
        file.current = event.target.files[0];
    }

    async function handleSubmit(event) {
        event.preventDefault();

        let attachment;

        if (file.current && file.current.size > config.MAX_ATTACHMENT_SIZE) {
            alert(
                `Please pick a file smaller than ${config.MAX_ATTACHMENT_SIZE / 1000000
                } MB.`
            );
            return;
        }

        setIsLoading(true);

        try {
            if (file.current) {
                attachment = await s3Upload(file.current);
            }

            await API.put("notes", `/notes/${id}`, {
                body: {
                    content,
                    attachment: attachment || note.attachment,
                },
            });

            setIsEditing(false);
            history.push("/");
        } catch (e) {
            onError(e);
            setIsLoading(false);
        }
    }

    function renderNoteView() {
        return (
            <div className="note-view">
                <div className="note-view-card">
                <h1 className="note-title">{content.split("\n")[0]}</h1>
                    {note.attachmentURL && (
                        <img
                            src={note.attachmentURL}
                            alt="Note attachment"
                            className="note-image-large"
                        />
                    )}
                    <div className="note-view-content">

                        <LoaderButton
                            size="lg"
                            onClick={() => setIsEditing(true)}
                            className="edit-button mt-3"
                        >
                            Edit
                        </LoaderButton>
                    </div>
                </div>
            </div>
        );
    }



    function renderEditForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="content">
                    <Form.Label>Note Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </Form.Group>
                <Form.Group controlId="file">
                    <Form.Label>Attachment</Form.Label>
                    {note.attachment && (
                        <p>
                            <a
                                target="_blank"
                                rel="noopener noreferrer"
                                href={note.attachmentURL}
                            >
                                {note.attachment}
                            </a>
                        </p>
                    )}
                    <input type="file" onChange={handleFileChange} />
                </Form.Group>
                <LoaderButton
                    block
                    size="lg"
                    type="submit"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    Save
                </LoaderButton>
                <LoaderButton
                    block
                    size="lg"
                    variant="secondary"
                    onClick={() => setIsEditing(false)}
                    className="mt-2"
                >
                    Cancel
                </LoaderButton>
            </Form>
        );
    }

    return (
        <div className="Notes">
            {note ? (
                isEditing ? renderEditForm() : renderNoteView()
            ) : (
                <p>Loading note...</p>
            )}
        </div>
    );
}
