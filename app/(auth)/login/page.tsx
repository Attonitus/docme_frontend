"use client"
import { parseApiError, useLoginMutation } from "@/features/useAuthMutations";
import { AuthForm } from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { LoginFormData, loginSchema } from "@/lib/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/general/Field";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LoginPage() {

  const mutation = useLoginMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>(
    {
      resolver: zodResolver(loginSchema),
      mode: "onBlur"
    });

  return (
    <AuthForm title="Login" footer={{ linkHref: "/register", linkText: "Sign Up", text: "Need to create an account?" }}>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <Field
          label="Email"
          type="email"
          placeholder="your@business.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        {mutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-600">{parseApiError(mutation.error)}</p>
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Ingresando...</>
          ) : (
            'Ingresar'
          )}
        </Button>
      </form>
    </AuthForm>
  )
}
