import React from 'react';
import { Box } from '@zetsel/ui';
import { DataTableWrapper } from '../../wrappers/DataTableWrapper';
import { TableHeader } from './components/TableHeader';
import { TableFilters } from './components/TableFilters';
import { TableToolbar } from './components/TableToolbar';
import { TableBody } from './components/TableBody';
import { TablePagination } from './components/TablePagination';
import type { DataTableShellProps } from './DataTableShell.types';
import styles from './DataTableShell.module.css';

export function DataTableShell<T = unknown>({
  moduleInfo,
  queryKey,
  queryGetFn,
  columns,
  idAccessor,
  newButtonHref,
  onNewClick,
  onEditClick,
  onDeleteClick,
  filterList,
  forceFilter,
  pageSizes,
  hideFilters,
  rowExpansion,
  paginationResponseFn,
}: DataTableShellProps<T>) {
  return (
    <DataTableWrapper<T>
      queryKey={queryKey}
      queryGetFn={queryGetFn}
      pageSizes={pageSizes}
      paginationResponseFn={paginationResponseFn}
      forceFilter={forceFilter}
    >
      <Box className={styles.shell}>
        <TableHeader
          moduleInfo={moduleInfo}
          newButtonHref={newButtonHref}
          onNewClick={onNewClick}
        />
        {!hideFilters && <TableFilters filterList={filterList} />}
        <TableToolbar onDeleteClick={onDeleteClick} />
        <Box className={styles.tableWrapper}>
          <TableBody<T>
            columns={columns}
            idAccessor={idAccessor}
            onEditClick={onEditClick}
            onDeleteClick={onDeleteClick}
            rowExpansion={rowExpansion}
          />
        </Box>
        <TablePagination pageSizes={pageSizes} />
      </Box>
    </DataTableWrapper>
  );
}
