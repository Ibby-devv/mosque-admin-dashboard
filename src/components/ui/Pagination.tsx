import React from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Theme } from '../../constants/theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${Theme.spacing.xl};
  padding-top: ${Theme.spacing.lg};
  border-top: 1px solid ${Theme.colors.border.base};
  flex-wrap: wrap;
  gap: ${Theme.spacing.md};
`;

const PaginationInfo = styled.div`
  font-size: ${Theme.typography.small};
  color: ${Theme.colors.text.muted};
`;

const PaginationControls = styled.div`
  display: flex;
  gap: ${Theme.spacing.sm};
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  padding: ${Theme.spacing.sm} ${Theme.spacing.md};
  border-radius: ${Theme.radius.md};
  border: 1px solid ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.border.base};
  background: ${props => props.$active ? Theme.colors.brand.navy[700] : Theme.colors.surface.base};
  color: ${props => props.$active ? Theme.colors.text.inverse : Theme.colors.text.base};
  font-weight: ${props => props.$active ? 600 : 400};
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.$active ? Theme.colors.brand.navy[800] : Theme.colors.surface.muted};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    flex-shrink: 0;
  }
`;

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if at the beginning or end
      if (currentPage <= 2) {
        endPage = 4;
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3;
      }

      // Add ellipsis if needed
      if (startPage > 2) {
        pages.push('...');
      }

      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationContainer>
      <PaginationInfo>
        Showing {startItem}-{endItem} of {totalItems}
      </PaginationInfo>

      <PaginationControls>
        <PageButton onClick={handlePrevious} disabled={currentPage === 1}>
          <ChevronLeft size={18} />
        </PageButton>

        {getPageNumbers().map((page, index) => {
          if (page === '...') {
            return <span key={`ellipsis-${index}`} style={{ padding: '0 8px', color: Theme.colors.text.muted }}>...</span>;
          }

          return (
            <PageButton
              key={page}
              $active={currentPage === page}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </PageButton>
          );
        })}

        <PageButton onClick={handleNext} disabled={currentPage === totalPages}>
          <ChevronRight size={18} />
        </PageButton>
      </PaginationControls>
    </PaginationContainer>
  );
};

export default Pagination;
