import { TableRowData } from "@/components/Table/DataTable";

export interface GameCategoryRow extends TableRowData {
  category: string;
  recommender: string;
  recommendReason: string | null;
  rejectionReason: string | null;
}

export interface GameRow extends TableRowData {
  title: string;
  description: string | null;
  category: string;
  therapist: string | null;
  recommendReason: string | null;
  rejectionReason: string | null;
}

const mockGCByDementia: Record<number, GameCategoryRow[]> = {
  1: [
    {
      id: 11,
      category: "Attention",
      recommender: "Daniel Lee",
      recommendReason: "test",
      rejectionReason: "—",
    },
  ],
};

const mockGamesByDementia: Record<number, GameRow[]> = {
  1: [
    {
      id: 101,
      title: "Focus Builder",
      description: "Improve short attention span via mini-tasks",
      category: "Attention",
      therapist: "Therapist May",
      recommendReason: "Good early-stage cognitive stimulation",
      rejectionReason: null,
    },
    {
      id: 102,
      title: "Word Search",
      description: null,
      category: "Language",
      therapist: null,
      recommendReason: null,
      rejectionReason: "—",
    },
  ],
};

export async function fetchGameCategoryByDementiaMock(
  dementiaId: number
): Promise<GameCategoryRow[]> {
  await new Promise((r) => setTimeout(r, 120));
  return mockGCByDementia[dementiaId] ?? [];
}

export async function fetchGamesByDementiaMock(
  dementiaId: number
): Promise<GameRow[]> {
  await new Promise((r) => setTimeout(r, 120));
  return mockGamesByDementia[dementiaId] ?? [];
}
