export type ExpenseCategory = "transport" | "stay" | "activities" | "meals" | "misc";

export type ExpenseLike = {
  category: ExpenseCategory;
  amount: number | string;
};

export const expenseCategories: { key: ExpenseCategory; label: string }[] = [
  { key: "transport", label: "Transport" },
  { key: "stay", label: "Stay" },
  { key: "activities", label: "Activities" },
  { key: "meals", label: "Meals" },
  { key: "misc", label: "Misc." },
];

export function calculateBudget(expenses: ExpenseLike[], budget: number | string) {
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const planned = Number(budget || 0);
  const byCategory = expenseCategories.reduce<Record<ExpenseCategory, number>>(
    (result, category) => ({
      ...result,
      [category.key]: expenses
        .filter(expense => expense.category === category.key)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    }),
    { transport: 0, stay: 0, activities: 0, meals: 0, misc: 0 },
  );

  return {
    total,
    planned,
    remaining: planned - total,
    isOverBudget: total > planned,
    byCategory,
  };
}

export function isValidTripDates(startDate: string, endDate: string) {
  return Boolean(startDate && endDate && new Date(endDate).getTime() >= new Date(startDate).getTime());
}
