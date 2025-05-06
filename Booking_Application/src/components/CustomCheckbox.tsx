import * as React from "react";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";

type CheckboxProps = {
  label: string;
  onChange?: any;
  className?: string;
  checked?: boolean;
  labelPlacement?:"start" | "end" | "top" | "bottom" | undefined
};

const CustomCheckBox: React.FC<CheckboxProps> = ({
  label,
  onChange,
  className,
  checked,
  labelPlacement = "start"
}) => {
  return (
    <FormControl component="fieldset">
      <FormControlLabel
        value="value"
        control={<Checkbox onChange={onChange} />}
        label={label}
        labelPlacement={labelPlacement}
        className={className}
        checked={checked}
      />
    </FormControl>
  );
};

export default CustomCheckBox;
