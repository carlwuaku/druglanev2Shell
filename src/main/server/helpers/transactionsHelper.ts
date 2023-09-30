import { STOCK_EFFECTS } from "../models/stockEffects"

export const defaultTransactions: {
  name: string,
  payment_required: "Yes" | "No",
  stock_effect: STOCK_EFFECTS.Add | STOCK_EFFECTS.Subtract | STOCK_EFFECTS.Reset | STOCK_EFFECTS.None
}[] = [
  {
    name: "Sale",
    payment_required: "Yes",
    stock_effect: STOCK_EFFECTS.Subtract
  },
  {
    name: "Return Sale",
    payment_required: "Yes",
    stock_effect: STOCK_EFFECTS.Add
  },
   {
    name: "Purchase",
    payment_required: "Yes",
    stock_effect: STOCK_EFFECTS.Add
  },
   {
    name: "Transfer",
    payment_required: "No",
    stock_effect: STOCK_EFFECTS.Subtract
  }
  ,
   {
    name: "Received Transfer",
    payment_required: "No",
    stock_effect: STOCK_EFFECTS.Add
  },
   {
    name: "Stock Adjustment",
    payment_required: "No",
    stock_effect: STOCK_EFFECTS.Reset
  }
  ,
   {
    name: "Product Damage",
    payment_required: "No",
    stock_effect: STOCK_EFFECTS.Subtract
  },
   {
    name: "Expiry",
    payment_required: "No",
    stock_effect: STOCK_EFFECTS.Subtract
  }
]
