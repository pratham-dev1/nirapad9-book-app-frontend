import React, { SyntheticEvent } from "react";
import TextField, { TextFieldVariants } from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { IconButton } from "@mui/material";
import { GridDeleteIcon } from "@mui/x-data-grid";

interface AutocompleteProps {
  size?: "small" | "medium";
  label: string;
  fullWidth?: boolean;
  sx?: object;
  options: any[];
  variant?: TextFieldVariants;
  className?: string;
  multiple?: boolean;
  displayName?: string;
  onChange?: (e:SyntheticEvent,v:any,reason:any) => void;
  getOptionLabel?: (option:any) => string;
  helperText?: string;
  error?: boolean;
  value?: object | any[] | null;
  isOptionEqualToValue? : (option:any,value:any)=>boolean;
  freeSolo?: boolean,
  onInputChange?: any
  disableClearable?: any
  // filterOptions?: any
  disabled?: any
  getOptionDisabled?: (option: any) => boolean;
  limitTags?: number;
  groupBy?: (option: any) => string;
  renderTags?: any;
  showDeleteIcon?: boolean;
  onDelete?: (option: any) => void;
  disableFilter?: boolean;
  placeholder?:string
  disableSearch?: boolean
  renderOption?: any
}

const CustomAutocomplete: React.FC<AutocompleteProps> = ({
  label,
  size,
  fullWidth,
  sx,
  options,
  variant,
  className,
  multiple,
  onChange,
  getOptionLabel,
  helperText,
  error,
  value,
  isOptionEqualToValue,
  freeSolo,
  onInputChange,
  disableClearable,
  // filterOptions,
  disabled,
  getOptionDisabled,
  limitTags,
  groupBy,
  renderTags,
  showDeleteIcon,  // New prop
  onDelete,  
  disableFilter,
  placeholder,
  disableSearch,
  renderOption
}) => {
  const defaultGetOptionLabel = (option: any) => {
    if (typeof option === "string") {
      return option;
    }
    return "";
  };

  const filterAndSortOptions = (options: any, inputValue: string): any[] => {
    if (disableFilter) {
      // If filtering and sorting are disabled, return the options as-is
      return options;
    }
    const inputLowerCase = inputValue.toLowerCase();
    const getLabel = getOptionLabel || defaultGetOptionLabel;

    // Filter options to include only those containing the input value
    const containsInput = options.filter((option: any) =>{

      const label = getLabel(option).toLowerCase();
//  added by jagadeesh {
     let searchTerm = inputLowerCase.trim();
// }    
      if(option.category){
        const prefixMatch = searchTerm.match(/^(\w+):\s*(.*)$/);
        if(prefixMatch)
        return label.includes(prefixMatch[2] || "")
      }
      return label.includes(searchTerm);
    }
    );

    const customSort = (a: any, b: any) => {
      const labelA = getLabel(a).toLowerCase();
      const labelB = getLabel(b).toLowerCase();
      const indexA = labelA.indexOf(inputLowerCase);
      const indexB = labelB.indexOf(inputLowerCase);

      // If both indices are equal, sort alphabetically
      if (indexA === indexB) {
        return labelA.localeCompare(labelB);
      } else if (indexA === -1) {
        return 1; // if indexA is -1, b comes first
      } else if (indexB === -1) {
        return -1; // if indexB is -1, a comes first
      } else {
        return indexA - indexB; // otherwise, sort by index difference
      }
    };

    // Sort options using the custom sorting function
    containsInput.sort(customSort);
    return containsInput;
  };

  return (
    <Autocomplete
      disablePortal
      disableClearable={disableClearable}
      // id="combo-box"
      size={size || 'small'}
      options={options || []}
      value={value}
      sx={sx}
      fullWidth={fullWidth}
      multiple={multiple}
      onChange={onChange}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      freeSolo={freeSolo}
      onInputChange={onInputChange}
      // filterOptions={filterOptions}
      filterOptions={(options, state) =>
        filterAndSortOptions(options, state.inputValue)
      }

      disabled={disabled}
      getOptionDisabled={getOptionDisabled}
      limitTags={limitTags}
      groupBy={groupBy}
      renderTags={renderTags}
      renderOption={
        renderOption ? renderOption :
        (getOptionLabel ? (props, option) => {
        const label = getOptionLabel(option); 
        return (
          <li {...props}>
            <span style={{ flexGrow: 1 }}>
              {label}
            </span>
            {showDeleteIcon && (
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete?.(option); // Call the delete handler
                }}
              >
                <GridDeleteIcon />
              </IconButton>
            )}
          </li>
        );
      } : undefined)}
      // renderOption={(props, option) => (
      //   <li {...props} key={option.id}>
      //     {getOptionLabel ? getOptionLabel(option) : option}
      //   </li>
      // )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          variant={variant || "outlined"}
          className={className}
          error={error}
          helperText={helperText}
          placeholder={placeholder}
          inputProps={{ ...params.inputProps, readOnly: disableSearch }}
        />
      )}
    />
  );
};

export default CustomAutocomplete;
