import { useAuth } from '@/hooks/useAuth';

interface Props {
  permission: string;
  children: React.ReactNode;
}

export default function PermissionGuard({ permission, children }: Props) {
  const { userData } = useAuth();

  if (!userData?.permissions?.[permission]) {
    return null;
  }

  return <>{children}</>;
}
