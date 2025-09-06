import React, { useState } from "react";
import { Auth } from "aws-amplify";
import { useHistory } from "react-router-dom";
import Form from "react-bootstrap/Form";
import LoaderButton from "../components/LoaderButton";
import "./ForgetPassword.css";

export default function ForgetPassword() {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState(null);

  function validateForm() {
    return email.length > 0;
  }

  function validateConfirmationForm() {
    return (
      confirmationCode.length > 0 &&
      password.length > 0 &&
      password === confirmPassword
    );
  }

  function handleEmailChange(e) {
    setEmail(e.target.value);
  }
  function handlePasswordChange(e) {
    setPassword(e.target.value);
  }
  function handleConfirmPasswordChange(e) {
    setConfirmPassword(e.target.value);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await Auth.forgotPassword(email);
      setIsLoading(false);
      setNewUser(data);
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
      await Auth.forgotPasswordSubmit(email, confirmationCode, password);
      alert("✅ Password reset successfully. Please log in again.");
      history.push("/login");
    } catch (e) {
      alert(e);
      setIsLoading(false);
    }
  }

  function renderForm() {
    return (
      <Form onSubmit={handleSubmit} className="forget-form animate-pop">
        <Form.Group controlId="email" size="lg" className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            autoFocus
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@example.com"
          />
        </Form.Group>

        <LoaderButton
          block
          size="lg"
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={!validateForm()}
          className="forget-btn"
        >
          Send Code
        </LoaderButton>
      </Form>
    );
  }

  function renderConfirmationForm() {
    return (
      <Form
        onSubmit={handleConfirmationSubmit}
        className="forget-form animate-pop"
      >
        <Form.Group controlId="confirmationCode" size="lg" className="mb-3">
          <Form.Label>Confirmation Code</Form.Label>
          <Form.Control
            autoFocus
            type="tel"
            onChange={handleCodeChange}
            value={confirmationCode}
            placeholder="Enter the code"
          />
          <Form.Text muted className="forget-hint">
            Check your email (and spam folder) for the confirmation code.
          </Form.Text>
        </Form.Group>

        <Form.Group controlId="password" size="lg" className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
          />
        </Form.Group>

        <Form.Group controlId="confirmPassword" size="lg" className="mb-3">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Re-enter new password"
          />
        </Form.Group>

        <LoaderButton
          block
          size="lg"
          type="submit"
          variant="success"
          isLoading={isLoading}
          disabled={!validateConfirmationForm()}
          className="forget-btn"
        >
          Reset Password
        </LoaderButton>
      </Form>
    );
  }

  return (
    <div className="Forget">
      <h2 className="forget-header">🔒 Reset Password</h2>
      {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}
