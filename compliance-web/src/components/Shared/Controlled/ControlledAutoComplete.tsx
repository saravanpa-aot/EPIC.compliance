import {
  ExpandMore,
  CheckBox,
  CheckBoxOutlineBlank,
  Close,
} from "@mui/icons-material";
import {
  Autocomplete,
  TextField,
  Checkbox,
  AutocompleteProps,
} from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";

interface FormAutocompleteProps<T>
  extends Partial<AutocompleteProps<T, true | false, false, false>> {
  name: string;
  label: string;
  options: T[];
  getOptionLabel: (option: T) => string;
  isOptionEqualToValue: (option: T, value: T) => boolean;
  multiple?: boolean;
}

const ControlledAutoComplete = <T,>({
  name,
  label,
  options,
  getOptionLabel,
  isOptionEqualToValue,
  multiple,
  ...props
}: FormAutocompleteProps<T>) => {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValues?.[name] || (multiple ? [] : undefined)}
      render={({ field }) => (
        <Autocomplete
          {...field}
          {...props}
          id={name}
          options={options}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={isOptionEqualToValue}
          value={field.value ?? (multiple ? [] : null)}
          onChange={(_event, newVal) => field.onChange(newVal)}
          multiple={multiple}
          disableCloseOnSelect={multiple}
          limitTags={multiple ? 1 : undefined}
          popupIcon={<ExpandMore />}
          renderOption={(props, option, { selected }) => {
            const { key, ...otherProps } = props;
            return (
              <li key={key} {...otherProps}>
                {multiple && (
                  <Checkbox
                    icon={<CheckBoxOutlineBlank />}
                    checkedIcon={<CheckBox />}
                    checked={selected}
                  />
                )}
                {getOptionLabel(option)}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              name={name}
              error={!!errors[name]}
              helperText={String(errors[name]?.message ?? "")}
            />
          )}
          ChipProps={multiple ? { deleteIcon: <Close /> } : undefined}
        />
      )}
    />
  );
};

export default ControlledAutoComplete;
