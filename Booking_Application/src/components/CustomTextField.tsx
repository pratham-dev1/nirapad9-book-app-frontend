import { TextField, TextFieldVariants } from "@mui/material";
import React, { ChangeEvent, SyntheticEvent } from "react";

interface TextFieldProps {
  size?: "small" | "medium";
  label: string;
  variant?: TextFieldVariants;
  type?: string;
  fullWidth?: boolean;
  sx?: object;
  className?: string;
  inputprops?: object
  value?: string | number
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  inputProps?: object;
  onInput?: (e: SyntheticEvent<HTMLInputElement>) => void;
  onBlur?: (e: any) => void;
}

const CustomTextField: React.FC<TextFieldProps> = ({
  size,
  label,
  variant = "outlined",
  type = "text",
  fullWidth,
  sx,
  className,
  inputprops,
  value,
  onChange,
  error,
  helperText,
  disabled,
  inputProps,
  onInput,
  onBlur
}) => {
  return (
    <TextField
      type={type}
      size={size || 'small'}
      label={label}
      variant={variant}
      fullWidth={fullWidth}
      sx={sx}
      className={className}
      InputProps={inputprops}
      value={value}
      onChange={onChange}
      error={error}
      helperText={helperText}
      disabled={disabled}
      inputProps={inputProps}
      onInput={onInput}
      onBlur={onBlur}
    />
  );
};

export default CustomTextField;
