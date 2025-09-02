import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Settings, Crown, UserCheck, UserX, Edit, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { EditUserModal } from '@/components/EditUserModal';
import { AddUserModal } from '@/components/AddUserModal';

interface UserData {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  super_admin: boolean;
  created_at: string;
  baby_count: number;
  age_groups_count: number;
}

const SuperAdmin = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase.rpc('get_user_management_data');
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      toast.error('Erro ao carregar usuários: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    setUpdatingUser(userId);
    
    try {
      const { error } = await supabase.rpc('update_user_admin_status', {
        target_user_id: userId,
        new_admin_status: !currentStatus
      });

      if (error) throw error;

      toast.success(
        !currentStatus 
          ? 'Usuário promovido a administrador' 
          : 'Privilégios de administrador removidos'
      );
      
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao atualizar status: ' + error.message);
    } finally {
      setUpdatingUser(null);
    }
  };

  const deleteUser = async (userId: string) => {
    setDeletingUser(userId);
    
    try {
      const { error } = await supabase.rpc('delete_user', {
        target_user_id: userId
      });

      if (error) throw error;

      toast.success('Usuário removido com sucesso');
      fetchUsers();
    } catch (error: any) {
      toast.error('Erro ao remover usuário: ' + error.message);
    } finally {
      setDeletingUser(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando painel super admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold font-heading text-foreground flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              Super Admin
            </h1>
            <p className="text-muted-foreground">Controle total do sistema e usuários</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              <Shield className="w-4 h-4 mr-1" />
              Super Administrador
            </Badge>
            <Badge variant="outline">
              {user?.email}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Usuários</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Administradores</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.is_admin).length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">
                  {users.filter(u => u.baby_count > 0 || u.age_groups_count > 0).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Users Table */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold font-heading text-foreground">
              Gerenciamento de Usuários
            </h2>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bebês</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((userData) => (
                  <TableRow key={userData.id}>
                    <TableCell className="font-medium">
                      {userData.email}
                    </TableCell>
                    <TableCell>
                      {userData.display_name || 'Não informado'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {userData.super_admin && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            <Crown className="w-3 h-3 mr-1" />
                            Super Admin
                          </Badge>
                        )}
                        {userData.is_admin && !userData.super_admin && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                        )}
                        {!userData.is_admin && !userData.super_admin && (
                          <Badge variant="outline">
                            Usuário
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{userData.baby_count} perfis de bebê</p>
                        <p className="text-muted-foreground">
                          {userData.age_groups_count} grupos etários
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(userData.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingUser(userData)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {!userData.super_admin && (
                          <>
                            <Button
                              size="sm"
                              variant={userData.is_admin ? "destructive" : "default"}
                              onClick={() => toggleAdminStatus(userData.id, userData.is_admin)}
                              disabled={updatingUser === userData.id}
                            >
                              {updatingUser === userData.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                              ) : userData.is_admin ? (
                                <UserX className="w-4 h-4" />
                              ) : (
                                <UserCheck className="w-4 h-4" />
                              )}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  disabled={deletingUser === userData.id}
                                >
                                  {deletingUser === userData.id ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o usuário <strong>{userData.email}</strong>? 
                                    Esta ação não pode ser desfeita e todos os dados do usuário serão removidos.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteUser(userData.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
      
      {/* Modals */}
      <EditUserModal
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={fetchUsers}
      />
      
      <AddUserModal
        isOpen={showAddUser}
        onClose={() => setShowAddUser(false)}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default SuperAdmin;