// pages/signup.tsx

import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import React from 'react';
import { useForm } from 'react-hook-form';

export default function Signup() {
  const supabase = useSupabaseClient()
  const session = useSession()

  const { register, handleSubmit, formState: { errors } } = useForm();
  const updateUserData = async (data: any) => {
    // check if user has already signed up. If so, update their data instead of creating a new record
    const { data: userCheck, error } = await supabase
        .from('UserData')
        .select('*')
        .eq('email', session?.user.email)
    
    if (error) {
      console.log(error.message)
    }
    else {
      console.log('userCheck', userCheck)
      console.log('data.length', data.length)
      console.log('data', data)
    }

    // if user has already signed up, update their data
    if (userCheck && data && userCheck.length > 0) {
      console.log('User has some data, updating...')
      const { data: any, error } = await supabase
        .from('UserData')
        .update({ username: data.Username, skills: data['Skills (list)'], talents: data['Other talents'], user_id: session?.user.id})
        .eq('email', session?.user.email)
        .single()

      if (error) {
        console.log('Error: ', error.message)
      } else {
        // return to home screen
        window.location.href = "/";
      }
    }

    // if user has not signed up, create a new record
    if (data && userCheck && userCheck.length === 0) {
      console.log('User has no data, creating...')
      const { data: any, error } = await supabase
        .from('UserData')
        .insert({ email: session?.user.email, username: data.Username, skills: data['Skills (list)'], talents: data['Other talents'], user_id: session?.user.id})
        .select()
        .single()

      if (error) {
        console.log('Error: ', error.message)
      } else {
        // return to home screen
        window.location.href = "/";
      }
    }
  }

  const onSubmit = (data: any) => updateUserData(data);
  console.log(errors);

  return (
    <>
      {session ? (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {/* first time sign-up, make user input skills and username */}
          <style>
            {`
              input {
                margin-bottom: 1rem; padding: 0.5rem;
                width: 100%; border: 1px solid #ddd; border-radius: 5px;
              }
              input[type="submit"] {
                background-color: #0070f3; color: white;
                border: none; padding: 0.5rem;
                border-radius: 5px; cursor: pointer;
              }
              input[type="submit"]:hover {
                background-color: #0053b3;
              }
            `}
          </style>
          <div style={{ flex: 1, paddingRight: '1rem', borderRight: '1px solid #ddd', paddingTop: '1rem', height: '100vh' }}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <input type="text" placeholder="Username" {...register("Username", {required: true})} />
              <input type="text" placeholder="Skills (list)" {...register("Skills (list)", {})} />
              <input type="text" placeholder="Other talents" {...register("Other talents", {})} />
              <input type="submit" />
            </form>
          </div>
          <div style={{ flex: 1, paddingLeft: '1rem', paddingTop: "1rem" }}>
            <p style={{ backgroundColor: '#f0f0f0', padding: '1rem', borderRadius: '5px' }}>Mistral AI text goes here</p>
          </div>
        </div>
      ) : (
        <>
          <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
              <div style={{ width: '100%', height: '100%', maxWidth: '20rem', padding: '2rem', backgroundColor: '#fff', boxShadow: '0 0 10px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '2rem', textAlign: 'center', paddingBottom: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #ddd' }}>
                  Sign Up
                </span>
                <Auth supabaseClient={supabase} 
                    appearance={{ theme: ThemeSupa }} 
                    theme="dark"
                    providers={[]}
                    view="sign_up"
                    />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}