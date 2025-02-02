import InspectionDrawer from "@/components/App/Inspections/InspectionDrawer";
import TableFilter from "@/components/Shared/FilterSelect/TableFilter";
import MasterDataTable from "@/components/Shared/MasterDataTable/MasterDataTable";
import { searchFilter } from "@/components/Shared/MasterDataTable/utils";
import { useInspectionsData } from "@/hooks/useInspections";
import { Inspection } from "@/models/Inspection";
import { useDrawer } from "@/store/drawerStore";
import { notify } from "@/store/snackbarStore";
import { Chip } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { MRT_ColumnDef } from "material-react-table";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/_authenticated/ce-database/inspections")(
  { component: Inspections }
);

export function Inspections() {
  const queryClient = useQueryClient();
  const { setOpen, setClose } = useDrawer();
  const { data: inspectionsList, isLoading } = useInspectionsData();

  const [projectList, setProjectList] = useState<string[]>([]);
  const [initiationList, setInitiationList] = useState<string[]>([]);
  const [staffUserList, setStaffUserList] = useState<string[]>([]);
  const [irStatusList, setIRStatusList] = useState<string[]>([]);
  const [irTypeList, setIRTypeList] = useState<string[]>([]);
  const [inspectionStatusList, setInspectionStatusList] = useState<string[]>(
    []
  );

  useEffect(() => {
    setProjectList(
      [
        ...new Set(inspectionsList?.map((insp) => insp.project?.name ?? "")),
      ].filter(Boolean)
    );
    setInitiationList(
      [
        ...new Set(inspectionsList?.map((insp) => insp.initiation?.name ?? "")),
      ].filter(Boolean)
    );
    setStaffUserList(
      [
        ...new Set(
          inspectionsList?.map((insp) => insp.lead_officer?.full_name ?? "")
        ),
      ].filter(Boolean)
    );
    setIRStatusList(
      [
        ...new Set(inspectionsList?.map((insp) => insp.ir_status?.name ?? "")),
      ].filter(Boolean)
    );
    setIRTypeList(
      [...new Set(inspectionsList?.map((insp) => insp.types ?? ""))].filter(
        Boolean
      )
    );
    setInspectionStatusList(
      [
        ...new Set(
          inspectionsList?.map((insp) => insp.inspection_status ?? "")
        ),
      ].filter(Boolean)
    );
  }, [inspectionsList]);

  const columns = useMemo<MRT_ColumnDef<Inspection>[]>(
    () => [
      {
        accessorKey: "ir_number",
        header: "IR #",
        sortingFn: "sortFn",
        filterFn: searchFilter,
      },
      {
        accessorKey: "project.name",
        header: "Project",
        filterVariant: "multi-select",
        filterSelectOptions: projectList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="projectFilter"
              placeholder="Filter Projects"
            />
          );
        },
      },
      {
        accessorKey: "ir_status.name",
        header: "Stage",
        filterVariant: "multi-select",
        filterSelectOptions: irStatusList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="stageFilter"
              placeholder="Filter Stage"
            />
          );
        },
        size: 150,
      },
      {
        accessorKey: "types",
        header: "Type",
        filterVariant: "multi-select",
        filterSelectOptions: irTypeList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="typeFilter"
              placeholder="Filter Type"
            />
          );
        },
        size: 150,
      },
      {
        accessorKey: "initiation.name",
        header: "Initiation",
        filterVariant: "multi-select",
        filterSelectOptions: initiationList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="initiationFilter"
              placeholder="Filter Initiations"
            />
          );
        },
      },
      {
        accessorKey: "inspection_status",
        header: "Status",
        Cell: ({ row }) => {
          return row.original.inspection_status ? (
            <Chip
              label={row.original.inspection_status}
              color={
                row.original.inspection_status?.toLowerCase() === "open"
                  ? "success"
                  : "error"
              }
              variant="outlined"
              size="small"
            />
          ) : (
            <></>
          );
        },
        filterVariant: "multi-select",
        filterSelectOptions: inspectionStatusList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="inspectionStatusFilter"
              placeholder="Filter Status"
            />
          );
        },
        size: 150,
      },
      {
        accessorFn: (row) => row.lead_officer?.full_name,
        id: "lead_officer.full_name",
        header: "Lead Officer",
        filterVariant: "multi-select",
        filterSelectOptions: staffUserList,
        Filter: ({ header, column }) => {
          return (
            <TableFilter
              isMulti
              header={header}
              column={column}
              variant="inline"
              name="leadOfficersFilter"
              placeholder="Filter Officers"
            />
          );
        },
      },
      {
        accessorKey: "case_file.case_file_number",
        header: "Case File #",
        filterFn: searchFilter,
      },
    ],
    [
      initiationList,
      inspectionStatusList,
      irStatusList,
      irTypeList,
      projectList,
      staffUserList,
    ]
  );

  const handleOnSubmit = (submitMsg: string) => {
    queryClient.invalidateQueries({ queryKey: ["inspections"] });
    setClose();
    notify.success(submitMsg);
  };

  const handleOpenDrawer = () => {
    setOpen({
      content: <InspectionDrawer onSubmit={handleOnSubmit} />,
      width: "1118px",
    });
  };

  return (
    <MasterDataTable
      columns={columns}
      data={inspectionsList ?? []}
      initialState={{
        sorting: [
          {
            id: "ir_number",
            desc: false,
          },
        ],
      }}
      state={{
        isLoading: isLoading,
        showGlobalFilter: true,
      }}
      titleToolbarProps={{
        tableTitle: "Inspections",
        tableAddRecordButtonText: "Inspection",
        tableAddRecordFunction: () => handleOpenDrawer(),
      }}
    />
  );
}
