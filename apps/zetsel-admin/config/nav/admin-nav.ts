import type { AdminShellConfig } from "@zetsel/admin";
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
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";

export const adminShellConfig: AdminShellConfig = {
  brand: {
    icon: KanbanIcon,
    href: "/admin",
  },
  mainNav: [
    {
      kind: "module",
      id: "overview",
      icon: ChartBarIcon,
      label: "Overview",
      subNav: {
        homeHref: "/admin",
        groups: [
          {
            label: "Overview",
            items: [
              { label: "Home", href: "/admin", icon: ChartBarIcon },
              { label: "Storefront", href: "/admin/storefront", icon: StorefrontIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "catalog",
      icon: PackageIcon,
      label: "Catalog",
      subNav: {
        homeHref: "/admin/product-management/products",
        groups: [
          {
            label: "Catalog",
            items: [
              {
                label: "Products",
                href: "/admin/product-management/products",
                icon: PackageIcon,
              },
              {
                label: "Categories",
                href: "/admin/product-management/categories",
                icon: TagIcon,
              },
              {
                label: "Inventory",
                href: "/admin/catalog/inventory",
                icon: WarehouseIcon,
              },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "sales",
      icon: ShoppingCartIcon,
      label: "Sales",
      subNav: {
        homeHref: "/admin/sales/orders",
        groups: [
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
        ],
      },
    },
    {
      kind: "module",
      id: "customers",
      icon: UsersIcon,
      label: "Customers",
      subNav: {
        homeHref: "/admin/customers",
        groups: [
          {
            label: "Customers",
            items: [
              { label: "Customers", href: "/admin/customers", icon: UsersIcon },
              { label: "Reviews", href: "/admin/reviews", icon: StarIcon },
            ],
          },
        ],
      },
    },
    {
      kind: "module",
      id: "settings",
      icon: GearSixIcon,
      label: "Settings",
      subNav: {
        homeHref: "/admin/settings/staff",
        groups: [
          {
            label: "Settings",
            items: [
              { label: "Staff", href: "/admin/settings/staff", icon: UserIcon },
              { label: "Settings", href: "/admin/settings", icon: GearSixIcon },
            ],
          },
        ],
      },
    },
  ],
};
