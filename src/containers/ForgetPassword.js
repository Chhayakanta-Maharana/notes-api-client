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
        return confirmationCode.length > 0 && password.length > 0;
    }

    function handleEmailChange(e) {
        setEmail(e.target.value);
    }
    function handlePasswordChange(e) {
        setPassword(e.target.value);
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

    function handleConfirmPasswordChange(e) {
        setConfirmPassword(e.target.value);
    }

    async function handleConfirmationSubmit(e) {
        e.preventDefault();
        setIsLoading(true);
        try {
            await Auth.forgotPasswordSubmit(email, confirmationCode, password);

            history.push("/login");
        } catch (e) {
            alert(e);
            setIsLoading(false);
        }
    }

    function renderForm() {
        return (
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="email" size="lg">
                    <Form.Label>Enter your Email: </Form.Label>
                    <Form.Control
                        autoFocus
                        type="email"
                        value={email}
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
                    Send Code
                </LoaderButton>
            </Form>
        );
    }

    function renderConfirmationForm() {
        return (
            <Form onSubmit={handleConfirmationSubmit}>
                <Form.Group controlId="confirmationCode" size="lg">
                    <Form.Label>Confirmation Code</Form.Label>
                    <Form.Control
                        autoFocus
                        type="tel"
                        onChange={handleCodeChange}
                        value={confirmationCode}
                    />
                    <Form.Text muted>Please check your email for the code.</Form.Text>
                </Form.Group>
                <Form.Group controlId="password" size="lg">
                    <Form.Label>New Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                    />
                </Form.Group>
                <Form.Group controlId="password" size="lg">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                    />
                </Form.Group>
                <LoaderButton
                    block
                    size="lg"
                    type="submit"
                    variant="success"
                    isLoading={isLoading}
                    disabled={!validateConfirmationForm()}
                >
                    Submit
                </LoaderButton>
            </Form>
        );
    }

    return (
        <div className="Forget">
            <h2 className="text-center">Forget Password</h2>
            {newUser === null ? renderForm() : renderConfirmationForm()}
        </div>
    );
}