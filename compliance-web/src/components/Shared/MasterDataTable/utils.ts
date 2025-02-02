import dateUtils from "@/utils/dateUtils";
import { json2csv } from "json-2-csv";
import { MRT_FilterFn, MRT_TableInstance } from "material-react-table";
import { MRT_RowData } from "material-react-table";

export const BLANK_OPTION = "(Blanks)";
export function getSelectFilterOptions<T>(
  data: T[],
  key: keyof T,
  formatLabel: (value: unknown) => string = (value) => String(value),
  formatValue: (value: unknown) => unknown = (value) => String(value)
) {
  // Step 1: Create a Map to store unique values and their formatted labels
  const optionsMap = new Map();

  // Step 2: Iterate through the data array to populate the Map
  data.forEach((dataObject) => {
    // Step 3: Skip undefined or null values
    if (
      !dataObject ||
      dataObject[key] === undefined ||
      dataObject[key] === null
    ) {
      optionsMap.set("", BLANK_OPTION);
      return;
    }

    // Step 4: Populate the Map with unique values and their formatted labels
    optionsMap.set(formatValue(dataObject[key]), formatLabel(dataObject[key]));
  });

  // Step 5: Convert the Map to an array of objects with 'text' and 'value' properties
  const optionsArray = Array.from(optionsMap.entries()).map(([key, value]) => ({
    text: value,
    value: key,
  }));

  // Step 6: Sort the array by 'value' property
  optionsArray.sort((a, b) => {
    if (a.value === "") {
      return -1;
    }

    if (b.value === "") {
      return 1;
    }

    return a.value < b.value ? -1 : 1;
  });

  return optionsArray;
}

export const rowsPerPageOptions = (dataSize = 10) => {
  const defaultOptions = [
    {
      value: 15,
      label: "15",
    },
    {
      value: dataSize,
      label: "All",
    },
  ];

  return defaultOptions;
};

interface ExportToCsvOptions<T extends MRT_RowData> {
  table: MRT_TableInstance<T>;
  downloadDate: string | null;
  filenamePrefix: string;
}

export async function exportToCsv<T extends MRT_RowData>({
  table,
  downloadDate,
  filenamePrefix,
}: ExportToCsvOptions<T>) {
  const columns = table
    .getVisibleFlatColumns()
    .map((p) => p.columnDef.id?.toString());

  const csvRows = table.getFilteredRowModel().flatRows.map((row) => {
    const csvRow: { [key: string]: unknown } = {};
    columns.forEach((column: string | undefined) => {
      if (column) {
        csvRow[column] = row.getValue(column);
      }
    });
    return csvRow;
  });

  const csv = await json2csv(csvRows, {
    emptyFieldValue: "",
    keys: columns as string[],
  });

  const url = window.URL.createObjectURL(new Blob([csv as never]));
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `${filenamePrefix}-${dateUtils.formatDate(
      downloadDate ? downloadDate : new Date().toISOString()
    )}.csv`
  );
  document.body.appendChild(link);
  link.click();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const searchFilter: MRT_FilterFn<any> = (row, id, filterValue) => {
  const value: string = (row.getValue(id) as string).toLowerCase();

  if (Array.isArray(filterValue)) {
    // If filterValue is an array, check if the value includes any of the selected options
    return filterValue.some((option) => value.includes(option.toLowerCase()));
  } else if (typeof filterValue === "string") {
    // If filterValue is a string, check if the value includes the filterValue
    return value.includes(filterValue.trim().toLowerCase());
  }

  // If filterValue is neither an array nor a string, return false
  return false;
};
export { searchFilter };
