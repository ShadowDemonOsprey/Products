import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  LogIn,
  Mail,
  Lock,
  Loader2
} from "lucide-react";

import AuthLayout from "@/components/AuthLayout";


export default function Login() {

  const { login } = useAuth();


  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);



  const handleSubmit = async(e)=>{

    e.preventDefault();

    setError("");
    setLoading(true);


    try{

      const result =
        await api.login(
          email,
          password
        );


      if(result.token){

        login(result);

        window.location.href="/";

      }
      else{

        setError(
          result.error ||
          "Invalid login"
        );

      }


    }
    catch(err){

      setError(
        err.message ||
        "Login failed"
      );

    }
    finally{

      setLoading(false);

    }

  };



return (

<AuthLayout

icon={LogIn}

title="Welcome back"

subtitle="Log in to your ShareLink account"


footer={
<>
Don't have an account?{" "}

<Link
to="/register"
className="text-primary font-medium hover:underline"
>
Create one
</Link>

</>
}

>


{error && (

<div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">

{error}

</div>

)}



<form
onSubmit={handleSubmit}
className="space-y-4"
>


<div className="space-y-2">

<Label>Email</Label>

<div className="relative">

<Mail
className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
/>


<Input

type="email"

placeholder="you@example.com"

value={email}

onChange={
e=>setEmail(e.target.value)
}

className="pl-10 h-12"

required

/>

</div>

</div>




<div className="space-y-2">

<Label>Password</Label>


<div className="relative">

<Lock
className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
/>


<Input

type="password"

placeholder="••••••••"

value={password}

onChange={
e=>setPassword(e.target.value)
}

className="pl-10 h-12"

required

/>

</div>

</div>




<Button

type="submit"

className="w-full h-12 font-medium"

disabled={loading}

>


{
loading ?

<>

<Loader2
className="w-4 h-4 mr-2 animate-spin"
/>

Logging in...

</>

:

"Log in"

}


</Button>


</form>


</AuthLayout>

);

}