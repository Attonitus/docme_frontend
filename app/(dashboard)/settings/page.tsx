'use client';
import { useAuthStore } from '@/store/auth.store';
import { useLogoutMutation } from '@/features/useAuthMutations';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, CreditCard, Building2, LogOut, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logoutMutation = useLogoutMutation();
  const org = user?.memberships?.[0]?.organization;
  const role = user?.memberships?.[0]?.role;

  return (
    <div className="p-8 max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gestiona tu cuenta y organización
        </p>
      </div>

      {/* Perfil */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Perfil</CardTitle>
          <CardDescription className="text-xs">
            Tu información personal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg font-semibold bg-indigo-100 text-indigo-700">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs">{role}</Badge>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nombre</Label>
              <Input defaultValue={user?.name} className="h-9" disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input defaultValue={user?.email} className="h-9" disabled />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Para cambiar tu email o contraseña, contacta a soporte.
          </p>
        </CardContent>
      </Card>

      {/* Organización */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Organización</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nombre</Label>
              <Input defaultValue={org?.name} className="h-9" disabled />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Slug</Label>
              <Input defaultValue={org?.slug} className="h-9 font-mono text-sm" disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-foreground">Plan Free</p>
                <Badge variant="secondary" className="text-xs">Activo</Badge>
              </div>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>· 1 bot</li>
                <li>· 3 documentos por bot</li>
                <li>· 100 mensajes / mes</li>
              </ul>
            </div>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Seguridad */}
      <Card className="border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Seguridad</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Contraseña</p>
              <p className="text-xs text-muted-foreground">Última actualización: desconocida</p>
            </div>
            <Button variant="primary" size="sm" className="h-8 text-xs" disabled>
              Cambiar
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-destructive">Cerrar sesión</p>
              <p className="text-xs text-muted-foreground">Cierra tu sesión en este dispositivo</p>
            </div>
            <Button
              variant="destroy"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="h-8 text-xs gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              Salir
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}