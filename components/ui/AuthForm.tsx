"use client";
import { Section } from 'lucide-react'
import React , {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
 
const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters.",
  }),
})
const AuthForm = ({type}:{type:string}) => {
    const [user,setUser] = useState(null);
    // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }
  return (
    <section className='auth-form'>
        <header className='flex flex-col gap-5 md:gap-y-8'> 
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            {/*link from navbar needed*/ }
            <div className='flex flex-col gap-1 md:gap3'>
                <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>     {user
                    ? 'Link Account'
                    : type === 'sign-in'
                    ? 'Sign In'
                    : 'Sign Up'
                    } 
                    <p className='text-16 font-normal text-gray-600'>
                        {user
                        ? 'Link your existing account.'
                        : 'Please enter your details.'
                        }</p> 
                     </h1>
            </div>
        </header>
        {user ?(
            <div className='flex flex-col gap-4'>
                {/*plaid link component*/}
            </div>
        ): (
        <>
        
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                        <Input placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormDescription>
                        This is your public display name.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit">Submit</Button>
            </form>
            </Form>
  
        </>)}
        </section>
  )
}

export default AuthForm