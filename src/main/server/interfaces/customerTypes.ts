export enum CustomerEnum {
  CUSTOMER= "customer",
  VENDOR = "vendor"
}

export type CustomerTypes = CustomerEnum.CUSTOMER | CustomerEnum.VENDOR
