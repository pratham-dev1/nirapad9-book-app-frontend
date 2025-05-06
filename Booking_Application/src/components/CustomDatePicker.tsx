import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs, { Dayjs } from "dayjs";
import * as React from "react";
import { AuthContext } from "../context/auth/AuthContext";

type DatePickerProps = {
  size: "small" | "medium";
  label: string;
  sx?: object;
  onChange?: any;
  className?: string;
  value?: Dayjs | Date | null;
  disablePast?: boolean
  disabled?: boolean;
  minDate?: Date | Dayjs | null;
  maxDate?: Date | Dayjs | null;
  error?: boolean;
  onMonthChange?: any;
  shouldDisableDate?: any;
  helperText?: string;
  disableFuture?: boolean;
};

const CustomDatePicker: React.FC<DatePickerProps> = ({
  size,
  label,
  sx,
  onChange,
  className,
  value,
  disablePast,
  disabled,
  minDate,
  error,
  shouldDisableDate,
  onMonthChange,
  helperText,
  maxDate,
  disableFuture
}) => {
  // const [value, setValue] = React.useState<Dayjs | null>(dayjs("2022-04-17"));
  const { state } = React.useContext(AuthContext);
  const system_timeZone = dayjs.tz.guess()
  const default_timeZone = state?.timezone ? state?.timezone.value : system_timeZone

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DemoContainer components={["DatePicker"]}>
        <DatePicker
          label={label}
          slotProps={{ textField: { size: size, inputProps: { readOnly: true }, error: error, helperText: helperText } }}
          sx={sx}
          value={value}
          onChange={onChange}
          format="DD/MM/YYYY"
          disablePast={disablePast}
          className={className}
          disabled={disabled}
          minDate={minDate}
          shouldDisableDate={shouldDisableDate}
          onMonthChange={onMonthChange}
          maxDate={maxDate}
          disableHighlightToday
          timezone={default_timeZone}
          disableFuture={disableFuture}
        />
      </DemoContainer>
    </LocalizationProvider>
  );
};

export default CustomDatePicker;
