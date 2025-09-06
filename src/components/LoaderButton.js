import React from "react";
import Button from "react-bootstrap/Button";
import { BsArrowRepeat } from "react-icons/bs";
import "./LoaderButton.css";
export default function LoaderButton({
    isLoading,
    className = "",
    disabled = false,
    block = false, // Default value for block
    ...props
}) {
    return (
        <Button
            disabled={disabled || isLoading}
            className={`LoaderButton ${className}`}
            block={!!block} // Ensure block is always a boolean
            {...props}
        >
            {isLoading && <BsArrowRepeat className="spinning" />}
            {props.children}
        </Button>
    );
}

