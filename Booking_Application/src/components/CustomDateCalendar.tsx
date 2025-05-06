import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { Dayjs } from "dayjs";
import * as React from "react";

type DateCalendarProps = {
    sx?: object;
    className?: string;
    onChange?: any;
    value?: Dayjs | Date | null;
    disablePast?: boolean
    onMonthChange?: any;
    shouldDisableDate?: any;
};

const CustomDateCalendar: React.FC<DateCalendarProps> = ({
    sx,
    className,
    onChange,
    value,
    disablePast,
    shouldDisableDate,
    onMonthChange
}) => {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DateCalendar"]}>
                <DateCalendar
                    sx={sx}
                    className={className}
                    value={value}
                    onChange={onChange}
                    disablePast={disablePast}
                    shouldDisableDate={shouldDisableDate}
                    onMonthChange={onMonthChange}
                />
            </DemoContainer>
        </LocalizationProvider >
    );
};

export default CustomDateCalendar;
