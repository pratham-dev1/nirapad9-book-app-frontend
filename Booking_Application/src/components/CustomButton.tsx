import { Button } from "@mui/material";
import React, { ReactNode } from "react";

type ButtonColorProps = {
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
};

interface ButtonProps extends ButtonColorProps {
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  label: string;
  onClick?: () => void;
  fullWidth?: boolean;
  sx?: object;
  disabled?: boolean;
  startIcon?: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset" | undefined;
  name?: string
}

const CustomButton: React.FC<ButtonProps> = ({
  size,
  variant = "contained",
  label,
  onClick,
  fullWidth,
  sx,
  disabled,
  color,
  startIcon,
  className,
  type,
  name
}) => {
  return (
    <Button
      type={type}
      size={size || 'medium'}
      variant={variant || "contained"}
      onClick={onClick}
      fullWidth={fullWidth}
      sx={sx}
      disabled={disabled}
      color={color}
      startIcon={startIcon}
      className={className}
      name={name}
    >
      {label}
    </Button>
  );
};

export default CustomButton;
