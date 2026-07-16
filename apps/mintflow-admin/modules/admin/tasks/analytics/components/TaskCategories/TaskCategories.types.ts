import type {
  CategoryFilterItem,
  TaskCategoryFilter,
} from "../../taskAnalytics.types";

export interface TaskCategoriesProps {
  categories: CategoryFilterItem[];
  activeCategories: Set<TaskCategoryFilter>;
  onToggle: (id: TaskCategoryFilter) => void;
}
