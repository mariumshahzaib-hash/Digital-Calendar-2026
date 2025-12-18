console.log("JS Connected!");

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://eofjpxzrzjuptlkwxwgm.supabase.co";
const supabaseKey = "sb_publishable_GrTpM2UFNwxGWS3THVm2jQ_8Pz3W3VI";

const supabase = createClient(supabaseUrl , supabaseKey);

const {data: {user}} = await supabase.auth.getUser();
if(user){
  window.location.href = "index.html";
}

async function handleLogin(){
    let signupUsername = document.getElementById("signupUsername");
    let signupPassword = document.getElementById("signupPassword");

    
    const email = `${signupUsername.value.trim()}@planner.app`

    if(!signupUsername.value.trim() || !signupPassword.value.trim()){
        Swal.fire({
            title: "Error!",
            text: "Please Fill All The Fields!",
            icon: "error"
        })
        return;
    }
    const {data: signupSuccess , error: signupError} = await supabase.auth.signUp({
        email,
        password: signupPassword.value.trim()
    });

    if(signupError){
        Swal.fire({
            title: "Error!",
            text: "Error: " + signupError.message,
            icon: "error"
        })
        return;
    }

    Swal.fire({
        title: "Success",
        text: "Signup Successfully!",
        icon: "success"
    });

    setInterval(() => {
        window.location.href = "login.html";
    } , 4000)
}

const userSignup = document.getElementById("userSignup");
userSignup.addEventListener('click' , (e) =>{
    e.preventDefault();
    const key = e.keyCode || e.which
    if(key === 13){
        handleLogin();
        return;
    }
    handleLogin()
})