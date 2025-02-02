import { Box, Stack } from "@mui/material";
import ControlledAutoComplete from "@/components/Shared/Controlled/ControlledAutoComplete";
import { IRStatus } from "@/models/IRStatus";
import { ProjectStatus } from "@/models/ProjectStatus";
import { FC, useEffect } from "react";
import { Attendance } from "@/models/Attendance";
import ControlledTextField from "@/components/Shared/Controlled/ControlledTextField";
import { BCDesignTokens } from "epic.theme";
import { Agency } from "@/models/Agency";
import { FirstNation } from "@/models/FirstNation";
import { useFormContext, useWatch } from "react-hook-form";
import { useModal } from "@/store/modalStore";
import ConfirmationModal from "@/components/Shared/Popups/ConfirmationModal";
import { AttendanceEnum } from "./InspectionFormUtils";
import { useDrawer } from "@/store/drawerStore";

type InspectionFormRightProps = {
  irStatusList: IRStatus[];
  projectStatusList: ProjectStatus[];
  attendanceList: Attendance[];
  agenciesList: Agency[];
  firstNationsList: FirstNation[];
};

type FieldConfig = {
  type: string;
  name: string;
  label: string;
  options?: Agency[] | FirstNation[];
};

const sectionPadding = "1rem 2rem 0rem 1rem";

const InspectionFormRight: FC<InspectionFormRightProps> = ({
  irStatusList,
  projectStatusList,
  attendanceList,
  agenciesList,
  firstNationsList,
}) => {
  const { isOpen } = useDrawer();
  const { setOpen, setClose } = useModal();
  const { control, resetField, getValues, setValue } = useFormContext();
  
  // Watch for changes in `inAttendance` field
  const selectedAttendance = useWatch({
    control,
    name: 'inAttendance',
    defaultValue: [],
  });

  useEffect(() => {
    // Reset inAttendance when the drawer is closed
    if (!isOpen) {
      setValue('inAttendance', []);
    }
  }, [isOpen, setValue]);

  const handleDeleteOption = (option: Attendance) => {
    const fieldName = dynamicFieldConfig[option.id as AttendanceEnum]?.name;
    const fieldValue = getValues(fieldName);

    if (fieldName && fieldValue?.length) {
      setOpen({
        content: (
          <ConfirmationModal
            title="Remove Group?"
            description="You have selected one or more options in this group. Deselecting will remove all selected items. Are you sure you want to remove it?"
            confirmButtonText="Remove"
            onConfirm={() => handleConfirmRemove(option)}
          />
        ),
      });
    } else {
      handleConfirmRemove(option); // Remove immediately if no values are filled
    }
  };

  const handleConfirmRemove = (selectedToRemove: Attendance) => {
    if (selectedToRemove) {
      const fieldName = dynamicFieldConfig[selectedToRemove.id as AttendanceEnum]?.name;
      if (fieldName) {
        resetField(fieldName); // Reset the corresponding field value
      }
      const inAttendanceValues: Attendance[] = getValues("inAttendance");
      const updatedAttendanceList: Attendance[] = inAttendanceValues.filter((att) => att.id !== selectedToRemove.id);
      setValue("inAttendance", updatedAttendanceList); // Remove from the form field
    }
    setClose();
  };

  const dynamicFieldConfig: Record<AttendanceEnum, FieldConfig> = {
    [AttendanceEnum.AGENCIES]: {
      type: "autocomplete",
      name: "agencies",
      label: "Agencies",
      options: agenciesList,
    },
    [AttendanceEnum.FIRST_NATIONS]: {
      type: "autocomplete",
      name: "firstNations",
      label: "First Nations",
      options: firstNationsList,
    },
    [AttendanceEnum.MUNICIPAL]: {
      type: "text",
      name: "municipal",
      label: "Municipal",
    },
    [AttendanceEnum.OTHER]: { type: "text", name: "other", label: "Other" },
  };

  const isRelevantAttendanceSelected = selectedAttendance.some((attendee: Attendance) =>
    Object.values(AttendanceEnum).includes(attendee.id as AttendanceEnum)
  );

  return (
    <>
      <Box
        sx={{
          width: "399px",
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        <Stack>
          <Box p={sectionPadding}>
            <ControlledAutoComplete
              name="irStatus"
              label="IR Status (optional)"
              options={irStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="projectStatus"
              label="Project Status (optional)"
              options={projectStatusList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              fullWidth
            />
            <ControlledAutoComplete
              name="inAttendance"
              label="In Attendance (optional)"
              options={attendanceList}
              getOptionLabel={(option) => option.name}
              getOptionKey={(option) => option.id}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              multiple
              fullWidth
              onDeleteOption={handleDeleteOption}
            />
          </Box>
          {/* Show this section only if relevant AttendanceEnum values are selected */}
          {isRelevantAttendanceSelected && (
            <Box
              p={sectionPadding}
              bgcolor={BCDesignTokens.surfaceColorBackgroundLightBlue}
            >
              {selectedAttendance.map((attendee: Attendance) => {
                const config = dynamicFieldConfig[attendee.id as AttendanceEnum];
                if (!config) return null;

                return config.type === "text" ? (
                  <ControlledTextField
                    key={config.name}
                    name={config.name}
                    label={config.label}
                    placeholder={`Type ${config.label.toLowerCase()} attendees`}
                    fullWidth
                    multiline
                  />
                ) : (
                  <ControlledAutoComplete
                    key={config.name}
                    name={config.name}
                    label={config.label}
                    options={config.options ?? []}
                    getOptionLabel={(option) => option.name}
                    getOptionKey={(option) => option.id}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    multiple
                    fullWidth
                  />
                );
              })}
            </Box>
          )}
        </Stack>
      </Box>
    </>
  );
};

export default InspectionFormRight;
