"use client"
import { parseApiError, useRegisterMutation } from "@/features/useAuthMutations";
import { AuthForm } from "../components/AuthForm";
import { useForm } from "react-hook-form";
import { RegisterFormData, registerSchema } from "@/lib/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "@/components/general/Field";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";

export default function RegisterPage() {

  const mutation = useRegisterMutation();

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>(
    {
      resolver: zodResolver(registerSchema),
      mode: "onBlur"
    });

  return (
    <AuthForm title="Sign Up" footer={{ linkHref: "/login", linkText: "Login", text: "Already have an account?" }}>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <Field
            label="Name"
            placeholder="Juan Pérez"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Field
            label="Business name"
            placeholder="My business SAC"
            error={errors.organizationName?.message}
            {...register('organizationName')}
          />
        </div>

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
          placeholder="Min 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Field
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Error del servidor */}
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
            <><LoaderCircle className="h-4 w-4 animate-spin mr-2" /> Creando cuenta...</>
          ) : (
            'Crear cuenta gratis'
          )}
        </Button>
      </form>
    </AuthForm>
  )
}
