import type { ModalFormComponentProps } from '@zetsel/admin';
import type { ProductCategory } from '../module.api';

export interface ProductCategoryFormProps extends ModalFormComponentProps<ProductCategory> {}

export interface ProductCategoryFormValues {
  name: string;
  slug: string;
  description: string;
  parent?: string;
  image?: string;
}
