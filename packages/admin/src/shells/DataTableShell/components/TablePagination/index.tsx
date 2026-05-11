import React from 'react';
import { Group, Pagination, Select, Text } from '@zetsel/ui';
import { useDataTableContext, useDataTableStore } from '../../../../wrappers/DataTableWrapper';

interface TablePaginationProps {
  pageSizes?: number[];
}

export function TablePagination({ pageSizes = [20, 50, 100] }: TablePaginationProps) {
  const { total } = useDataTableContext();
  const page = useDataTableStore((s) => s.page);
  const pageSize = useDataTableStore((s) => s.pageSize);
  const setPage = useDataTableStore((s) => s.setPage);
  const setPageSize = useDataTableStore((s) => s.setPageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <Group justify="space-between" align="center" mt="md">
      <Text size="sm" c="dimmed">
        {total === 0 ? 'No records' : `${from}–${to} of ${total}`}
      </Text>
      <Group gap="sm">
        <Select
          value={String(pageSize)}
          data={pageSizes.map((n) => ({ value: String(n), label: `${n} / page` }))}
          onChange={(val) => val && setPageSize(Number(val))}
          size="xs"
          style={{ width: 110 }}
          aria-label="Rows per page"
        />
        <Pagination
          value={page}
          total={totalPages}
          onChange={setPage}
          size="sm"
          siblings={1}
        />
      </Group>
    </Group>
  );
}
