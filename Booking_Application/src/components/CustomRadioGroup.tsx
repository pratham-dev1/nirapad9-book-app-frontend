import React, { ChangeEvent } from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, RadioGroupProps } from '@mui/material';

interface CustomRadioButtonProps extends RadioGroupProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  row?: boolean;
  sx?: object;
  className?: string;
  disabled?: boolean;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({
  label,
  options,
  value,
  onChange,
  row,
  sx,
  className,
  disabled = false,
  ...props
}) => {
  return (
    <FormControl component="fieldset" sx={sx} className={className}>
      <FormLabel component="legend">{label}</FormLabel>
      <RadioGroup
        row={row}
        value={value}
        onChange={onChange}
        sx={sx}
        {...props}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio disabled={disabled} />}
            label={option.label}
            disabled={disabled}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default CustomRadioButton;
