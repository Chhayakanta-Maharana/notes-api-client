import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import "./EmailUpdate.css";

export default function EmailUpdate() {
  const history = useHistory();
  const { userHasAuthenticated } = useAppContext();
  const [newUser, setNewUser] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newEmail, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function validateForm() {
    return newEmail.length > 0;
  }

  async function handleLogout() {
    await Auth.signOut();
    userHasAuthenticated(false);
    history.push("/login");
  }

  function validateConfirmationForm() {
    return confirmationCode.length > 0;
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const user = await Auth.currentAuthenticatedUser();
      await Auth.updateUserAttributes(user, { email: newEmail });
      setIsLoading(false);
      setNewUser(user);
    } catch (e) {
      alert(e);
      setIsLoading(false);
    }
  }

  function handleCodeChange(e) {
    setConfirmationCode(e.target.value);
  }

  async function handleConfirmationSubmit(e) {
    e.preventDefault();
    setIsLoading(true);

    try {
      await Auth.verifyCurrentUserAttributeSubmit("email", confirmationCode);
      alert("✅ Email updated! Please login again.");
      handleLogout();
    } catch (error) {
      alert(error);
      setIsLoading(false);
    }
  }

  function renderForm() {
    return (
      <Form onSubmit={handleSubmit} className="update-form">
        <Form.Group controlId="email" size="lg">
          <Form.Label>Enter your new email</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={newEmail}
            onChange={handleEmailChange}
            placeholder="example@domain.com"
          />
        </Form.Group>

        <LoaderButton
          block
          size="lg"
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
          className="update-btn"
        >
          Update Email
        </LoaderButton>
      </Form>
    );
  }

  function renderConfirmationForm() {
    return (
      <div className="confirmation-card card animate-pop">
        <div className="confirmation-header">
          <span role="img" aria-label="mail" className="confirmation-icon">
            📩
          </span>
          <h4>Verify Your Email</h4>
          <p className="confirmation-desc">
            We’ve sent a confirmation code to <b>{newEmail}</b>.
          </p>
        </div>
        <Form
          onSubmit={handleConfirmationSubmit}
          className="confirmation-form"
        >
          <Form.Group
            controlId="confirmationCode"
            size="lg"
            className="mb-3"
          >
            <Form.Label className="confirmation-label">
              Confirmation Code
            </Form.Label>
            <Form.Control
              autoFocus
              type="tel"
              onChange={handleCodeChange}
              value={confirmationCode}
              className="confirmation-input"
              placeholder="Enter code"
            />
            <Form.Text muted className="confirmation-hint">
              Please check your inbox (and spam folder).
            </Form.Text>
          </Form.Group>
          <LoaderButton
            block
            size="lg"
            type="submit"
            variant="success"
            isLoading={isLoading}
            disabled={!validateConfirmationForm()}
            className="confirmation-btn"
          >
            Verify Email
          </LoaderButton>
        </Form>
      </div>
    );
  }

  return (
    <div className="EmailChange">
      <h2 className="email-header">Update Email</h2>
      {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}
