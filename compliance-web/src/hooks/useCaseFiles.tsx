import { CaseFile, CaseFileAPIData } from "@/models/CaseFile";
import { Initiation } from "@/models/Initiation";
import { OnSuccessType, request } from "@/utils/axiosUtils";
import { useMutation, useQuery } from "@tanstack/react-query";

const fetchCaseFiles = (projectId?: number): Promise<CaseFile[]> => {
  return request({ url: "/case-files", params: { project_id: projectId } });
};

const fetchInitiations = (): Promise<Initiation[]> => {
  return request({ url: "/case-files/initiation-options" });
};

const createCaseFile = (caseFile: CaseFileAPIData) => {
  return request({ url: "/case-files", method: "post", data: caseFile });
};

export const useCaseFilesData = () => {
  return useQuery({
    queryKey: ["case-files"],
    queryFn: () => fetchCaseFiles(),
  });
};

export const useCaseFilesByProjectId = (projectId: number) => {
  return useQuery({
    queryKey: ["case-files-by-projectId", projectId],
    queryFn: () => fetchCaseFiles(projectId),
    enabled: !!projectId,
  });
};

export const useInitiationsData = () => {
  return useQuery({
    queryKey: ["case-files-initiations"],
    queryFn: fetchInitiations,
  });
};

export const useCreateCaseFile = (onSuccess: OnSuccessType) => {
  return useMutation({ mutationFn: createCaseFile, onSuccess });
};
