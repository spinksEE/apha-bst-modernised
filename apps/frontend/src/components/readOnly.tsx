import React from 'react';
import type { UserContext } from '../types/auth';
import { useAuthStore } from '../store/auth';

const DEFAULT_READ_ONLY_MESSAGE = 'Note: You have read-only access to this screen.';

export const isReadOnlyRole = (role?: UserContext['role'] | null): boolean => {
  return role === 'ReadOnly';
};

export const useReadOnlyAccess = (): { isReadOnly: boolean } => {
  const role = useAuthStore((state) => state.userContext?.role);
  return { isReadOnly: isReadOnlyRole(role) };
};

interface ReadOnlyNoticeProps {
  isReadOnly: boolean;
  message?: string;
}

export function ReadOnlyNotice({
  isReadOnly,
  message = DEFAULT_READ_ONLY_MESSAGE,
}: ReadOnlyNoticeProps): React.JSX.Element | null {
  if (!isReadOnly) {
    return null;
  }

  return (
    <div
      role="note"
      style={{
        marginTop: '1rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        border: '1px solid #dbeafe',
        background: '#eff6ff',
        color: '#1e3a8a',
        fontWeight: 600,
      }}
    >
      {message}
    </div>
  );
}

interface ReadOnlyFieldsetProps {
  isReadOnly: boolean;
  children: React.ReactNode;
  legend?: string;
}

export function ReadOnlyFieldset({
  isReadOnly,
  children,
  legend,
}: ReadOnlyFieldsetProps): React.JSX.Element {
  return (
    <fieldset
      disabled={isReadOnly}
      aria-disabled={isReadOnly}
      style={{
        border: 'none',
        margin: 0,
        padding: 0,
        minInlineSize: 0,
      }}
    >
      {legend ? (
        <legend style={{ marginBottom: '0.5rem', fontWeight: 600 }}>{legend}</legend>
      ) : null}
      {children}
    </fieldset>
  );
}

type ReadOnlyActionMode = 'hide' | 'disable';

interface ReadOnlyActionProps {
  isReadOnly: boolean;
  children: React.ReactElement;
  mode?: ReadOnlyActionMode;
}

export function ReadOnlyAction({
  isReadOnly,
  children,
  mode = 'hide',
}: ReadOnlyActionProps): React.JSX.Element | null {
  if (!isReadOnly) {
    return children;
  }

  if (mode === 'hide') {
    return null;
  }

  if (!React.isValidElement(children)) {
    return null;
  }

  const childStyle = children.props.style ?? {};

  return React.cloneElement(children, {
    disabled: true,
    'aria-disabled': true,
    tabIndex: -1,
    style: {
      ...childStyle,
      opacity: 0.55,
      cursor: 'not-allowed',
    },
  });
}
