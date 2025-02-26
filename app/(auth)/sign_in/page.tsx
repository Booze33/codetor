import React from 'react'
import AuthForm from '@/components/AuthForm'

const SignIn = () => {
  return (
    <section className="flex-center size-full max-sm:mx-6">
      <AuthForm  type="sign-in" />
    </section>
  )
}

export default SignIn