
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
            await Auth.verifyCurrentUserAttributeSubmit('email', confirmationCode);
            alert("Email Updated!,Please Login Again");
            handleLogout();
        } catch (error) {
            alert(e);
            setIsLoading(false);
        }
    }
    function renderForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" size="lg">
                    <Form.Label>Enter your new Email: </Form.Label>
                    <Form.Control
                        autoFocus
                        type="email"
                        value={newEmail}
                        onChange={handleEmailChange}
                    />
                </Form.Group>

                <LoaderButton
                    block
                    size="lg"
                    type="submit"
                    variant="success"
                    isLoading={isLoading}
                    disabled={!validateForm()}
                >
                    Update Email
                </LoaderButton>
            </Form>
        );
    }

    function renderConfirmationForm() {
        return (
            <div className="confirmation-card card">
                <div className="confirmation-header">
                    <span role="img" aria-label="mail" className="confirmation-icon">📧</span>
                    <h4>Verify Your Email</h4>
                    <p className="confirmation-desc">Enter the confirmation code sent to your new email address.</p>
                </div>
                <Form onSubmit={handleConfirmationSubmit} className="confirmation-form">
                    <Form.Group controlId="confirmationCode" size="lg" className="mb-3">
                        <Form.Label className="confirmation-label">Confirmation Code</Form.Label>
                        <Form.Control
                            autoFocus
                            type="tel"
                            onChange={handleCodeChange}
                            value={confirmationCode}
                            className="confirmation-input"
                            placeholder="Enter code"
                        />
                        <Form.Text muted className="confirmation-hint">Please check your email for the code.</Form.Text>
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
                        Verify
                    </LoaderButton>
                </Form>
            </div>
        );
    }

    return (
        <div className="EmailChange">
            <h2 className="text-center">Update Email</h2>

            {newUser === null ? renderForm() : renderConfirmationForm()}
        </div>
    );
}