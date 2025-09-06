import React, { useState, useEffect } from "react";
import ListGroup from "react-bootstrap/ListGroup";
import { useAppContext } from "../libs/contextLib";
import { onError } from "../libs/errorLib";
import { Auth, API, Storage } from "aws-amplify";
import { BsPencilSquare } from "react-icons/bs";
import { LinkContainer } from "react-router-bootstrap";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Spinner from "react-bootstrap/Spinner";
import Modal from "react-bootstrap/Modal";
import "./Home.css";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [greet, setGreet] = useState("");
  const { isAuthenticated } = useAppContext();
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  useEffect(() => {
    async function onLoad() {
      if (!isAuthenticated) return;
      try {
        const notes = await API.get("notes", "/notes");
        const user = await Auth.currentAuthenticatedUser();
        setGreet(user.attributes.email);

        // 🔑 Resolve signed URLs for attachments
        const notesWithURLs = await Promise.all(
          notes.map(async (note) => {
            if (note.attachment) {
              try {
                note.attachmentURL = await Storage.vault.get(note.attachment);
              } catch (err) {
                console.warn("Failed to load attachment:", err);
                note.attachmentURL = null;
              }
            }
            return note;
          })
        );

        setNotes(notesWithURLs);
        setFilteredNotes(notesWithURLs);
      } catch (e) {
        onError(e);
      }
      setIsLoading(false);
    }
    onLoad();
  }, [isAuthenticated]);

  function handleSearch(event) {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredNotes(
      notes.filter(
        (note) =>
          note.content.toLowerCase().includes(term) ||
          (note.attachment &&
            typeof note.attachment === "string" &&
            note.attachment.toLowerCase().includes(term))
      )
    );
  }

  async function handleDeleteConfirmed() {
    if (!noteToDelete) return;
    try {
      await API.del("notes", `/notes/${noteToDelete.noteId}`);
      setNotes((prev) => prev.filter((n) => n.noteId !== noteToDelete.noteId));
      setFilteredNotes((prev) =>
        prev.filter((n) => n.noteId !== noteToDelete.noteId)
      );
    } catch (e) {
      onError(e);
    }
    setNoteToDelete(null);
  }

  async function handleDeleteAllConfirmed() {
  if (!notes.length) return;

  try {
    // Delete each note one by one
    await Promise.all(
      notes.map((note) => API.del("notes", `/notes/${note.noteId}`))
    );

    // Clear frontend state
    setNotes([]);
    setFilteredNotes([]);
  } catch (e) {
    onError(e);
  }

  setShowDeleteAllModal(false);
}

   
  

  function renderNotesList(notes) {
    if (!notes.length) {
      return (
        <div className="empty-state text-center">
          <img
            src="/empty-notes.svg"
            alt="No notes"
            className="empty-state-img"
          />
          <p className="mt-3 text-muted">
            No notes yet. Create your first one!
          </p>
        </div>
      );
    }

    return (
      <div className="notes-grid">
        {notes.map(({ noteId, content, attachmentURL }) => {
          const safeContent =
            typeof content === "string" ? content.trim() : "Untitled Note";

          return (
            <div key={noteId} className="note-card">
              {attachmentURL ? (
                <img
                  src={attachmentURL}
                  alt={safeContent.split("\n")[0]}
                  className="note-image"
                  onError={(e) => (e.target.src = "/default-image.png")}
                />
              ) : (
                <div className="note-image placeholder">📝</div>
              )}

              <div className="note-content">{safeContent.split("\n")[0]}</div>

              <div className="note-actions">
                <LinkContainer to={`/notes/${noteId}`}>
                  <Button variant="primary" size="sm">
                    Show
                  </Button>
                </LinkContainer>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() =>
                    setNoteToDelete({ noteId, content: safeContent })
                  }
                >
                  Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderLander() {
    return (
      <div className="lander">
        <h1 className="lander-title">Welcome to NoteApp</h1>
        <p className="lander-description text-muted">
          A simple, efficient, and secure note-taking application to organize
          your ideas.
        </p>
        <div className="box d-flex justify-content-center">
          <LinkContainer to="/signup">
            <Button variant="success" size="lg" className="mr-3">
              Sign Up
            </Button>
          </LinkContainer>
          <LinkContainer to="/login">
            <Button variant="primary" size="lg">
              Log In
            </Button>
          </LinkContainer>
        </div>
      </div>
    );
  }

  function renderNotes() {
    return (
      <div className="notes">
        <h2>
          Welcome, <span>{greet}</span>
        </h2>
        <h2 className="pb-3 mt-4 mb-3 border-bottom">Your Notes</h2>

        <Form className="mb-3 d-flex w-100 align-items-center">
          <Form.Control
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <div className="d-flex w-50 align-items-center">
            <LinkContainer to="/notes/new" className="flex-grow-1">
              <ListGroup.Item action className="create-note-button">
                <BsPencilSquare size={17} />
                <span className="ml-2">Create Note</span>
              </ListGroup.Item>
            </LinkContainer>
            <ListGroup.Item
              action
              className="delete-all-button flex-grow-1"
              onClick={() => setShowDeleteAllModal(true)}
            >
              Delete All Notes
            </ListGroup.Item>
          </div>
        </Form>

        {isLoading ? (
          <div className="text-center">
            <Spinner animation="border" />
            <p>Loading notes...</p>
          </div>
        ) : (
          <ListGroup>{renderNotesList(filteredNotes)}</ListGroup>
        )}
      </div>
    );
  }

  return (
    <div className="Home">
      {isAuthenticated ? renderNotes() : renderLander()}

      {/* Confirm Delete Single Note */}
      <Modal
        show={!!noteToDelete}
        onHide={() => setNoteToDelete(null)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Note</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete{" "}
          <strong>{noteToDelete?.content?.split("\n")[0]}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setNoteToDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirmed}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Delete All Notes */}
      <Modal
        show={showDeleteAllModal}
        onHide={() => setShowDeleteAllModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete All Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This will permanently remove <strong>all your notes</strong>. Are you
          sure?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDeleteAllModal(false)}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteAllConfirmed}>
            Delete All
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
