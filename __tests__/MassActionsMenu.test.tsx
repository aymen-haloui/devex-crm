import React from 'react';
import { render, screen } from '@testing-library/react';
import MassActionsMenu from '@/components/tables/MassActionsMenu';

// simple translation mock that echoes the key (with basic interpolation)
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, opts?: Record<string, any>) => {
    let result = key;
    if (opts) {
      Object.keys(opts).forEach(k => {
        result = result.replace(`{${k}}`, String(opts[k]));
      });
    }
    return result;
  },
}));

// avoid dealing with Radix portals and hidden state by mocking dropdown components
jest.mock('@/components/ui/dropdown-menu', () => {
  const React = require('react');
  return {
    DropdownMenu: ({ children }: any) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: any) => <>{children}</>,
    DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
    DropdownMenuItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    DropdownMenuLabel: ({ children }: any) => <div>{children}</div>,
    DropdownMenuSeparator: () => <hr />,
  };
});

describe('MassActionsMenu component', () => {
  it('renders only implemented toolbox items and hides removed ones', () => {
    render(<MassActionsMenu entity="Test" selectedCount={3} />);

    // trigger should be enabled when count > 0
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    button.click();

    // items that should be present
    expect(screen.getByText('manage_tags')).toBeInTheDocument();
    expect(screen.getByText('approve')).toBeInTheDocument();
    expect(screen.getByText('deduplicate')).toBeInTheDocument();

    // removed items should not be present
    expect(screen.queryByText('drafts')).toBeNull();
    expect(screen.queryByText('autoresponders')).toBeNull();
    expect(screen.queryByText('create_client_script')).toBeNull();
    expect(screen.queryByText('sheet_view')).toBeNull();
  });

  it('disables the trigger when no rows are selected', () => {
    render(<MassActionsMenu entity="Test" selectedCount={0} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });
});
