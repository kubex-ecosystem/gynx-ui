import React from 'react';
import { useRBAC } from '../../hooks/useRBAC';

interface CanProps {
  I?: string; // Código de permissão (ex: 'deal.create')
  role?: string; // Código de papel (ex: 'admin')
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Componente declarativo para controle de acesso na UI.
 * IMPORTANTE: Server apenas para melhorar a UX (esconder elementos).
 * A validação real de segurança deve ocorrer sempre no backend (API)
 * através de verificação do JWT em cada requisição.
 */
export const Can: React.FC<CanProps> = ({ I, role, children, fallback = null }) => {
  const { hasPermission, hasRole } = useRBAC();

  let canRender = false;

  if (I) {
    canRender = hasPermission(I);
  }

  if (!canRender && role) {
    canRender = hasRole(role);
  }

  // Se nenhum parâmetro for passado, não bloqueia por padrão (ou poderia bloquear)
  // No nosso caso vamos renderizar se a pessoa passar pelo I ou Role.
  // Se eles nem mandaram nada, renderiza.
  if (!I && !role) {
    canRender = true;
  }

  return <>{canRender ? children : fallback}</>;
};
