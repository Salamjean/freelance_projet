import { BudgetType, ExperienceLevel } from '@prisma/client';
export declare class CreateProjectDto {
    title: string;
    description: string;
    categoryId: number;
    subCategoryId: number;
    budget: number;
    budgetType: BudgetType;
    experienceLevel: ExperienceLevel;
    duration?: string;
}
