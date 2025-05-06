import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Dayjs } from "dayjs";
import * as React from "react";

interface TimePickerProps {
  label: string;
  size: "small" | "medium";
  sx?: object;
  style?: object;
  value?: any;
  minutesStep?: number;
  onChange?: (value: any) => void;
  minTime?: Dayjs;
  maxTime?: Dayjs;
  disabled?: boolean;
  className?: any;
  ampm?: boolean;
  timeSteps?: any;
  error?: boolean;
  helperText?: string
}

const CustomTimePicker: React.FC<TimePickerProps> = ({
  label,
  size,
  style,
  sx,
  value,
  minutesStep,
  onChange,
  minTime,
  maxTime,
  disabled,
  className,
  ampm,
  timeSteps,
  error,
  helperText
}) => {
  const defaultTime = new Date();
  defaultTime.setHours(12, 0, 0);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["TimePicker"]}>
        <div style={style}>
          <TimePicker
            label={label}
            slotProps={{ textField: { size: size, inputProps:{ readOnly: true }, error: error, helperText: helperText } }}
            minutesStep={minutesStep}
            closeOnSelect={false}
            ampm={ampm}
            skipDisabled
            value={value}
            onChange={onChange}
            minTime={minTime}
            maxTime={maxTime}
            disabled={disabled}
            className={className}
            sx={sx}
            timeSteps={timeSteps}
            // disablePast
          />
        </div>
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default CustomTimePicker;
