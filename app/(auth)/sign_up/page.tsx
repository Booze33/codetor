import React from 'react'
import AuthForm from '@/components/AuthForm'
import { getLoggedInUser } from '@/lib/actions/user.action';

const SignUp = async () => {
  const loggedInUser = await getLoggedInUser();

  console.log(loggedInUser);

  return (
    <section className="flex-center size-full max-sm:mx-6">
      <AuthForm  type="sign-up" />
    </section>
  )
}

export default SignUp