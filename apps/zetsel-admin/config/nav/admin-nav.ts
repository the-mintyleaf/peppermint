import type { AdminShellNav } from "@zetsel/admin";
import { ChartBarIcon } from "@phosphor-icons/react/dist/csr/ChartBar";
import { PackageIcon } from "@phosphor-icons/react/dist/csr/Package";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { WarehouseIcon } from "@phosphor-icons/react/dist/csr/Warehouse";
import { ShoppingCartIcon } from "@phosphor-icons/react/dist/csr/ShoppingCart";
import { CurrencyDollarIcon } from "@phosphor-icons/react/dist/csr/CurrencyDollar";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { StorefrontIcon } from "@phosphor-icons/react/dist/csr/Storefront";
import { TruckIcon } from "@phosphor-icons/react/dist/csr/Truck";

export const adminNav: AdminShellNav = [
  {
    label: "Overview",
    items: [
      { label: "Home", href: "/admin", icon: ChartBarIcon },
      { label: "Storefront", href: "/admin/storefront", icon: StorefrontIcon },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        label: "Products",
        href: "/admin/product-management/products",
        icon: PackageIcon,
      },
      { label: "Categories", href: "/admin/product-management/categories", icon: TagIcon },
      {
        label: "Inventory",
        href: "/admin/catalog/inventory",
        icon: WarehouseIcon,
      },
    ],
  },
  {
    label: "Sales",
    items: [
      {
        label: "Orders",
        href: "/admin/sales/orders",
        icon: ShoppingCartIcon,
        badge: "12 new",
      },
      {
        label: "Discounts",
        href: "/admin/sales/discounts",
        icon: CurrencyDollarIcon,
      },
      {
        label: "Shipping",
        href: "/admin/sales/shipping",
        icon: TruckIcon,
      },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", href: "/admin/customers", icon: UsersIcon },
      { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Staff", href: "/admin/settings/staff", icon: UserIcon },
      { label: "Settings", href: "/admin/settings", icon: GearSixIcon },
    ],
  },
];
