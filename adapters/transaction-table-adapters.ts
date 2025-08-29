import type { TransactionTableAdapter, TransactionTableConfig } from "@/types/transaction-table-types"

// Base adapter with common functionality
export class BaseTransactionTableAdapter implements TransactionTableAdapter {
  constructor(
    protected contextData: any,
    protected config: Partial<TransactionTableConfig> = {},
  ) {}

  getData() {
    return {
      results: this.contextData.results,
      selectedAitId: this.contextData.selectedAitId,
      hideTable: this.contextData.hideTable,
      id: this.contextData.id,
      isTableLoading: this.contextData.isTableLoading,
    }
  }

  getConfig(): TransactionTableConfig {
    return {
      formatColumnName: this.config.formatColumnName || this.defaultFormatColumnName,
      formatCellValue: this.config.formatCellValue || this.defaultFormatCellValue,
      getSystemName: this.config.getSystemName || this.defaultGetSystemName,
      currencyCode: this.config.currencyCode || "USD",
      dateFormat:
        this.config.dateFormat ||
        ({
          dateStyle: "short",
          timeStyle: "medium",
        } as Intl.DateTimeFormatOptions),
    }
  }

  protected defaultFormatColumnName = (columnName: string) => {
    return columnName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  }

  protected defaultFormatCellValue = (value: any, columnName: string) => {
    if (value === null || value === undefined || value === "" || value === "null") {
      return "—"
    }

    const config = this.getConfig()

    // Format dates
    if (columnName.includes("DATE") || columnName.includes("TS")) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat("en-US", config.dateFormat).format(date)
        }
      } catch (e) {
        // If date parsing fails, return original value
      }
    }

    // Format amounts
    if (columnName.includes("AMT") && !isNaN(Number.parseFloat(value))) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: config.currencyCode,
        minimumFractionDigits: 2,
      }).format(Number.parseFloat(value))
    }

    return String(value)
  }

  protected defaultGetSystemName = (aitId: string, results: any[]) => {
    if (!results) return `AIT ${aitId}`
    const matchingResult = results.find((result) => result.aitNumber === aitId)
    return matchingResult?.aitName || `AIT ${aitId}`
  }
}

// US Wires specific adapter
export class UsWiresTransactionTableAdapter extends BaseTransactionTableAdapter {
  constructor(contextData: any) {
    super(contextData, {
      currencyCode: "USD",
      formatCellValue: (value: any, columnName: string) => {
        // US Wires specific formatting
        if (columnName.includes("WIRE_AMT")) {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          }).format(Number.parseFloat(value))
        }
        return this.defaultFormatCellValue(value, columnName)
      },
    })
  }
}

// India specific adapter
export class IndiaTransactionTableAdapter extends BaseTransactionTableAdapter {
  constructor(contextData: any) {
    super(contextData, {
      currencyCode: "INR",
      dateFormat: { dateStyle: "short", timeStyle: "short" },
      formatCellValue: (value: any, columnName: string) => {
        // India specific formatting
        if (columnName.includes("AMT")) {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
          }).format(Number.parseFloat(value))
        }
        return this.defaultFormatCellValue(value, columnName)
      },
    })
  }
}
