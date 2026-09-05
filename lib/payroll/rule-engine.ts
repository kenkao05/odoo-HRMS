import { evaluate } from "mathjs";
import type { SalaryRule } from "@/lib/types/database.types";

export interface ComputedLine {
  rule_id: string;
  name: string;
  category: string;
  amount: number;
}

export interface RuleEngineResult {
  lines: ComputedLine[];
  gross: number;
  net: number;
}

export class RuleEngineError extends Error {}

/**
 * Computes payslip lines for one employee against one salary structure's rules.
 * Rules MUST be pre-sorted by sequence ascending before calling this.
 */
export function runRuleEngine(rules: SalaryRule[]): RuleEngineResult {
  const sorted = [...rules].sort((a, b) => a.sequence - b.sequence);
  const computed: Record<string, number> = {};
  const lines: ComputedLine[] = [];

  for (const rule of sorted) {
    let amount: number;

    switch (rule.computation_type) {
      case "fixed": {
        if (rule.fixed_amount == null) {
          throw new RuleEngineError(
            `Rule ${rule.code} is type "fixed" but has no fixed_amount`,
          );
        }
        amount = rule.fixed_amount;
        break;
      }
      case "percentage": {
        if (rule.percentage == null || !rule.percentage_of_code) {
          throw new RuleEngineError(
            `Rule ${rule.code} is type "percentage" but is missing percentage or target code`,
          );
        }
        if (!(rule.percentage_of_code in computed)) {
          throw new RuleEngineError(
            `Rule ${rule.code} references "${rule.percentage_of_code}" which has not been computed yet -- check rule sequence ordering`,
          );
        }
        amount = computed[rule.percentage_of_code] * (rule.percentage / 100);
        break;
      }
      case "formula": {
        if (!rule.formula_expression) {
          throw new RuleEngineError(
            `Rule ${rule.code} is type "formula" but has no expression`,
          );
        }
        try {
          // Restricted evaluation via mathjs -- no raw eval(). Scope is limited
          // to already-computed rule codes, so a formula can only reference
          // rules that ran earlier in sequence.
          const result = evaluate(rule.formula_expression, { ...computed });
          if (typeof result !== "number" || Number.isNaN(result)) {
            throw new RuleEngineError(
              `Formula for rule ${rule.code} did not evaluate to a number`,
            );
          }
          amount = result;
        } catch (e) {
          if (e instanceof RuleEngineError) throw e;
          throw new RuleEngineError(
            `Formula error in rule ${rule.code}: ${(e as Error).message}`,
          );
        }
        break;
      }
      default:
        throw new RuleEngineError(
          `Unknown computation_type for rule ${rule.code}`,
        );
    }

    amount = Math.round(amount * 100) / 100;
    computed[rule.code] = amount;
    lines.push({
      rule_id: rule.id,
      name: rule.name,
      category: rule.category,
      amount,
    });
  }

  const gross = lines
    .filter(
      (l) =>
        l.category === "gross" ||
        l.category === "basic" ||
        l.category === "allowance",
    )
    .reduce((sum, l) => sum + l.amount, 0);

  const deductions = lines
    .filter((l) => l.category === "deduction")
    .reduce((sum, l) => sum + l.amount, 0);

  const netLine = lines.find((l) => l.category === "net");
  const net = netLine ? netLine.amount : gross - deductions;

  return { lines, gross, net };
}
